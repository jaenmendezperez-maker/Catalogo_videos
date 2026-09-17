# Límites y protección frente a abuso

## Lo primero: qué NO defiende esta API

Un **DDoS volumétrico distribuido** no se para en la aplicación. Si miles de máquinas
te mandan tráfico a la vez, el enlace se satura antes de que ASP.NET vea una sola
petición. Eso se ataja **antes**, en la capa de red:

- Una CDN o proxy con protección delante (Cloudflare, Fastly y similares).
- Reglas en el firewall o el balanceador.
- Limitación de conexiones por IP en el reverse proxy.

Ninguna configuración de este repositorio sustituye eso. Lo que sí hace la aplicación
es **no derrumbarse ante un cliente abusivo y no amplificar el daño**.

---

## Políticas de rate limiting

Todas parten la cuota por IP del cliente y usan ventana fija sin cola
(`QueueLimit = 0`): se rechaza de inmediato en lugar de acumular peticiones en memoria.

| Política | Dónde se aplica | Límite | Por qué |
|---|---|---|---|
| **global** | Todos los endpoints salvo el webhook | 150 / minuto | Techo general. Antes solo los 4 de auth tenían límite |
| `auth` | `/login`, `/login-google`, `/refresh` | 8 / minuto | Fuerza bruta. `/login` gasta un BCrypt verify (~100 ms) |
| `registro` | `/registro` | 5 / hora | Creación masiva de cuentas; gasta un BCrypt hash |
| `sensible` | `/cambiar-password`; alta, cancelación y sincronización de suscripciones | 5 / minuto | BCrypt (~200 ms) o llamadas a Mercado Pago |
| `escritura` | POST/PUT/DELETE de Admin | 30 / minuto | Llaman a Bunny o a Mercado Pago |
| *ninguna* | `/api/webhooks/mercadopago` | — | Con un túnel o un proxy todo llegaría desde la misma IP. **La barrera es la firma**, validada antes de cualquier acceso a base de datos o a la red. Verificado: 160 peticiones seguidas → 160 × 401, ningún 429 |

Al superar cualquiera: **429** con cabecera `Retry-After` y el formato de error estándar.

> `/cambiar-password` merece política propia porque **el verify se ejecuta antes de
> rechazar**: un bucle con la contraseña equivocada ya quema 100 ms de CPU por
> petición. BCrypt además es síncrono y bloquea un hilo del pool.

### Dos limitaciones que hay que conocer

- **Es en memoria.** Con varias réplicas, el límite efectivo se multiplica por el
  número de instancias. Escalar horizontalmente exige un limitador distribuido.
- **Se reinicia con el proceso.** Un despliegue vacía todas las cuotas.

---

## De dónde sale la «IP del cliente»

Esto decide si el rate limiter sirve para algo, así que conviene entenderlo.

La API particiona por `RemoteIpAddress`. Si se procesan cabeceras reenviadas, ese valor
pasa a ser lo que diga `X-Forwarded-For`, **que el cliente controla**. Confiar en ella
sin restricciones permite mandar una IP distinta en cada petición y obtener cuota nueva
cada vez, lo que anula el límite por completo.

Por eso el comportamiento depende de la configuración:

| `Red:ProxiesDeConfianza` / `Red:RedesDeConfianza` | Comportamiento |
|---|---|
| **Vacíos (por defecto)** | **No** se procesan cabeceras reenviadas. Se usa la IP real de la conexión, que no se puede falsificar |
| Con valores | Se acepta `X-Forwarded-For`, pero **solo** si la conexión viene de un proxy declarado |

La API deja constancia del modo en el log de arranque:

```
Cabeceras reenviadas DESACTIVADAS: el rate limiter usa la IP real de la conexion.
```

### Cuándo hay que rellenarlo

Si pones nginx, Traefik o Cloudflare delante **y no lo declaras**, todas las peticiones
llegarán con la IP del proxy y caerán en la misma partición: el límite se convertiría en
una denegación de servicio contra tus propios usuarios. Declara la IP del proxy o su red:

```jsonc
"Red": {
  "ProxiesDeConfianza": [ "10.0.0.5" ],
  "RedesDeConfianza":   [ "172.16.0.0/12" ]
}
```

En Docker: `RED_PROXY_1` y `RED_CIDR_1` en el `.env`.

> **No lo rellenes «por si acaso».** Declarar una red demasiado amplia equivale a
> aceptar la cabecera de cualquiera y reabre el agujero.

---

## Límites de tamaño y de conexión

Configurados en `Kestrel:Limits` de `appsettings.json` y aplicados explícitamente en
`Program.cs`.

| Límite | Valor | Para qué |
|---|---|---|
| `MaxRequestBodySize` | 1 MB | Techo global del cuerpo. Antes regían los 30 MB por defecto |
| `MaxConcurrentConnections` | 500 | Sin tope, se pueden abrir conexiones hasta agotar descriptores |
| `KeepAliveTimeout` | 1 min | Libera conexiones ociosas |
| `RequestHeadersTimeout` | 15 s | Corta ataques tipo *slowloris*, que mandan cabeceras gota a gota |

> La sección `Kestrel:Limits` **no se enlaza sola** desde configuración: el enlace
> automático de Kestrel cubre endpoints y certificados, no los límites. Por eso
> `Program.cs` la lee a mano. Comprobado: sin ese código, un cuerpo de 2 MB pasaba pese
> a declararse un máximo de 1 MB.

### La subida de video es la excepción

`POST /api/videos` sube su propio techo con el filtro `[LimiteSubida]`, que lee
**`Uploads:MaxVideoBytes`** (2 GB por defecto). Ese es el único sitio donde se ajusta el
tamaño máximo de un video.

Se usa un filtro y no `[RequestSizeLimit]` porque los atributos necesitan una constante
en tiempo de compilación, así que la clave de configuración quedaba muerta: el
`appsettings.json` declaraba 2 GB mientras el atributo imponía 5 GB y nadie leía el
primero.

**Pendiente conocido:** `IFormFile` vuelca el archivo a un temporal en disco antes de
enviarlo a Bunny. N subidas concurrentes ocupan hasta N × el tamaño máximo, y no hay
tope de espacio. La solución sería `MultipartReader` en streaming.

---

## Base de datos

La cadena de conexión del compose fija:

| Parámetro | Valor | Por qué |
|---|---|---|
| `Maximum Pool Size` | 40 | Por defecto son 100, justo el `max_connections` de Postgres: **una sola** instancia lo agotaba y no dejaba sitio ni a `psql` ni a las migraciones |
| `Timeout` | 10 s | Fallar rápido en vez de encolar peticiones esperando conexión |
| `Command Timeout` | 30 s | Una consulta atascada no retiene la conexión indefinidamente |

Ajustable con `DB_MAX_POOL` en el `.env`.

---

## Coste por petición

Lo que conviene tener presente al ajustar los números.

| Operación | Coste |
|---|---|
| BCrypt verify o hash | ~100 ms de CPU, **síncrono** (bloquea un hilo del pool) |
| Listado de videos o cursos | 2 consultas: un `COUNT` y un `SELECT` paginado |
| Detalle de curso | 1 consulta con los videos anidados, **acotados a 50** |
| Cualquier escritura de Admin | 1 llamada HTTP a Bunny (timeout de 10 min) |

El detalle de curso llevaba `Include` sin límite: el coste de una petición anónima lo
elegía quien llamara, escogiendo la colección más poblada. El listado completo sigue
disponible paginado en `GET /api/videos/coleccion/{id}`.

---

## Pendientes

Cosas identificadas y **no** resueltas:

- **Faltan índices** en `videos.Titulo`, `videos.EsPublico`, `videos.FechaSubida` y
  `cursos.Nombre`. Cada `?busqueda=` público es un `LIKE '%x%'` con escaneo completo, y
  el `ORDER BY FechaSubida` ordena la tabla entera. Se ejecuta **dos veces** por
  petición (en el `COUNT` y en el `SELECT`).
- **`AsNoTracking()` no se usa en ningún sitio.** Todas las lecturas de solo lectura
  rastrean entidades y gastan memoria por petición.
- **`Busqueda` sin `[MaxLength]`**: el patrón del `LIKE` puede tener longitud arbitraria.
- **Oráculo temporal en el login**: con un correo inexistente se lanza antes de llegar a
  BCrypt, así que el tiempo de respuesta revela si la cuenta existe.
- **`login-google` gasta un BCrypt** sobre un `Guid` desechable al crear usuarios nuevos.
- **Timeout de 10 minutos del `HttpClient` de Bunny** aplicado a *todas* las llamadas,
  no solo a la subida. Sin reintentos ni cortacircuitos.
- **Sin caché de respuesta**: cada `GET /api/cursos/{id}` repetido vuelve a la base.
- **El healthcheck de Docker apunta a `/api/videos`**, una de las consultas caras, cada
  10 segundos.
