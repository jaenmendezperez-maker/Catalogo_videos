using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SergioApi.Data;
using SergioApi.Models.Entities;
using SergioApi.Services.Interfaces;

namespace SergioApi.Services.Implementations.Usuarios
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context;

        public JwtService(IConfiguration config, AppDbContext context)
        {
            _config  = config;
            _context = context;
        }

        // ─────────────────────────────────────────
        // ACCESS TOKEN
        // ─────────────────────────────────────────

        public string GenerarAccessToken(Usuario usuario)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub,   usuario.Id.ToString()),
                new(JwtRegisteredClaimNames.Email, usuario.Correo),
                new(JwtRegisteredClaimNames.Name,  usuario.Nombre),
                new(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
                new(ClaimTypes.Role,               usuario.Rol?.Nombre ?? "Usuario"),
                // Informativo para el front: puede ir hasta la vigencia del token desfasado.
                // Nadie lo usa para autorizar; el acceso se decide leyendo la BD.
                new("esPremium",                   SergioApi.Utils.AccesoPremium.EstaVigente(usuario).ToString().ToLower()),
            };

            var key      = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]!));
            var creds    = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var minutos  = double.Parse(_config["Jwt:AccessTokenMinutos"] ?? "60");
            var expiracion = DateTime.UtcNow.AddMinutes(minutos);

            var token = new JwtSecurityToken(
                issuer:             _config["Jwt:Issuer"],
                audience:           _config["Jwt:Audience"],
                claims:             claims,
                expires:            expiracion,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ─────────────────────────────────────────
        // REFRESH TOKEN
        // ─────────────────────────────────────────

        public async Task<RefreshToken> GenerarRefreshTokenAsync(int usuarioId, string? dispositivo = null)
        {
            var tokenBytes  = RandomNumberGenerator.GetBytes(64);
            var tokenString = Convert.ToBase64String(tokenBytes)
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');

            var dias = int.Parse(_config["Jwt:RefreshTokenDias"] ?? "7");

            var refreshToken = new RefreshToken
            {
                Token             = tokenString,
                UsuarioId         = usuarioId,
                FechaExpiracion   = DateTimeOffset.UtcNow.AddDays(dias),
                DispositivoOrigen = dispositivo,
            };

            // RefreshToken no tiene su propio repositorio, lo manejamos directo con el context
            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        public async Task<RefreshToken?> ValidarRefreshTokenAsync(string token)
        {
            // OJO: no usar r.EsValido aqui. Es [NotMapped], EF no lo puede traducir a SQL
            // y la consulta revienta en tiempo de ejecucion. El predicado va inline.
            return await _context.RefreshTokens
            .Include(r => r.Usuario)
                .ThenInclude(u => u.Rol)
            .FirstOrDefaultAsync(r => r.Token == token
                                   && !r.EstaRevocado
                                   && r.FechaExpiracion > DateTimeOffset.UtcNow);
        }

        public async Task RevocarRefreshTokenAsync(string token, int? usuarioId = null)
        {
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(r => r.Token == token
                                       && (usuarioId == null || r.UsuarioId == usuarioId));

            if (refreshToken is not null)
            {
                refreshToken.EstaRevocado = true;
                await _context.SaveChangesAsync();
            }
            // Si no existe o no es suyo se sale en silencio: distinguir ambos casos
            // permitiria averiguar que refresh tokens existen.
        }

        public async Task<int> RevocarTodosDelUsuarioAsync(int usuarioId, string? exceptoToken = null)
        {
            return await _context.RefreshTokens
                .Where(r => r.UsuarioId == usuarioId
                         && !r.EstaRevocado
                         && (exceptoToken == null || r.Token != exceptoToken))
                .ExecuteUpdateAsync(s => s.SetProperty(r => r.EstaRevocado, true));
        }

        // ─────────────────────────────────────────
        // UTILIDAD
        // ─────────────────────────────────────────

        public int? ObtenerUsuarioIdDesdeToken(string accessToken)
        {
            var handler = new JwtSecurityTokenHandler();

            var validationParams = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]!)),
                ValidateIssuer   = true,
                ValidIssuer      = _config["Jwt:Issuer"],
                ValidateAudience = true,
                ValidAudience    = _config["Jwt:Audience"],
                ValidateLifetime = false, // Permite tokens expirados para poder refrescarlos
            };

            try
            {
                var principal = handler.ValidateToken(accessToken, validationParams, out _);
                var idClaim   = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                return int.TryParse(idClaim, out var id) ? id : null;
            }
            catch
            {
                return null;
            }
        }
    }
}