// src/store/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthStore {
  user:             User | null
  token:            string | null
  refreshToken:     string | null
  isAuthenticated:  boolean

  login:      (user: User, token: string, refreshToken?: string) => void
  logout:     () => void
  updateUser: (data: Partial<User>) => void
  setTokens:  (token: string, refreshToken: string) => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      refreshToken:    null,
      isAuthenticated: false,

      login: (user, token, refreshToken = '') => {
        // ── MOCK CRUD TEMPORAL ──
        // Si la base de datos aún no devuelve 'avatar', le asignamos una ruta de assets por defecto.
        // Cuando tu backend empiece a mandarlo, user.avatar existirá y tomará el real.
        const userDbData = {
          ...user,
          avatar: user.avatar || '/assets/images/sergio.png' // Cambia esta ruta por la que quieras probar
        };

        set({ user: userDbData, token, refreshToken, isAuthenticated: true })
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