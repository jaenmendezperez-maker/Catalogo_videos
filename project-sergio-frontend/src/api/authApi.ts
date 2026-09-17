// src/api/authApi.ts
import api from './axios'
import type { UsuarioAutenticadoDto, RefreshResponseDto, LoginPayload, RegisterPayload, PerfilDto } from '../types'

export async function login(payload: LoginPayload): Promise<UsuarioAutenticadoDto> {
  const res = await api.post<UsuarioAutenticadoDto>('/auth/login', payload)
  return res.data
}

export async function register(datos: RegisterPayload): Promise<UsuarioAutenticadoDto> {
  const res = await api.post<UsuarioAutenticadoDto>('/auth/registro', datos)
  return res.data
}

export async function loginGoogle(idToken: string): Promise<UsuarioAutenticadoDto> {
  const res = await api.post<UsuarioAutenticadoDto>('/auth/login-google', { idToken })
  return res.data
}

export async function refresh(refreshToken: string): Promise<RefreshResponseDto> {
  const res = await api.post<RefreshResponseDto>('/auth/refresh', { refreshToken })
  return res.data
}

export async function logout(refreshToken: string): Promise<void> {
  // 204 siempre, exista el token o no
  await api.post('/auth/logout', { refreshToken })
}

export async function cambiarPassword(payload: {
  contrasenaActual: string
  contrasenaNueva: string
  confirmarContrasena: string
}): Promise<void> {
  // 204. Revoca TODOS los refresh tokens del usuario.
  await api.post('/auth/cambiar-password', payload)
}

export async function getPerfil(): Promise<PerfilDto> {
  // No existe /auth/me — el perfil real es este endpoint
  const res = await api.get<PerfilDto>('/usuarios/perfil')
  return res.data
}