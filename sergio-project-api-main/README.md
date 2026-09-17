# SergioApi

API REST de una plataforma de cursos en video con suscripción premium.
Catálogo público, reproducción autenticada y control de acceso premium sobre
contenido alojado en [Bunny Stream](https://bunny.net/stream/).

**Stack:** ASP.NET Core 8 · Entity Framework Core 8 · PostgreSQL · JWT Bearer ·
BCrypt · Google OAuth · Bunny Stream

---

## Documentación

| Documento | Contenido |
|---|---|
| [docs/01-modelo-de-datos.md](docs/01-modelo-de-datos.md) | Entidades, relaciones, índices, diagrama ER y trampas del modelo |
| [docs/02-referencia-api.md](docs/02-referencia-api.md) | Los 26 endpoints con auth, request, response y códigos de error |
| [docs/03-autenticacion.md](docs/03-autenticacion.md) | Flujo JWT, rotación de refresh, revocación y rate limiting |
| [docs/04-decisiones-de-diseno.md](docs/04-decisiones-de-diseno.md) | Por qué cada decisión y qué queda pendiente |
| [docs/05-docker.md](docs/05-docker.md) | Contenedores, variables y trampas de despliegue |
| [docs/06-coleccion-bruno.md](docs/06-coleccion-bruno.md) | Cómo probar los endpoints |
| [docs/07-limites-y-abuso.md](docs/07-limites-y-abuso.md) | Rate limiting, límites de tamaño y qué **no** protege la API |
| [docs/08-suscripciones.md](docs/08-suscripciones.md) | Mensualidad con Mercado Pago: flujo, acceso, webhook y pruebas en el sandbox |

---

## Requisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL 14+ (o usa el del `docker compose`)
- Docker 24+ con Compose v2 (opcional)
- Una librería de [Bunny Stream](https://bunny.net/stream/) para los endpoints de video

---

## Arranque rápido con Docker

Levanta la API y su propio PostgreSQL. **No toca tu base de datos local.**

```bash
cp .env.example .env
# Rellena como mínimo POSTGRES_PASSWORD y JWT_SECRET_KEY.
# Genera la clave con:  openssl rand -base64 48
docker compose up --build
```

La API queda en `http://localhost:8081` y las migraciones se aplican solas al arrancar.

---

## Arranque en local

```bash
dotnet restore

# La configuración sensible NO va en appsettings.json: va en User Secrets.
dotnet user-secrets set "ConnectionStrings:DefaultConnection" \
  "Host=localhost;Port=5432;Database=DBsergioAPI;Username=postgres;Password=TU_PASSWORD"
dotnet user-secrets set "Jwt:SecretKey" "$(openssl rand -base64 48)"

dotnet ef database update
dotnet run
```

Swagger queda en `http://localhost:5094/swagger` (solo en `Development`).

> **`appsettings.json` sí está versionado**, pero solo con valores por defecto no
> sensibles. Los secretos van en User Secrets (local) o variables de entorno (Docker).
> `appsettings.Example.json` documenta todas las claves con valores de ejemplo.

---

## Configuración

Cada clave admite dos formas: `Seccion:Clave` en User Secrets y `Seccion__Clave`
como variable de entorno (doble guion bajo).

| Clave | Obligatoria | Descripción |
|---|---|---|
| `ConnectionStrings:DefaultConnection` | Sí | Cadena de conexión a PostgreSQL |
| `Jwt:SecretKey` | Sí | Clave HMAC-SHA256, **mínimo 32 caracteres** |
| `Jwt:Issuer` / `Jwt:Audience` | Sí | Emisor y audiencia del token |
| `Jwt:AccessTokenMinutos` | No (60) | Vigencia del access token |
| `Jwt:RefreshTokenDias` | No (7) | Vigencia del refresh token |
| `Google:ClientId` | Solo para login con Google | ClientId de la app de Google |
| `Bunny:ApiKey` | Para endpoints de video | API key de la librería |
| `Bunny:LibraryId` | Para endpoints de video | Id numérico de la librería |
| `Bunny:CDNHostname` | Para endpoints de video | Hostname del pull zone |
| `Bunny:TokenAuthKey` | **Sí fuera de Development** | Clave de firma de URLs. **Sin ella no hay paywall** |
| `Cors:AllowedOrigins` | No | Array de orígenes permitidos |
| `Red:ProxiesDeConfianza` | No | IPs de proxies. **Vacío = no se cree `X-Forwarded-For`** |
| `Red:RedesDeConfianza` | No | Redes CIDR de proxies de confianza |
| `Kestrel:Limits:*` | No | Tamaño de cuerpo, conexiones y timeouts |
| `Uploads:MaxVideoBytes` | No (2 GB) | Tope de subida de video |
| `MercadoPago:AccessToken` | **Sí fuera de Development** | Del vendedor. Fuera de Development se rechaza uno de prueba (`TEST-`) |
| `MercadoPago:WebhookSecret` | **Sí fuera de Development** | Clave de firma de los webhooks (panel de Mercado Pago) |
| `MercadoPago:BackUrl` | **Sí fuera de Development** | A dónde vuelve el usuario tras pagar. https |
| `MercadoPago:PrecioMensual` | No (99) | Mensualidad. No cambia suscripciones existentes |
| `MercadoPago:DiasGracia` | No (3) | Acceso extra tras un cobro fallido, mientras siga autorizada |
| `RUN_MIGRATIONS` | No (false) | Aplica migraciones al arrancar |
| `DISABLE_HTTPS_REDIRECT` | No (false) | Desactiva la redirección a HTTPS (necesario en contenedor) |

La configuración se **valida al arrancar**: si falta algo obligatorio, la API no
levanta y dice exactamente qué falta. `Bunny:*` y `MercadoPago:*` solo se exigen fuera
de `Development`, para poder trabajar en local sin credenciales. Todas las claves de
Mercado Pago están en [docs/08-suscripciones.md](docs/08-suscripciones.md).

---

## Migraciones

```bash
dotnet ef migrations add NombreDeLaMigracion
dotnet ef migrations script          # revisa el SQL ANTES de aplicar
dotnet ef database update
```

> EF no siempre detecta los renombrados de columna y puede generar
> `DropColumn` + `AddColumn`, que **pierde datos**. Revisa siempre el archivo generado.

---

## Probar los endpoints

Hay una colección de [Bruno](https://www.usebruno.com/) lista para importar en
[`bruno/`](bruno/), con los 26 endpoints, dos entornos y encadenado automático de tokens.
Ver [docs/06-coleccion-bruno.md](docs/06-coleccion-bruno.md).

---

## Estructura

```
Controllers/     Endpoints HTTP; validan permisos y delegan
Services/        Lógica de negocio (Interfaces/ + Implementations/)
Repository/      Acceso a datos sobre EF Core
Models/
  Entities/      Entidades persistidas
  DTOs/          Contratos de entrada y salida (nunca se exponen entidades)
Data/            AppDbContext y configuración del modelo
Migrations/      Historial de migraciones de EF
Middlewares/     Manejo global de excepciones
Configuration/   Opciones tipadas y validadas al arrancar
Exceptions/      Excepciones de dominio que el middleware traduce a códigos HTTP
Utils/           Utilidades transversales
```
