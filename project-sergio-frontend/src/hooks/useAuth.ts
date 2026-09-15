// src/hooks/useAuth.ts
// Wrapper de useAuthStore con helpers extra.
// Úsalo en componentes en vez de importar el store directamente
// cuando necesites lógica adicional.

import useAuthStore from '../store/useAuthStore'
import { ROLES } from '../utils/constants'

export function useAuth() {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,

    // Helpers de rol — evitan comparar strings en los componentes
    isAdmin:   user?.rol === ROLES.ADMIN,
    isUsuario: user?.rol === ROLES.USUARIO,
    isPremium: user?.esPremium ?? false,

    // Iniciales para el avatar
    initials: user?.nombre
      ? user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'U',
  }
}