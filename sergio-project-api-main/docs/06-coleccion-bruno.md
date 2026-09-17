# Colección de Bruno

[Bruno](https://www.usebruno.com/) es un cliente de API que guarda las peticiones
como archivos de texto dentro del repositorio, así que viajan con el código y se
versionan como cualquier otra cosa.

La colección está en [`bruno/`](../bruno/) con **33 peticiones**, una por endpoint: los 26
originales, los 6 de suscripciones y un webhook de Mercado Pago simulado y firmado.

## Importar

1. Abre Bruno → **Open Collection**.
2. Elige la carpeta `bruno/` de este repositorio.
3. Arriba a la derecha, selecciona el entorno **Local** o **Docker**.

| Entorno | URL base |
|---|---|
| `Local` | `http://localhost:5099` |
| `Docker` | `http://localhost:8081` |

Ajusta `baseUrl` si usas otros puertos.

## Antes de empezar

Rellena las variables **secretas** del entorno (icono de configuración del entorno).
No se guardan en los archivos `.bru`, así que nunca acaban en git:

| Variable | Para qué |
|---|---|
| `passwordAdmin` | Contraseña de la cuenta con rol Admin |
| `passwordUsuario` | Contraseña de una cuenta normal |
| `googleIdToken` | `id_token` real, solo para probar el login con Google |
| `mpWebhookSecret` | La misma clave que `MercadoPago:WebhookSecret` de la API; la usa el webhook simulado para firmar |

Y las normales, si tu cuenta no coincide con los valores por defecto:
`correoAdmin`, `correoUsuario`.

`05-Suscripciones → Suscribirme` rellena por su cuenta `suscripcionId`, `initPoint`,
`mpTipo` y `mpRecursoId`, así que el webhook simulado queda listo para esa suscripción.
El webhook simulado firma la petición con `crypto-js` en un script: necesita el **modo
Developer** de Bruno.

## Cómo funciona el encadenado

Ejecuta primero **01-Auth → Login**. Su script de post-respuesta guarda el
`accessToken` y el `refreshToken` en el entorno:

```javascript
bru.setEnvVar("accessToken",  res.body.token);
bru.setEnvVar("refreshToken", res.body.refreshToken);
```

El archivo `collection.bru` declara autenticación *bearer* con `{{accessToken}}` a
nivel de colección, así que **todas las peticiones la heredan**. No hay que copiar
tokens a mano en ningún sitio.

`Refrescar token` y `Logout` actualizan esas mismas variables.

## Orden de las carpetas

| Carpeta | Contenido |
|---|---|
| `01-Auth` | Registro, login, login con Google, refresh |
| `02-Usuarios` | Perfil propio y gestión de usuarios (Admin) |
| `03-Videos` | Catálogo, reproducción y gestión (Admin) |
| `04-Cursos` | Colecciones |
| `05-Suscripciones` | Alta, estado, sincronización, cancelación, administración y webhook simulado |
| `06-Sesion` | Cambiar contraseña y logout |

> `06-Sesion` va al final a propósito: cambiar la contraseña revoca **todos** los
> refresh tokens y el logout limpia las variables del entorno. Si estas peticiones
> estuvieran antes, todo lo posterior recibiría 401.

## Ejecutar toda la colección

Con el runner de Bruno, o desde la terminal:

```bash
cd bruno
npx @usebruno/cli run . -r --env Docker --env-var passwordAdmin=TU_PASSWORD
```

Varias peticiones llevan aserciones, incluidas las que comprueban que **no se filtran
identificadores de Bunny** en las respuestas públicas. Son la regresión automática
del control de acceso premium.

### Qué esperar

Con un servidor recién levantado y sin credenciales reales de Bunny:

- **Pasan** todas las de Auth (salvo `login-google`, que da 500 sin `Google:ClientId`),
  las de Usuarios con un token Admin, y las de lectura de Videos y Cursos.
- **Fallan** `crear-video` (necesita `bruno/assets/demo.mp4`, ver abajo) y las que
  llaman a Bunny para escribir: `actualizar-video`, `crear-curso`, `actualizar-curso`.
  Devuelven 500 porque la API de Bunny rechaza credenciales falsas. Con credenciales
  reales funcionan.
- `eliminar-video` y `eliminar-curso` apuntan al id `999` a propósito, para no borrar
  nada al ejecutar la colección entera. Devuelven 404.

## Subir un video

`03-Videos → Crear video` necesita un archivo en `bruno/assets/demo.mp4`.
Esa carpeta está en `.gitignore`: pon ahí cualquier mp4 pequeño. La ruta de `@file()`
es relativa a la raíz de la colección.

## Sintaxis de los archivos

Cada `.bru` es texto plano. Un ejemplo mínimo:

```
meta {
  name: Login
  type: http
  seq: 2
}

post {
  url: {{baseUrl}}/api/auth/login
  body: json
  auth: none
}

body:json {
  {
    "correo": "{{correoAdmin}}",
    "contrasena": "{{passwordAdmin}}"
  }
}
```

Detalles que sorprenden al editarlos a mano:

- El nombre del bloque **es** el verbo HTTP: `get`, `post`, `put`, `delete`.
- `auth: inherit` toma el bearer de `collection.bru`; `auth: none` no manda nada.
- En el bloque del método se escribe `body: multipartForm`, pero el bloque de datos
  se llama `body:multipart-form`. Es así, no es una errata.
- Un `~` delante de una clave la **deshabilita** sin borrarla.
- `seq` controla el orden en el runner.
