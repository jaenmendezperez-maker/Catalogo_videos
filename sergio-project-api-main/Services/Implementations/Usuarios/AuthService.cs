using Google.Apis.Auth;
using SergioApi.Data;
using SergioApi.Models.DTOs.Usuarios;
using SergioApi.Models.Entities;
using SergioApi.Repositories;
using SergioApi.Services.Interfaces;
using SergioApi.Exceptions;
using SergioApi.Utils;
using SergioApi.Enums;

namespace SergioApi.Services.Implementations.Usuarios
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepo;
        private readonly IJwtService _jwtService;
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(
            IUsuarioRepository usuarioRepo,
            IJwtService jwtService,
            AppDbContext context,
            IConfiguration config)
        {
            _usuarioRepo = usuarioRepo;
            _jwtService  = jwtService;
            _context     = context;
            _config      = config;
        }

        // ─────────────────────────────────────────
        // REGISTRO
        // ─────────────────────────────────────────

        public async Task<UsuarioAutenticadoDto> RegistrarAsync(UsuarioRegistroDto dto)
        {
            // Normalizar ANTES de comprobar. Antes se comprobaba dto.Correo tal cual
            // pero se guardaba en minusculas, asi que "Sergio@x.com" pasaba el control
            // aunque "sergio@x.com" ya existiera.
            var correo = NormalizadorCorreo.Normalizar(dto.Correo);

            if (await _usuarioRepo.CorreoExisteAsync(correo))
                throw new ReglaNegocioException("Ya existe una cuenta con ese correo.");

            var usuario = new Usuario
            {
                Nombre         = dto.Nombre,
                Correo         = correo,
                Telefono       = dto.Telefono,
                ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.Contrasena),
                RolId          = (int)RolUsuario.Usuario,
                FechaRegistro  = DateTimeOffset.UtcNow,
            };

            await _usuarioRepo.AddAsync(usuario);

            var usuarioConRol = await _usuarioRepo.GetConRolAsync(usuario.Id)
                ?? throw new Exception("Error al obtener el usuario registrado.");

            return await GenerarRespuestaAutenticadaAsync(usuarioConRol);
        }

        // ─────────────────────────────────────────
        // LOGIN EMAIL
        // ─────────────────────────────────────────

        public async Task<UsuarioAutenticadoDto> LoginAsync(UsuarioLoginDto dto)
        {
            var usuario = await _usuarioRepo.GetByCorreoAsync(NormalizadorCorreo.Normalizar(dto.Correo))
                ?? throw new UnauthorizedAccessException("Credenciales incorrectas.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Contrasena, usuario.ContrasenaHash))
                throw new UnauthorizedAccessException("Credenciales incorrectas.");

            return await GenerarRespuestaAutenticadaAsync(usuario);
        }

        // ─────────────────────────────────────────
        // LOGIN GOOGLE
        // ─────────────────────────────────────────

        public async Task<UsuarioAutenticadoDto> LoginGoogleAsync(string googleToken)
        {
            var clientId = _config["Google:ClientId"];
            if (string.IsNullOrWhiteSpace(clientId))
                // Sin ClientId, Audience seria new[]{ null } y la validacion no comprobaria
                // para que aplicacion se emitio el token.
                throw new InvalidOperationException("Google:ClientId no esta configurado.");

            GoogleJsonWebSignature.Payload payload;
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                };
                payload = await GoogleJsonWebSignature.ValidateAsync(googleToken, settings);
            }
            catch (InvalidJwtException)
            {
                throw new UnauthorizedAccessException("Token de Google inválido.");
            }

            // Sin esto, alguien con una cuenta de Google no verificada sobre un correo
            // ajeno podria apoderarse de una cuenta ya registrada con ese mismo correo.
            if (!payload.EmailVerified)
                throw new UnauthorizedAccessException("El correo de Google no está verificado.");

            var correoGoogle = NormalizadorCorreo.Normalizar(payload.Email);
            var usuario = await _usuarioRepo.GetByCorreoAsync(correoGoogle);

            if (usuario is null)
            {
                var nuevo = new Usuario
                {
                    Nombre         = payload.Name ?? payload.Email,
                    Correo         = correoGoogle,
                    ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    FotoPerfil     = payload.Picture,
                    RolId          = (int)RolUsuario.Usuario,
                    FechaRegistro  = DateTimeOffset.UtcNow,
                };

                await _usuarioRepo.AddAsync(nuevo);
                usuario = await _usuarioRepo.GetConRolAsync(nuevo.Id);
            }
            else if (payload.Picture is not null && usuario.FotoPerfil != payload.Picture)
            {
                usuario.FotoPerfil = payload.Picture;
                await _usuarioRepo.UpdateAsync(usuario);
            }

            return await GenerarRespuestaAutenticadaAsync(usuario!, dispositivo: "google");
        }

        // ─────────────────────────────────────────
        // REFRESH TOKEN
        // ─────────────────────────────────────────

        public async Task<TokenRefrescadoDto> RefrescarTokenAsync(string refreshToken)
        {
            var tokenGuardado = await _jwtService.ValidarRefreshTokenAsync(refreshToken)
                ?? throw new UnauthorizedAccessException("Refresh token inválido o expirado.");

            await _jwtService.RevocarRefreshTokenAsync(refreshToken);

            var nuevoRefresh = await _jwtService.GenerarRefreshTokenAsync(
                tokenGuardado.UsuarioId,
                tokenGuardado.DispositivoOrigen);

            var accessToken = _jwtService.GenerarAccessToken(tokenGuardado.Usuario);
            var minutosExp  = double.Parse(_config["Jwt:AccessTokenMinutos"] ?? "60");

            return new TokenRefrescadoDto
            {
                AccessToken     = accessToken,
                RefreshToken    = nuevoRefresh.Token,
                FechaExpiracion = DateTimeOffset.UtcNow.AddMinutes(minutosExp),
            };
        }

        public async Task RevocarTokenAsync(int usuarioId, string refreshToken) =>
            await _jwtService.RevocarRefreshTokenAsync(refreshToken, usuarioId);

        // ─────────────────────────────────────────
        // CAMBIO DE CONTRASEÑA
        // ─────────────────────────────────────────

        public async Task CambiarPasswordAsync(int usuarioId, UsuarioCambioPasswordDto dto)
        {
            var usuario = await _usuarioRepo.GetConRolAsync(usuarioId)
                ?? throw new KeyNotFoundException("Usuario no encontrado.");

            if (!BCrypt.Net.BCrypt.Verify(dto.ContrasenaActual, usuario.ContrasenaHash))
                throw new UnauthorizedAccessException("La contraseña actual es incorrecta.");

            usuario.ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(dto.ContrasenaNueva);
            await _usuarioRepo.UpdateAsync(usuario);

            // Cerrar todas las sesiones abiertas. Sin esto, quien tuviera un refresh token
            // robado seguia renovando su acceso hasta 7 dias despues del cambio.
            await _jwtService.RevocarTodosDelUsuarioAsync(usuarioId);
        }

        // ─────────────────────────────────────────
        // HELPER PRIVADO
        // ─────────────────────────────────────────

        private async Task<UsuarioAutenticadoDto> GenerarRespuestaAutenticadaAsync(
            Usuario usuario, string? dispositivo = null)
        {
            var accessToken  = _jwtService.GenerarAccessToken(usuario);
            var refreshToken = await _jwtService.GenerarRefreshTokenAsync(usuario.Id, dispositivo);
            var minutosExp   = double.Parse(_config["Jwt:AccessTokenMinutos"] ?? "60");

            return new UsuarioAutenticadoDto
            {
                Id              = usuario.Id,
                Nombre          = usuario.Nombre,
                Correo          = usuario.Correo,
                Telefono        = usuario.Telefono ?? string.Empty,
                FotoPerfil      = usuario.FotoPerfil,
                Rol             = usuario.Rol?.Nombre ?? "Usuario",
                // Calculado por fecha, igual que el control de acceso a los videos.
                EsPremium       = AccesoPremium.EstaVigente(usuario),
                Token           = accessToken,
                RefreshToken    = refreshToken.Token,
                FechaExpiracion = DateTimeOffset.UtcNow.AddMinutes(minutosExp),
            };
        }
    }
}