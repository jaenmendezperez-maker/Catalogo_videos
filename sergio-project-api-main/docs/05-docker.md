# Docker

Dos servicios: la API y su propio PostgreSQL. **No toca tu PostgreSQL local.**

```bash
cp .env.example .env
# Rellena al menos POSTGRES_PASSWORD y JWT_SECRET_KEY
docker compose up --build
```

| Servicio | Imagen | Puerto host | Puerto contenedor |
|---|---|---|---|
| `api` | build local, multi-stage | 8081 | 8080 |
| `db` | `postgres:16-alpine` | 5434 | 5432 |

Los puertos del host son configurables con `API_PUERTO_HOST` y `POSTGRES_PUERTO_HOST`.

> **Por qué 5434 y no 5432.** En esta máquina el 5432 lo ocupa el PostgreSQL local
> y el 5433 también estaba tomado. Si mapeas a un puerto ocupado, `docker compose up`
> falla con `Bind for 0.0.0.0:XXXX failed: port is already allocated`. Comprueba con
> `ss -ltn | grep :5434` antes de cambiarlo.

## El Dockerfile

Multi-stage: se compila con la imagen del SDK y se ejecuta sobre la de runtime, que
es mucho más pequeña. El `csproj` se copia antes que el código para que la capa de
`restore` se cachee y no se rehaga en cada cambio de código.

Corre como usuario sin privilegios (`$APP_UID`, uid 64198, que las imágenes de .NET 8
ya incluyen). Se instala `curl` para el healthcheck **antes** de bajar de privilegios.

`appsettings.json` **no** está en `.dockerignore`: es la base de configuración
(Issuer, Audience, niveles de log) que las variables de entorno sobrescriben campo
a campo. Lo que sí se excluye es `appsettings.Development.json` y `.env`.

## Variables de entorno

.NET mapea `Seccion:Clave` a `Seccion__Clave` (doble guion bajo). Los arrays van por
índice: `Cors__AllowedOrigins__0`, `__1`, etc.

Las variables críticas usan la sintaxis `${VAR:?mensaje}`, que **aborta el `up`** si
faltan en lugar de arrancar en silencio con un secreto vacío.

## Trampas que ya están resueltas, y por qué

### `UseHttpsRedirection` dentro de un contenedor

El contenedor escucha solo HTTP en el 8080. Con la redirección a HTTPS activa y sin
`ASPNETCORE_HTTPS_PORTS`, ASP.NET responde `307` hacia un puerto que no existe y
**ninguna petición funciona**, sin ningún error claro en el log. Es el fallo número
uno al contenerizar una API de .NET.

Por eso el Dockerfile fija `DISABLE_HTTPS_REDIRECT=true`. En producción real, el TLS
se termina en el reverse proxy de delante.

### `X-Forwarded-For` y el rate limiter

Detrás de un proxy, `RemoteIpAddress` es la IP **del proxy**, no la del cliente. Sin
tratar las cabeceras reenviadas, todas las peticiones caen en la misma partición del
rate limiter y el límite se convierte en una denegación de servicio contra tus propios
usuarios.

Pero lo contrario es peor: **confiar en `X-Forwarded-For` de cualquiera anula el rate
limiter por completo**, porque basta mandar una IP distinta en cada petición para tener
cuota nueva. Se comprobó: 15 intentos de login rotando la cabecera pasaban todos con la
cuota de la IP real ya agotada.

Por eso el comportamiento es explícito y seguro por defecto:

| Configuración | Comportamiento |
|---|---|
| `RED_PROXY_1` y `RED_CIDR_1` vacíos (por defecto) | No se procesan cabeceras reenviadas. Se usa la IP real de la conexión |
| Con valores | Se acepta `X-Forwarded-For`, **solo** si la conexión viene de un proxy declarado |

El modo elegido aparece en el log de arranque:

```
Cabeceras reenviadas DESACTIVADAS: el rate limiter usa la IP real de la conexion.
```

**Si pones nginx, Traefik o Cloudflare delante, declara su IP o su red** en el `.env`:

```bash
RED_PROXY_1=10.0.0.5
RED_CIDR_1=172.16.0.0/12
```

Si no lo haces, todo el tráfico contará como una sola IP y se bloqueará entre sí.
Si lo rellenas con una red demasiado amplia, reabres el agujero. Ver
[07-limites-y-abuso.md](07-limites-y-abuso.md).

### Persistencia de datos

El volumen `sergio_pgdata` se monta en `/var/lib/postgresql/data`. `docker compose
down` conserva los datos; **`docker compose down -v` los borra**.

Verificado: crear un usuario, `down`, `up`, y el login sigue funcionando.

> Si algún día subes a `postgres:18`, comprueba la ruta de `PGDATA` en esa imagen
> (`docker run --rm postgres:18-alpine sh -c 'echo $PGDATA'`). Cambió respecto a
> versiones anteriores, y un volumen montado en la ruta equivocada hace que la base
> arranque vacía en cada reinicio: parece funcionar hasta que reinicias.

## Comandos habituales

```bash
docker compose up -d --build          # levantar en segundo plano
docker compose logs -f api            # seguir los logs de la API
docker compose ps                     # estado y salud
docker compose exec db psql -U sergio -d DBsergioAPI   # consola SQL
docker compose restart api            # reiniciar solo la API
docker compose down                   # parar, CONSERVANDO los datos
docker compose down -v                # parar y BORRAR el volumen
```

## Migraciones

El compose fija `RUN_MIGRATIONS=true`, así que la API aplica las migraciones
pendientes al arrancar y `docker compose up` deja el entorno listo de una vez.
Se ve en el log:

```
RUN_MIGRATIONS activo: aplicando migraciones pendientes...
Applying migration '20260330014006_InitialCreate'.
...
Migraciones aplicadas.
```

Cuando haya más de una réplica, pon el flag en `false` y aplica las migraciones desde
el pipeline con `dotnet ef migrations bundle`. Ver
[04-decisiones-de-diseno.md](04-decisiones-de-diseno.md).

## Healthchecks

`db` usa `pg_isready`. `api` consulta `GET /api/videos`, que es un endpoint público
y sin efectos secundarios. La API no arranca hasta que la base está sana
(`depends_on: condition: service_healthy`).

El healthcheck de la API **no** comprueba la base de datos a propósito: si la base
cayera, marcar la API como *unhealthy* la metería en un bucle de reinicios, cuando lo
correcto es que siga en pie devolviendo errores.
