# Decisiones de diseño

Por qué las cosas son como son, y qué queda pendiente.

---

## El control de acceso premium tiene dos capas, y la segunda sola no basta

**Contexto.** El contenido vive en Bunny Stream. La URL de reproducción es
`https://iframe.mediadelivery.net/embed/{libreria}/{guid}`. Quien tenga esos dos
datos puede ver el video, sin pasar por la API. Antes, los endpoints públicos
`GET /api/videos` y `GET /api/videos/{id}` devolvían `bunnyVideoId` y
`bunnyLibraryId` en el JSON, y `previewVideoIds` de las colecciones era un CSV de
GUIDs de video. Mientras tanto, la única validación premium del código
(`ObtenerUrlReproduccionAsync`) no estaba expuesta en ningún controller.

**Decisión.** Dos capas:

1. **Token Authentication de Bunny.** Las URLs se firman:
   `token = SHA256_HEX(TokenAuthKey + videoId + expires)`, con caducidad de 2 horas.
   Sin `Bunny:TokenAuthKey`, fuera de `Development`, la API **lanza una excepción**
   en lugar de devolver una URL sin firmar. Antes había un fallback silencioso que
   devolvía exactamente la URL del bypass.
2. **Los identificadores de Bunny salen de los DTOs públicos**, y se añade
   `GET /api/videos/{id}/reproducir` como única vía de acceso.

**Consecuencia, dicha sin adornos.** La capa 2 **no cierra el agujero por sí sola**.
`thumbnailUrl` es `https://{cdn}/{guid}/{archivo}` y contiene el GUID: así es como
Bunny sirve las miniaturas y no hay forma de evitarlo sin poner la API de
intermediaria. Quitar el campo `bunnyVideoId` del JSON es defensa en profundidad,
no el control de acceso.

**Lo que de verdad cierra el paywall es la capa 1.** Con Token Authentication activo
en la librería, conocer el GUID deja de ser suficiente. **Si no activas Token
Authentication en el panel de Bunny y configuras `Bunny:TokenAuthKey`, el contenido
premium sigue siendo accesible para quien tenga el GUID**, por mucho que el JSON ya
no lo muestre.

> Se corrigió además el algoritmo de firma. La implementación anterior mezclaba dos
> esquemas: construía la URL del CDN (`{cdnHostname}/{guid}/playlist.m3u8`) pero la
> firmaba con el algoritmo del embed (SHA256 hex). Bunny rechazaba ese token. Los
> dos esquemas son: embed → `SHA256_HEX(clave + videoId + expires)`;
> CDN pull zone → `Base64URL(MD5(clave + ruta + expires))`. Se adoptó el de embed.

---

## `/reproducir` exige sesión también para los videos gratuitos

**Decisión.** El catálogo es público; la reproducción no. Incluso un video con
`esPremium = false` requiere JWT.

**Por qué.** Un solo punto de control es más fácil de razonar y de auditar que uno
que se comporta distinto según el contenido, y deja preparado el terreno para
registrar visualizaciones por usuario.

**Consecuencia.** Obliga a registrarse para ver contenido gratuito, lo que penaliza
la conversión y el SEO de una landing. Si eso pesa más que la simplicidad, el cambio
es de una línea: `[AllowAnonymous]` en la acción y pasar `usuarioId` como `int?`;
la comprobación premium del servicio ya contempla el caso.

---

## Los borradores devuelven 404, no 403

Un video con `esPublico = false` responde `404` a quien no sea Admin. Un `403`
confirmaría que el recurso existe, que es justo lo que un borrador no debería revelar.

## `IncluirNoPublicados` no se puede enviar desde el cliente

El flag vive en `PaginacionParametrosDto` pero está marcado con `[BindNever]`, así
que el binder de ASP.NET **nunca** lo rellena desde el query string. Lo establece el
controller comparando el rol. Sin esa anotación, mandar
`?incluirNoPublicados=true` habría sido un bypass nuevo en sustitución del anterior.

---

## `InvalidOperationException` ya no se traduce a 400

**Contexto.** El middleware mapeaba `InvalidOperationException` a `400` **con el
mensaje de la excepción**. Pero .NET y EF Core lanzan ese tipo internamente: cuando
una consulta LINQ no se podía traducir a SQL, el cliente recibía un 400 con el texto
completo de la expresión.

**Decisión.** Excepciones propias para los errores de negocio
(`ReglaNegocioException` → 400, `AccesoProhibidoException` → 403,
`ConflictoException` → 409). Todo lo demás es `500` con mensaje genérico y un
`traceId` para correlacionar con el log.

## 403 y 401 significan cosas distintas

`401` es "no sé quién eres"; `403` es "sé quién eres y no te toca". La diferencia
importa al cliente: ante un 401 conviene refrescar el token, ante un 403 refrescar
no arregla nada. Antes, la falta de suscripción premium devolvía 401 y provocaba
ciclos de refresh inútiles.

---

## Las migraciones se aplican al arrancar, tras un flag

`RUN_MIGRATIONS=true` hace que la API aplique las migraciones pendientes al iniciar.
El compose lo activa; en local está desactivado, para que nadie migre una base
ajena por accidente desde su máquina.

**Por qué así y no un servicio `init` aparte.** Un servicio separado necesita una
imagen con el SDK y `dotnet-ef` (unos 800 MB extra) o un bundle precompilado. Es lo
correcto con un pipeline de CI/CD detrás; aquí sería infraestructura que nadie
mantendría. El flag deja la puerta abierta: cuando haya varias réplicas, se pone en
`false` y se pasa a `dotnet ef migrations bundle`, sin tocar código.

**Riesgo asumido:** con más de una réplica arrancando a la vez, dos procesos podrían
intentar migrar simultáneamente. Con una sola instancia no ocurre.

---

## Se conserva la capa Repository

Es una envoltura fina sobre EF Core, que ya implementa Unit of Work y Repository.
Aporta poco y tiene un coste real: `AddAsync` y `UpdateAsync` llaman a
`SaveChanges()` cada uno, así que **no se pueden agrupar operaciones en una
transacción**. Eso es justo lo que haría falta para el problema de consistencia con
Bunny descrito abajo.

Se mantiene porque quitarla es un refactor transversal y quedó fuera del alcance
acordado.

---

## Se rota el refresh token, pero no se detecta su reutilización

Cada `/refresh` revoca el token entregado y emite otro. Lo que **no** hay es
detección de reutilización: si a alguien le roban un refresh token y lo usa, el
usuario legítimo y el atacante se van pisando en silencio.

Lo estándar es que, al recibir un token ya revocado, se revoque **toda la familia**
de tokens de ese usuario y se fuerce un login nuevo. Queda pendiente.

---

## Pendientes conocidos

### Webhook de Bunny

No existe. `Status`, `ProgresoEncoding`, `DuracionSegundos`, `Ancho`, `Alto`,
`Vistas`, `AlmacenamientoTamano` y los campos de thumbnail se insertan en cero o
`null` al crear el video y **nunca se actualizan**. Lo mismo con
`cursos.CantidadVideos` y `TamanoTotal`. `GET /api/videos/{id}/estadisticas`
devuelve ceros.

Por esto **`/reproducir` no comprueba `video.Status`**: filtrar por un estado que
nunca sale de 0 dejaría el endpoint inservible. Cuando exista el webhook, conviene
añadir esa comprobación.

### Sin transacción entre Bunny y la base de datos

Al crear un video se sube primero a Bunny y luego se guarda la fila. Si el
`SaveChanges` falla, queda un video huérfano en Bunny consumiendo almacenamiento
facturable. Al borrar pasa lo simétrico. Arreglarlo bien requiere control
transaccional, que es lo que impide la capa Repository actual.

### Limpieza de refresh tokens caducados

La tabla crece indefinidamente: cada refresh crea una fila y ninguna se borra nunca.
Ya existe el índice sobre `FechaExpiracion` para que la purga sea barata; falta el
proceso que la ejecute.

### Suscripciones: confirmar contra el sandbox de Mercado Pago

Implementadas y probadas contra un Mercado Pago falso (ver
[08-suscripciones.md](08-suscripciones.md)). El acceso premium ya caduca solo, porque se
decide por `FechaVencimientoPremium` en cada petición.

Pero Mercado Pago **no documenta** varias cosas de las que depende el código: si el primer
cobro del flujo por redirección es inmediato, si acepta un `start_date` futuro, si se cancela
con `cancelled` o `canceled`, si un enlace de pago cancelado sigue siendo pagable, los campos
reales de cobros y pagos. Se construyó a la defensiva, pero hay que confirmarlo en el sandbox
**antes de cobrar de verdad**. La lista completa y los pasos están en la sección "Fase 0" de
[08-suscripciones.md](08-suscripciones.md).

### Rate limiter en memoria

No sirve con varias instancias. Ver [03-autenticacion.md](03-autenticacion.md).

### Inconsistencia de nombres en el contrato

`/login` devuelve `token` y `/refresh` devuelve `accessToken`. Unificarlo rompería
a los clientes existentes.
