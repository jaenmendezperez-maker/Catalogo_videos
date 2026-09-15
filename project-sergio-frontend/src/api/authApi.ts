// src/api/authApi.ts
import api from './axios'
import type { User, AuthResponse, LoginPayload, RegisterPayload } from '../types'

// ── Tipos extendidos con refreshToken ─────────────────────

export interface AuthResponseWithRefresh extends AuthResponse {
  refreshToken: string
}

// ── Mock ───────────────────────────────────────────────────

const MOCK_USERS: (User & { contrasena: string })[] = [
  { id: 1, nombre: 'Admin Test',    correo: 'admin@test.com',    contrasena: '123456', rol: 'Admin',   esPremium: true,  estado: true, fotoPerfil: null },
  { id: 2, nombre: 'Usuario Test',  correo: 'usuario@test.com',  contrasena: '123456', rol: 'Usuario', esPremium: false, estado: true, fotoPerfil: null },
]

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

async function mockLogin(correo: string, contrasena: string): Promise<AuthResponseWithRefresh> {
  await delay(800)
  const found = MOCK_USERS.find(u => u.correo === correo && u.contrasena === contrasena)
  if (!found) throw new Error('Correo o contraseña incorrectos')
  const { contrasena: _, ...safeUser } = found
  return {
    user:         safeUser,
    token:        `mock-token-${safeUser.id}`,
    refreshToken: `mock-refresh-${safeUser.id}`,   // ← el backend real devolverá esto
  }
}

async function mockRegister(datos: RegisterPayload): Promise<AuthResponseWithRefresh> {
  await delay(800)
  const existe = MOCK_USERS.find(u => u.correo === datos.correo)
  if (existe) throw new Error('Este correo ya está registrado')
  const newUser: User = {
    id: MOCK_USERS.length + 1,
    nombre: datos.nombre,
    correo: datos.correo,
    rol: 'Usuario',
    esPremium: false,
    estado: true,
    fotoPerfil: null,
  }
  return {
    user:         newUser,
    token:        `mock-token-${newUser.id}`,
    refreshToken: `mock-refresh-${newUser.id}`,
  }
}

// ── Funciones exportadas ───────────────────────────────────

export async function login(payload: LoginPayload): Promise<AuthResponseWithRefresh> {
  // TODO: const res = await api.post<AuthResponseWithRefresh>('/auth/login', payload)
  // return res.data
  return mockLogin(payload.correo, payload.contrasena)
}

export async function register(datos: RegisterPayload): Promise<AuthResponseWithRefresh> {
  // TODO: const res = await api.post<AuthResponseWithRefresh>('/auth/registro', datos)
  // return res.data
  return mockRegister(datos)
}

export async function getMe(): Promise<User> {
  const res = await api.get<User>('/auth/me')
  return res.data
}