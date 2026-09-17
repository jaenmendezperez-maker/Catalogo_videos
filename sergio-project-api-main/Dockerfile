# ─────────────────────── build ───────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar solo el csproj primero: la capa de restore se cachea y no se
# reconstruye cuando cambia el codigo, solo cuando cambian las dependencias.
COPY ["SergioApi.csproj", "./"]
RUN dotnet restore "SergioApi.csproj"

COPY . .
RUN dotnet publish "SergioApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ────────────────────── runtime ──────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# curl para el healthcheck del compose. Se instala ANTES de bajar de privilegios.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    # Dentro del contenedor no hay certificado: redirigir a HTTPS devolveria un 307
    # hacia un puerto que no existe y NINGUNA peticion funcionaria.
    # El TLS se termina en el proxy de delante.
    DISABLE_HTTPS_REDIRECT=true

COPY --from=build /app/publish .

# Usuario sin privilegios que las imagenes .NET 8 ya traen (uid 64198).
USER $APP_UID

EXPOSE 8080
ENTRYPOINT ["dotnet", "SergioApi.dll"]
