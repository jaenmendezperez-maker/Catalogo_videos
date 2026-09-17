# Referencia de la API

Base: `/api`. Todas las respuestas son JSON.

## Formato de error

**Todos** los errores comparten la misma forma, incluidos los de validación y los del
rate limiter:

```json
{
  "exito": false,
  "mensaje": "Ya existe una cuenta con ese correo.",
  "codigo": 400,
  "traceId": "0HN7Q2K5V8J3P:00000001"
}
```

Los errores de validación añaden `errores` con el detalle por campo:

```json
{
  "exito": false,
  "mensaje": "Los datos enviados no son válidos.",
  "codigo": 400,
  "traceId": "0HN7Q2K5V8J3P:00000001",
  "errores": { "Correo": ["El formato del correo no es válido"] }
}
```

`errores` se omite cuando no aplica. `traceId` permite correlacionar con los logs del
servidor; en los 500 el mensaje es genérico a propósito y el detalle queda solo en el log.

> Antes los errores de validación salían con el formato `ProblemDetails` de ASP.NET
> (`type`, `title`, `status`, `errors`), distinto del resto. Un cliente que leyera
> `errors.Correo` debe pasar a `errores.Correo`.

| Código | Significado |
|---|---|
| 400 | Regla de negocio o validación del modelo |
| 401 | Sin sesión, o credenciales incorrectas |
| 403 | Autenticado, pero sin permiso (rol o suscripción) |
| 404 | No existe, o existe y no puedes verlo |
| 409 | Conflicto (recurso duplicado) |
| 413 | Cuerpo demasiado grande (techo global: 1 MB; subida de video: 2 GB) |
| 415 | `Content-Type` no soportado |
| 429 | Demasiadas peticiones. Incluye cabecera `Retry-After` |
| 500 | Error interno |
| 502 | Un servicio externo (Mercado Pago, Bunny) respondió con error o no está configurado |
| 504 | Un servicio externo no respondió a tiempo |

Todos los endpoints salvo el webhook de Mercado Pago están sujetos a un límite de 150
peticiones por minuto y por IP, con límites más estrictos en autenticación y escritura.
Ver [07-limites-y-abuso.md](07-limites-y-abuso.md).

Los endpoints de suscripciones (`/api/suscripciones/*`) y el webhook de Mercado Pago
(`/api/webhooks/mercadopago`) están documentados en [08-suscripciones.md](08-suscripciones.md).

---

## Auth · `/api/auth`

| Método | Ruta | Auth | Límite |
|---|---|---|---|
| POST | `/registro` | — | 5/hora |
| POST | `/login` | — | 8/min |
| POST | `/login-google` | — | 8/min |
| POST | `/refresh` | — | 8/min |
| POST | `/logout` | JWT | — |
| POST | `/cambiar-password` | JWT | — |

### POST `/api/auth/registro`

```json
{ "nombre": "Ana", "correo": "ana@example.com", "contrasena": "Passw0rd", "telefono": "5512345678" }
```

La contraseña exige mínimo 6 caracteres con mayúscula, minúscula y número.
El correo se normaliza a minúsculas antes de comprobar duplicados.

**200** → `UsuarioAutenticadoDto`:

```json
{
  "id": 4, "nombre": "Ana", "correo": "ana@example.com", "telefono": "5512345678",
  "fotoPerfil": null, "rol": "Usuario", "esPremium": false,
  "token": "eyJhbGciOi...", "refreshToken": "SIr7GVLlh-rw...",
  "fechaExpiracion": "2026-09-05T23:10:25+00:00"
}
```

Errores: `400` correo ya registrado · `409` colisión concurrente · `429`.

### POST `/api/auth/login`

```json
{ "correo": "ana@example.com", "contrasena": "Passw0rd" }
```

**200** → mismo `UsuarioAutenticadoDto`. `401` con credenciales incorrectas
(el mensaje no distingue si falla el correo o la contraseña).

### POST `/api/auth/login-google`

```json
{ "idToken": "eyJhbGciOi..." }
```

`401` si el token es inválido o el correo no está verificado en Google.
`500` si el servidor no tiene `Google:ClientId` configurado.

### POST `/api/auth/refresh`

```json
{ "refreshToken": "SIr7GVLlh-rw..." }
```

**200** → `{ "accessToken": "...", "refreshToken": "...", "fechaExpiracion": "..." }`

El refresh token rota: el enviado queda revocado. Reutilizarlo devuelve `401`.

### POST `/api/auth/logout`

Requiere JWT. Body `{ "refreshToken": "..." }`. **204** siempre, exista el token o no.
Solo revoca si el token pertenece al usuario autenticado.

### POST `/api/auth/cambiar-password`

Requiere JWT.

```json
{ "contrasenaActual": "Passw0rd", "contrasenaNueva": "NuevaP4ss", "confirmarContrasena": "NuevaP4ss" }
```

**204**. Revoca **todos** los refresh tokens del usuario. `401` si la actual no coincide.

---

## Usuarios · `/api/usuarios`

Todos requieren JWT.

| Método | Ruta | Rol |
|---|---|---|
| GET | `/perfil` | cualquiera |
| PUT | `/perfil` | cualquiera |
| GET | `/` | Admin |
| GET | `/{id}` | Admin |
| GET | `/{id}/detalle` | Admin |
| PUT | `/{id}` | Admin |
| DELETE | `/{id}` | Admin |

### GET `/api/usuarios/perfil`

**200** → `{ id, nombre, correo, telefono, fotoPerfil, esPremium, fechaVencimientoPremium, fechaRegistro }`

### PUT `/api/usuarios/perfil`

Todos los campos opcionales: `nombre`, `correo`, `telefono`, `fotoPerfil`.
Cambiar el correo **revoca todas las sesiones**. Un `rolId` enviado aquí se ignora:
el DTO de perfil propio no lo contiene.

### GET `/api/usuarios?pagina=1&porPagina=10`

`pagina` se fuerza a un mínimo de 1; `porPagina` se acota a `[1, 50]`.

**200** → `{ datos: [...], total, pagina, porPagina, totalPaginas, haySiguiente, hayAnterior }`

### GET `/api/usuarios/{id}/detalle`

Incluye `historialSuscripciones` y contadores de actividad, hoy **siempre vacíos**:
el módulo de suscripciones no está implementado.

### PUT `/api/usuarios/{id}`

Como el de perfil, más `rolId` (1 Admin, 2 Usuario, 3 Educador). Un `rolId`
inexistente devuelve `400` con mensaje claro.

### DELETE `/api/usuarios/{id}`

**204**. `400` si intentas borrar tu propia cuenta o una cuenta con rol Admin.

---

## Videos · `/api/videos`

| Método | Ruta | Auth |
|---|---|---|
| GET | `/` | pública |
| GET | `/{id}` | pública |
| GET | `/coleccion/{videoCursoId}` | pública |
| GET | `/{id}/reproducir` | **JWT** |
| GET | `/{id}/estadisticas` | Admin |
| POST | `/` | Admin |
| PUT | `/{id}` | Admin |
| DELETE | `/{id}` | Admin |

> **Los endpoints públicos no devuelven `bunnyVideoId` ni `bunnyLibraryId`.**
> Con esos dos datos se podía construir la URL de embed y ver cualquier video
> premium sin cuenta. Ver [04-decisiones-de-diseno.md](04-decisiones-de-diseno.md).

### GET `/api/videos?pagina=1&porPagina=20&busqueda=teoria`

Solo devuelve videos con `esPublico = true`. El parámetro `incluirNoPublicados=true`
**solo surte efecto con un token de rol Admin**; con cualquier otro se ignora.

**200** → páginado de:

```json
{
  "id": 3, "titulo": "Introducción", "descripcion": "...",
  "thumbnailUrl": "https://tu-zona.b-cdn.net/{guid}/thumb.jpg",
  "thumbnailBlurhash": "...", "duracionSegundos": 300,
  "esPremium": true, "esPublico": true, "status": 3, "progresoEncoding": 100,
  "vistas": 0, "categoria": "demo", "nombreColeccion": "Curso de prueba"
}
```

### GET `/api/videos/{id}`

`404` si no existe **o** si `esPublico = false` y no eres Admin. Se devuelve 404 en
lugar de 403 para no revelar que el borrador existe.

### GET `/api/videos/{id}/reproducir`

**Requiere JWT.** Es la única vía legítima para acceder al contenido.

**200** →

```json
{
  "id": 3, "titulo": "Introducción",
  "url": "https://iframe.mediadelivery.net/embed/123456/{guid}?token=81a5...&expires=1788646249",
  "expiraEn": "2026-09-05T22:10:25+00:00",
  "duracionSegundos": 300, "esPremium": true,
  "resolucionesDisponibles": "720p,1080p", "subtitulos": []
}
```

| Código | Cuándo |
|---|---|
| 401 | Sin sesión |
| 403 | Autenticado pero sin suscripción premium, sobre un video premium |
| 404 | No existe, o es borrador y no eres Admin |
| 500 | El servidor no tiene `Bunny:TokenAuthKey` y no está en Development |

La URL va firmada y caduca a las 2 horas.

### POST `/api/videos`

`multipart/form-data` con los campos de `CrearVideoDto` más `archivo`.
Límite de 5 GB, fijado solo en este endpoint. `400` si `videoCursoId` no existe.

### PUT `/api/videos/{id}`

Todos los campos opcionales. Solo llama a Bunny si hay algo que actualizar allí.

### DELETE `/api/videos/{id}`

**204**. Borra primero en Bunny y después en la base de datos, sin transacción que
englobe ambos pasos.

---

## Cursos · `/api/cursos`

| Método | Ruta | Auth |
|---|---|---|
| GET | `/` | pública |
| GET | `/{id}` | pública |
| POST | `/` | Admin |
| PUT | `/{id}` | Admin |
| DELETE | `/{id}` | Admin |

Los DTOs públicos **no** exponen `bunnyCollectionId`, `bunnyLibraryId` ni
`previewVideoIds` (este último era un CSV de GUIDs de video, la misma fuga).

En `GET /api/cursos/{id}`, los videos anidados se filtran por `esPublico`:
un Admin ve los borradores, cualquier otro no.

**Los videos anidados están limitados a los 50 más recientes.** Antes se devolvían
todos, así que el coste de una petición anónima lo elegía quien llamara escogiendo la
colección más poblada. Para el listado completo, usa el endpoint paginado
`GET /api/videos/coleccion/{id}`.

`cantidadVideos` y `tamanoTotal` son contadores denormalizados que **no se
actualizan**: dependen del webhook de Bunny, aún sin implementar.

Borrar un curso **no borra sus videos**: quedan sin colección (`SET NULL`).

---

## Cambios de contrato

Si tenías un cliente contra la versión anterior, esto es lo que cambió.

| DTO | Campo | Cambio |
|---|---|---|
| `UsuarioAutenticadoDto` | `refreshToken` | **Añadido**. Antes no se devolvía y era imposible renovar la sesión |
| `VideoVistasPreviaDto` | `bunnyVideoId` | **Eliminado** |
| `VideoVistasPreviaDto` | `thumbnailFileName` → `thumbnailUrl` | Ahora es la URL completa |
| `VideoDetalleDto` | `bunnyVideoId`, `bunnyLibraryId` | **Eliminados** |
| `VideoDetalleDto` | `thumbnailFileName` → `thumbnailUrl` | Ahora es la URL completa |
| `VideoCursoVistasPreviaDto` | `bunnyCollectionId`, `previewVideoIds` | **Eliminados** |
| `VideoCursoDetalleDto` | `bunnyCollectionId`, `bunnyLibraryId`, `previewVideoIds` | **Eliminados** |
| `ActualizarVideoDto` | `esPremium` | Ya no es obligatorio; el PUT admite updates parciales |
| `POST /api/auth/registro` | — | Devuelve `200` en vez de `201` |
| Errores de validación | `errors` → `errores` | Formato unificado; ya no es `ProblemDetails` |
| `VideoCursoDetalleDto` | `videos` | Limitado a los 50 más recientes |

Para reproducir, sustituye la construcción manual de la URL de Bunny por una
llamada a `GET /api/videos/{id}/reproducir`.

`VideoEstadisticasDto` (solo Admin) conserva `bunnyVideoId`: es la vía por la que
un administrador obtiene el GUID cuando lo necesita.
