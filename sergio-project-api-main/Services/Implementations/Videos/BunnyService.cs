using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using SergioApi.Models.Entities.Videos;
using SergioApi.Services.Interfaces.Videos;

namespace SergioApi.Services.Implementations.Videos
{
    public class BunnyService : IBunnyService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly long _libraryId;
        private readonly string _cdnHostname;
        private readonly string _apiBaseUrl;
        private readonly string _tokenAuthKey;
        private readonly bool   _esDesarrollo;

        /// <summary>Id de la libreria de Bunny. Fuente unica de verdad para los servicios.</summary>
        public long LibraryId => _libraryId;

        public BunnyService(HttpClient httpClient, IConfiguration configuration, IHostEnvironment entorno)
        {
            _httpClient  = httpClient;
            _esDesarrollo = entorno.IsDevelopment();

            _apiKey      = configuration["Bunny:ApiKey"] ?? string.Empty;

            // Antes era long.Parse(configuration["Bunny:LibraryId"]!): con la clave ausente
            // lanzaba ArgumentNullException dentro del constructor, lo que salia como un
            // 500 opaco en la primera peticion de video.
            _libraryId   = long.TryParse(configuration["Bunny:LibraryId"], out var lib)
                ? lib
                : throw new InvalidOperationException(
                    "Bunny:LibraryId no esta configurado o no es numerico.");

            _cdnHostname = configuration["Bunny:CDNHostname"] ?? string.Empty;
            _apiBaseUrl  = configuration["Bunny:ApiBaseUrl"] ?? "https://video.bunnycdn.com";
            _tokenAuthKey = configuration["Bunny:TokenAuthKey"] ?? "";

            // Header de autenticación que Bunny requiere en cada petición
            _httpClient.DefaultRequestHeaders.Add("AccessKey", _apiKey);
            _httpClient.DefaultRequestHeaders.Accept
                .Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        // ── Métodos auxiliares para construir URLs ─────────────────────
        
        private string GetVideosUrl() => $"{_apiBaseUrl}/library/{_libraryId}/videos";
        private string GetVideoUrl(string bunnyVideoId) => $"{_apiBaseUrl}/library/{_libraryId}/videos/{bunnyVideoId}";
        private string GetCollectionsUrl() => $"{_apiBaseUrl}/library/{_libraryId}/collections";
        private string GetCollectionUrl(string bunnyCollectionId) => $"{_apiBaseUrl}/library/{_libraryId}/collections/{bunnyCollectionId}";
        private string GetCaptionsUrl(string bunnyVideoId, string srclang) => $"{_apiBaseUrl}/library/{_libraryId}/videos/{bunnyVideoId}/captions/{srclang}";

        // ── Videos ───────────────────────────────────────────────

        public async Task<string> CrearVideoAsync(string titulo, string? bunnyCollectionId)
        {
            // OJO: collectionId es el GUID de la coleccion en Bunny, no nuestro PK int.
            // Antes se mandaba videoCursoId.ToString() y los videos nunca caian en
            // la coleccion correcta del lado de Bunny.
            var body = new { title = titulo, collectionId = bunnyCollectionId };
            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(GetVideosUrl(), content);

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(json);

            // Bunny devuelve el GUID del video recién creado
            return result.GetProperty("guid").GetString()!;
        }

        public async Task SubirArchivoBinarioAsync(string bunnyVideoId, Stream archivo)
        {
            var content = new StreamContent(archivo);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var response = await _httpClient.PutAsync(GetVideoUrl(bunnyVideoId), content);

            response.EnsureSuccessStatusCode();
        }

        public async Task ActualizarVideoAsync(
            string bunnyVideoId,
            string? titulo,
            string? descripcion,
            string? bunnyCollectionId)
        {
            // Solo enviamos los campos que vienen con valor
            var body = new Dictionary<string, object?>();
            if (titulo        != null) body["title"]        = titulo;
            if (descripcion   != null) body["description"]  = descripcion;
            if (bunnyCollectionId != null) body["collectionId"] = bunnyCollectionId;

            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(GetVideoUrl(bunnyVideoId), content);

            response.EnsureSuccessStatusCode();
        }

        public async Task EliminarVideoAsync(string bunnyVideoId)
        {
            var response = await _httpClient.DeleteAsync(GetVideoUrl(bunnyVideoId));

            response.EnsureSuccessStatusCode();
        }

        public async Task<Video?> ObtenerVideoAsync(string bunnyVideoId)
        {
            var response = await _httpClient.GetAsync(GetVideoUrl(bunnyVideoId));

            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();

            return JsonSerializer.Deserialize<Video>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }

        // ── Colecciones ───────────────────────────────────────────

        public async Task<string> CrearColeccionAsync(string nombre)
        {
            var body = new { name = nombre };
            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(GetCollectionsUrl(), content);

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<JsonElement>(json);

            return result.GetProperty("guid").GetString()!;
        }

        public async Task ActualizarColeccionAsync(string bunnyCollectionId, string nombre)
        {
            var body = new { name = nombre };
            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(GetCollectionUrl(bunnyCollectionId), content);

            response.EnsureSuccessStatusCode();
        }

        public async Task EliminarColeccionAsync(string bunnyCollectionId)
        {
            var response = await _httpClient.DeleteAsync(GetCollectionUrl(bunnyCollectionId));

            response.EnsureSuccessStatusCode();
        }

        // ── Subtítulos ────────────────────────────────────────────

        public async Task AgregarSubtituloAsync(
            string bunnyVideoId,
            string srclang,
            string label,
            Stream archivo)
        {
            var content = new StreamContent(archivo);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

            var response = await _httpClient.PostAsync(
                $"{GetCaptionsUrl(bunnyVideoId, srclang)}?label={label}",
                content
            );

            response.EnsureSuccessStatusCode();
        }

        public async Task EliminarSubtituloAsync(string bunnyVideoId, string srclang)
        {
            var response = await _httpClient.DeleteAsync(GetCaptionsUrl(bunnyVideoId, srclang));

            response.EnsureSuccessStatusCode();
        }

        // ── Reproducción segura ───────────────────────────────

        /// <summary>
        /// Genera una URL de embed firmada segun el esquema de Token Authentication
        /// de Bunny Stream: token = SHA256_HEX(TokenAuthKey + videoId + expires),
        /// sobre https://iframe.mediadelivery.net/embed/{libreria}/{guid}.
        /// </summary>
        /// <remarks>
        /// La implementacion anterior mezclaba dos esquemas distintos: construia la URL
        /// del CDN (/{guid}/playlist.m3u8 sobre el hostname del pull zone) pero firmaba
        /// con el algoritmo del embed. Bunny rechazaba ese token.
        /// El esquema del CDN es otro: Base64URL(MD5(clave + ruta + expires)).
        /// </remarks>
        public string GenerarUrlFirmada(string bunnyVideoId, int minutosExpiracion = 120)
        {
            if (string.IsNullOrEmpty(_tokenAuthKey))
            {
                // Fuera de Development fallar RUIDOSAMENTE. Devolver la URL sin firmar
                // era exactamente el bypass del paywall: cualquiera con el GUID entraba.
                if (!_esDesarrollo)
                    throw new InvalidOperationException(
                        "Bunny:TokenAuthKey no esta configurada: no se pueden firmar las URLs "
                      + "de reproduccion. Configurala o activa Token Authentication en la libreria.");

                return $"https://iframe.mediadelivery.net/embed/{_libraryId}/{bunnyVideoId}";
            }

            var expiracion = DateTimeOffset.UtcNow.AddMinutes(minutosExpiracion).ToUnixTimeSeconds();
            var hashBytes  = SHA256.HashData(
                Encoding.UTF8.GetBytes($"{_tokenAuthKey}{bunnyVideoId}{expiracion}"));
            var token = Convert.ToHexString(hashBytes).ToLowerInvariant();

            return $"https://iframe.mediadelivery.net/embed/{_libraryId}/{bunnyVideoId}"
                 + $"?token={token}&expires={expiracion}";
        }

        /// <summary>
        /// Construye la URL publica del thumbnail. Se centraliza aqui porque esta clase
        /// es la unica que conoce el hostname del CDN.
        /// </summary>
        public string? ConstruirUrlThumbnail(string bunnyVideoId, string? nombreArchivo) =>
            string.IsNullOrEmpty(nombreArchivo) || string.IsNullOrEmpty(_cdnHostname)
                ? null
                : $"https://{_cdnHostname}/{bunnyVideoId}/{nombreArchivo}";




    }
}