// src/api/axios.ts
import axios, { type AxiosRequestConfig } from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // debe incluir /api, ej: http://localhost:5099/api
  headers: { 'Content-Type': 'application/json' },
})

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

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // No reintentes el propio /auth/login o /auth/refresh si fallan con 401
    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

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

    originalRequest._retry = true
    isRefreshing = true

    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      clearSession()
      return Promise.reject(error)
    }

    try {
      // OJO: /refresh devuelve "accessToken", no "token"
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken })
      const newToken = res.data.accessToken
      const newRefreshToken = res.data.refreshToken // rota siempre, hay que guardar el nuevo

      const raw = localStorage.getItem('auth-storage')
      if (raw) {
        const parsed = JSON.parse(raw)
        parsed.state.token = newToken
        parsed.state.refreshToken = newRefreshToken
        localStorage.setItem('auth-storage', JSON.stringify(parsed))
      }

      processQueue(null, newToken)

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newToken}`,
      }
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearSession()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api