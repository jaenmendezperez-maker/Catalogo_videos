// src/api/axios.ts
// Instancia base de axios con:
// - Variables de entorno
// - Token JWT automático en cada request
// - Refresh token automático cuando el JWT expira (401)
// - Logout automático si el refresh también falla

import axios, { type AxiosRequestConfig } from 'axios'

// ── Instancia principal ────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Helpers para leer el store de Zustand desde fuera de React ──

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const { state } = JSON.parse(raw)
    return state?.token ?? null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const { state } = JSON.parse(raw)
    return state?.refreshToken ?? null
  } catch {
    return null
  }
}

function clearSession() {
  localStorage.removeItem('auth-storage')
  window.location.href = '/login'
}

// ── Interceptor REQUEST — agrega el token a cada petición ──

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Lógica de refresh ──────────────────────────────────────
// Problema a resolver: si varias peticiones fallan con 401 al mismo tiempo,
// no queremos llamar a /auth/refresh 5 veces. Usamos una cola y una bandera.

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject:  (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

// ── Interceptor RESPONSE — maneja el 401 y renueva el token ──

api.interceptors.response.use(
  // Respuesta exitosa — la devuelve tal cual
  (response) => response,

  // Error — aquí manejamos el 401
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Si no es 401, o ya reintentamos esta petición, rechaza directamente
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Si ya hay un refresh en curso, ponemos esta petición en la cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            }
            resolve(api(originalRequest))
          },
          reject,
        })
      })
    }

    // Marcamos que estamos renovando y que esta petición ya se reintentó
    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      // No hay refresh token → sesión terminada
      clearSession()
      return Promise.reject(error)
    }

    try {
      // TODO: cuando tengas el endpoint real, este es el único cambio:
      // const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken })
      // const newToken = res.data.token
      // const newRefreshToken = res.data.refreshToken

      // Mock — simula un refresh exitoso en desarrollo
      await new Promise(r => setTimeout(r, 300))
      const newToken = `refreshed-token-${Date.now()}`
      const newRefreshToken = refreshToken // en producción el backend te da uno nuevo

      // Actualiza el store de Zustand con el nuevo token
      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        parsed.state.token        = newToken
        parsed.state.refreshToken = newRefreshToken
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }

      // Reintenta las peticiones que estaban en cola
      processQueue(null, newToken)

      // Reintenta la petición original con el nuevo token
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return api(originalRequest)

    } catch (refreshError) {
      // El refresh también falló → cerramos sesión
      processQueue(refreshError, null)
      clearSession()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api