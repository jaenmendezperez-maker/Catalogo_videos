using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SergioApi.Configuration;
using SergioApi.Data;
using SergioApi.Models.DTOs;
using SergioApi.Middlewares;
using SergioApi.Repositories;
using SergioApi.Services.Implementations.Usuarios;
using SergioApi.Services.Interfaces;
using SergioApi.Repositories.Videos;
using SergioApi.Services.Interfaces.Videos;
using SergioApi.Services.Implementations.Videos;
using SergioApi.Services.Implementations.Videos.Cursos;
using SergioApi.Services.Interfaces.Videos.Cursos;

var builder = WebApplication.CreateBuilder(args);

// ── Configuracion fuertemente tipada y validada ──────────────────
// Se valida al ARRANCAR. Antes, una clave ausente producia un 500 silencioso
// en la primera peticion porque la lectura era diferida y usaba `!`.
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart();

// Bunny solo se exige fuera de Development: asi se puede levantar la API en local
// sin credenciales de Bunny, pero nunca desplegarla a medio configurar.
var bunnyOptions = builder.Services.AddOptions<BunnyOptions>()
    .Bind(builder.Configuration.GetSection(BunnyOptions.SectionName))
    .ValidateDataAnnotations();
if (!builder.Environment.IsDevelopment())
    bunnyOptions.ValidateOnStart();

builder.Services.Configure<GoogleOptions>(
    builder.Configuration.GetSection(GoogleOptions.SectionName));

builder.Services.Configure<RedOptions>(
    builder.Configuration.GetSection(RedOptions.SectionName));

// ── Mercado Pago ────────────────────────────────────────────────
// Igual que Bunny: obligatorio fuera de Development, opcional en local. Ademas, dos
// reglas que un error de configuracion podria saltarse en produccion.
var mercadoPagoOptions = builder.Services.AddOptions<MercadoPagoOptions>()
    .Bind(builder.Configuration.GetSection(MercadoPagoOptions.SectionName))
    .Validate(o => builder.Environment.IsDevelopment() || !o.EsCredencialDePrueba,
        "MercadoPago:AccessToken es una credencial de PRUEBA (TEST-) fuera de Development.")
    .Validate(o => builder.Environment.IsDevelopment()
                   || (o.TipoFrecuencia == "months" && o.PeriodoFrecuencia == 1),
        "Fuera de Development la suscripcion debe ser mensual (TipoFrecuencia=months, PeriodoFrecuencia=1).");

// Las DataAnnotations solo fuera de Development. Registradas siempre, se ejecutarian
// en CADA lectura de las opciones: sin credenciales en local, hasta
// GET /api/suscripciones/mia responderia 500. En Development, el alta comprueba
// MercadoPagoOptions.EstaConfigurado y responde con un error claro.
if (!builder.Environment.IsDevelopment())
    mercadoPagoOptions.ValidateDataAnnotations().ValidateOnStart();

// Timeout corto por llamada: el webhook tiene que responder en menos de 22 s y hace
// varias. Un timeout se traduce a ServicioExternoException (504), no a un 500 generico.
builder.Services.AddHttpClient<
    SergioApi.Services.Interfaces.Suscripciones.IMercadoPagoClient,
    SergioApi.Services.Implementations.Suscripciones.MercadoPagoClient>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddScoped<
    SergioApi.Repositories.Suscripciones.ISuscripcionRepository,
    SergioApi.Repositories.Suscripciones.SuscripcionRepository>();
builder.Services.AddScoped<
    SergioApi.Services.Interfaces.Suscripciones.ISincronizadorSuscripciones,
    SergioApi.Services.Implementations.Suscripciones.SincronizadorSuscripciones>();
builder.Services.AddScoped<
    SergioApi.Services.Interfaces.Suscripciones.ISuscripcionService,
    SergioApi.Services.Implementations.Suscripciones.SuscripcionService>();

// Recupera webhooks perdidos y caduca pendientes abandonadas. El acceso NO depende de
// el: se decide por fecha en cada peticion.
builder.Services.AddHostedService<
    SergioApi.Services.Implementations.Suscripciones.ConciliacionSuscripcionesService>();

// ── Limites de Kestrel ──────────────────────────────────────────
// La seccion "Kestrel:Limits" NO se enlaza sola desde configuracion (el enlace
// automatico cubre Endpoints y certificados, no los limites), asi que hay que
// leerla a mano. Comprobado: sin esto, un cuerpo de 2 MB se aceptaba pese a
// declarar un maximo de 1 MB en appsettings.json.
builder.WebHost.ConfigureKestrel((contexto, opciones) =>
{
    var limites = contexto.Configuration.GetSection("Kestrel:Limits");

    // Techo global del cuerpo. El endpoint de subida lo sube para si mismo
    // con [LimiteSubida]; el resto de la API se queda con este.
    opciones.Limits.MaxRequestBodySize =
        limites.GetValue<long?>("MaxRequestBodySize") ?? 1_048_576;

    // Sin tope, un atacante puede abrir conexiones hasta agotar los descriptores.
    opciones.Limits.MaxConcurrentConnections =
        limites.GetValue<long?>("MaxConcurrentConnections") ?? 500;

    opciones.Limits.KeepAliveTimeout =
        limites.GetValue<TimeSpan?>("KeepAliveTimeout") ?? TimeSpan.FromMinutes(1);

    // Corta los ataques tipo slowloris, que abren conexiones y mandan las
    // cabeceras gota a gota para mantenerlas ocupadas.
    opciones.Limits.RequestHeadersTimeout =
        limites.GetValue<TimeSpan?>("RequestHeadersTimeout") ?? TimeSpan.FromSeconds(15);
});

// ── Base de datos (PostgreSQL) ──────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "Falta ConnectionStrings:DefaultConnection. Configurala con User Secrets " +
        "(dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" \"...\") " +
        "o con la variable de entorno ConnectionStrings__DefaultConnection.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ── Repositorios ────────────────────────────────────────────────
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

// Bunny — Videos
builder.Services.AddScoped<IVideoRepository,      VideoRepository>();
builder.Services.AddScoped<IVideoCursoRepository, VideoCursoRepository>();

// ── Servicios ───────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService,    AuthService>();
builder.Services.AddScoped<IJwtService,     JwtService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();

// ── JWT ─────────────────────────────────────────────────────────
var jwtConfig = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
                ?? new JwtOptions();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer           = true,
        ValidateAudience         = true,
        ValidateLifetime         = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer              = jwtConfig.Issuer,
        ValidAudience            = jwtConfig.Audience,
        IssuerSigningKey         = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtConfig.SecretKey)),
        ClockSkew = TimeSpan.Zero,
    };
});

// Bunny — HttpClient con tiempo de espera
builder.Services.AddHttpClient<IBunnyService, BunnyService>(client =>          // TENER EN CUENTA QUE EXISTE TIEMPO DE ESPERA, PARA VIDEOS GRANDES O CONEXIONES LENTAS
{
    client.Timeout = TimeSpan.FromMinutes(10); // videos grandes pueden tardar en subirse
});

// Bunny — Servicios de negocio
builder.Services.AddScoped<IVideoService,      VideoService>();
builder.Services.AddScoped<IVideoCursoService, VideoCursoService>();

builder.Services.AddAuthorization();

// ── CORS ────────────────────────────────────────────────────────
// Los origenes salen de configuracion (Cors:AllowedOrigins). Nunca AllowAnyOrigin
// junto con credenciales: el navegador lo rechaza y ademas seria inseguro.
const string CorsPolicy = "FrontendPolicy";
var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
    {
        if (origenesPermitidos.Length > 0)
        {
            policy.WithOrigins(origenesPermitidos)
                  .AllowAnyHeader()
                  .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  // Para que el front pueda leer el Retry-After de un 429.
                  .WithExposedHeaders("Retry-After")
                  .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
        }
        else
        {
            // Sin origenes configurados: solo apps nativas / herramientas como Bruno,
            // que no mandan Origin y por tanto no dependen de CORS.
            policy.WithOrigins("https://localhost")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

// ── Confianza en cabeceras reenviadas ───────────────────────────
// Decide de donde sale la "IP del cliente" que usa el rate limiter.
// Si no hay proxies declarados NO se procesan cabeceras reenviadas: se usa la IP
// real de la conexion, que el cliente no puede falsificar. Confiar en
// X-Forwarded-For de cualquiera permitia saltarse el limite entero mandando una IP
// distinta en cada peticion.
var redConfig = builder.Configuration.GetSection(RedOptions.SectionName).Get<RedOptions>()
                ?? new RedOptions();

if (redConfig.HayProxiesDeConfianza)
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

        // Partimos de listas vacias y anadimos SOLO lo declarado: asi la cabecera
        // se acepta unicamente cuando la conexion viene de un proxy conocido.
        options.KnownProxies.Clear();
        options.KnownNetworks.Clear();

        foreach (var proxy in redConfig.ParsearProxies())
            options.KnownProxies.Add(proxy);

        foreach (var (prefijo, longitud) in redConfig.ParsearRedes())
            options.KnownNetworks.Add(new IPNetwork(prefijo, longitud));
    });
}

// ── Rate limiting ───────────────────────────────────────────────
// La clave de particion es la IP del cliente. Tras la configuracion de arriba,
// solo puede venir de una cabecera si hay un proxy de confianza por delante.
static string ClaveParticionPorIp(HttpContext ctx) =>
    ctx.Connection.RemoteIpAddress?.ToString() ?? "ip-desconocida";

static RateLimitPartition<string> VentanaPorIp(HttpContext ctx, int permitidas, TimeSpan ventana) =>
    RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: ClaveParticionPorIp(ctx),
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitidas,
            Window      = ventana,
            QueueLimit  = 0,   // rechazar rapido en vez de acumular peticiones en memoria
        });

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Techo para TODA la API, incluidos los endpoints publicos de catalogo.
    // Antes solo los 4 de auth tenian limite y los otros 22 estaban sin freno:
    // 100 peticiones concurrentes a /api/videos devolvian 100 respuestas 200.
    // El numero es deliberadamente holgado para no molestar al uso normal.
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        // El webhook de Mercado Pago queda fuera: con un tunel o un proxy todas sus
        // peticiones llegan desde la misma IP y compartirian cuota. Su barrera es la
        // firma, que se valida antes de cualquier E/S. Se excluye aqui por la ruta, sin
        // depender de como trate [DisableRateLimiting] al limitador global.
        ctx.Request.Path.StartsWithSegments("/api/webhooks/mercadopago")
            ? RateLimitPartition.GetNoLimiter("webhook-mercadopago")
            : VentanaPorIp(ctx, permitidas: 150, ventana: TimeSpan.FromMinutes(1)));

    // login / login-google / refresh: ventana corta, tolera reintentos legitimos.
    options.AddPolicy("auth", ctx => VentanaPorIp(ctx, 8, TimeSpan.FromMinutes(1)));

    // registro: crear cuentas en masa es mas caro de tolerar, ventana larga.
    options.AddPolicy("registro", ctx => VentanaPorIp(ctx, 5, TimeSpan.FromHours(1)));

    // cambiar-password gasta ~200 ms de BCrypt por llamada (verify + hash) y el
    // verify se ejecuta ANTES de rechazar, asi que un bucle con la contrasena
    // equivocada ya quema CPU. BCrypt es sincrono y bloquea un hilo del pool.
    // Ventana de 1 minuto: suficiente para frenar el abuso sin castigar a quien
    // se equivoca al teclear su contrasena actual un par de veces.
    options.AddPolicy("sensible", ctx => VentanaPorIp(ctx, 5, TimeSpan.FromMinutes(1)));

    // Escrituras de administracion: llaman a Bunny, que cuesta dinero.
    options.AddPolicy("escritura", ctx => VentanaPorIp(ctx, 30, TimeSpan.FromMinutes(1)));

    // Mismo formato de error que el resto de la API.
    options.OnRejected = async (context, token) =>
    {
        var response = context.HttpContext.Response;
        response.StatusCode  = StatusCodes.Status429TooManyRequests;
        response.ContentType = "application/json";

        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var reintentarEn))
            response.Headers.RetryAfter = ((int)reintentarEn.TotalSeconds).ToString();

        await response.WriteAsJsonAsync(new RespuestaErrorDto
        {
            Mensaje = "Demasiadas peticiones. Intenta de nuevo mas tarde.",
            Codigo  = StatusCodes.Status429TooManyRequests,
            TraceId = context.HttpContext.TraceIdentifier,
        }, token);
    };
});

// ── Controllers ─────────────────────────────────────────────────
builder.Services.AddControllers();

// Omitir las propiedades nulas al serializar. Sin esto, RespuestaErrorDto sacaba
// "errores": null en todos los errores que no son de validacion.
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition =
        System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// Los errores de validacion los genera [ApiController] ANTES de que se ejecute la
// accion, asi que no pasan por GlobalExceptionMiddleware y salian con el formato
// ProblemDetails de ASP.NET. Aqui se reescriben al formato unico de la API.
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errores = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .ToDictionary(
                e => e.Key,
                e => e.Value!.Errors.Select(x => x.ErrorMessage).ToArray());

        return new BadRequestObjectResult(new RespuestaErrorDto
        {
            Mensaje = "Los datos enviados no son válidos.",
            Codigo  = StatusCodes.Status400BadRequest,
            TraceId = context.HttpContext.TraceIdentifier,
            Errores = errores,
        });
    };
});

// ── Swagger ─────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "SergioApi",
        Version     = "v1",
        Description = "API de cursos y videos con suscripcion premium. "
                    + "Autenticacion JWT con refresh token rotatorio."
    });

    // Muestra en Swagger los /// <summary> ya escritos en controllers y DTOs.
    var xmlPath = Path.Combine(AppContext.BaseDirectory,
        $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Ingresa tu JWT. Ejemplo: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            []
        }
    });
});

// ════════════════════════════════════════════════════════════════
var app = builder.Build();
// ════════════════════════════════════════════════════════════════

// ── Migraciones automaticas (opt-in) ────────────────────────────
// Activado por compose con RUN_MIGRATIONS=true para que el contenedor
// quede utilizable con un solo comando. En local se prefiere `dotnet ef database update`.
if (app.Configuration.GetValue<bool>("RUN_MIGRATIONS"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    app.Logger.LogInformation("RUN_MIGRATIONS activo: aplicando migraciones pendientes...");
    db.Database.Migrate();
    app.Logger.LogInformation("Migraciones aplicadas.");
}

// Aviso temprano si Bunny esta a medio configurar en Development.
if (app.Environment.IsDevelopment())
{
    var bunny = app.Services.GetRequiredService<IConfiguration>()
        .GetSection(BunnyOptions.SectionName).Get<BunnyOptions>();
    if (bunny is null || string.IsNullOrWhiteSpace(bunny.ApiKey) || string.IsNullOrWhiteSpace(bunny.LibraryId))
        app.Logger.LogWarning(
            "Bunny no esta configurado (Bunny:ApiKey / Bunny:LibraryId). "
          + "Los endpoints de video fallaran. El resto de la API funciona.");
    else if (string.IsNullOrWhiteSpace(bunny.TokenAuthKey))
        app.Logger.LogWarning(
            "Bunny:TokenAuthKey vacia: las URLs de reproduccion NO se firmaran. "
          + "No despliegues asi, cualquiera con el GUID podria ver un video premium.");
}

// ── Middleware de excepciones (el PRIMERO de todos) ─────────────
// Va antes que UseForwardedHeaders para capturar tambien lo que falle ahi.
app.UseGlobalExceptionHandler();

// Solo si hay proxies de confianza declarados. Sin ellos no se procesan cabeceras
// reenviadas y se usa la IP real de la conexion, que no se puede falsificar.
if (redConfig.HayProxiesDeConfianza)
{
    app.UseForwardedHeaders();
    app.Logger.LogInformation(
        "Cabeceras reenviadas ACTIVAS: se confia en X-Forwarded-For de {Proxies} proxy(s) "
      + "y {Redes} red(es) declaradas.",
        redConfig.ProxiesDeConfianza.Length, redConfig.RedesDeConfianza.Length);
}
else
{
    app.Logger.LogInformation(
        "Cabeceras reenviadas DESACTIVADAS: el rate limiter usa la IP real de la conexion. "
      + "Si pones un proxy delante, declara Red:ProxiesDeConfianza o Red:RedesDeConfianza, "
      + "o todas las peticiones se contaran como una sola IP.");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Dentro de un contenedor no hay certificado y redirigir a HTTPS rompe todas
// las peticiones: TLS se termina en el proxy de delante.
if (!app.Configuration.GetValue<bool>("DISABLE_HTTPS_REDIRECT"))
    app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(CorsPolicy);

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
