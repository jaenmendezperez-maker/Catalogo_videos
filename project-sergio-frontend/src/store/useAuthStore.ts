// src/store/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UsuarioAutenticadoDto, Rol } from '../types'

// Lo que realmente guardamos del usuario en sesión — es un subconjunto
// de UsuarioAutenticadoDto sin los tokens (esos van aparte)
export interface UsuarioSesion {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  fotoPerfil: string | null
  rol: Rol
  esPremium: boolean
}

interface AuthStore {
  user:            UsuarioSesion | null
  token:           string | null
  refreshToken:    string | null
  isAuthenticated: boolean

  /** Login/registro devuelven un solo objeto (UsuarioAutenticadoDto) con todo junto */
  login:      (data: UsuarioAutenticadoDto) => void
  logout:     () => void
  updateUser: (data: Partial<UsuarioSesion>) => void
  setTokens:  (token: string, refreshToken: string) => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      refreshToken:    null,
      isAuthenticated: false,

      login: (data) => {
        const { token, refreshToken, fechaExpiracion, ...usuario } = data
        set({
          user: usuario,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
      },

      updateUser: (data) => {
        const current = get().user
        if (!current) return
        set({ user: { ...current, ...data } })
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user:            state.user,
        token:           state.token,
        refreshToken:    state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore