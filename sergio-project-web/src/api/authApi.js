import api from './axios';

// ============================================================
// 🧪 MOCK — Elimina esto cuando tengas tu API .NET lista
// ============================================================
const MOCK_USERS = [
  {
    id: 1,
    nombre: 'Admin Test',
    correo: 'admin@test.com',
    contrasena: '123456',
    rol: 'Admin',
    fotoPerfil: null,
    esPremium: true,
  },
  {
    id: 2,
    nombre: 'Usuario Test',
    correo: 'usuario@test.com',
    contrasena: '123456',
    rol: 'Usuario',
    fotoPerfil: null,
    esPremium: false,
  },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function mockLogin(correo, contrasena) {
  await delay(800); // simula latencia de red
  const user = MOCK_USERS.find(
    (u) => u.correo === correo && u.contrasena === contrasena
  );
  if (!user) throw new Error('Correo o contraseña incorrectos');
  const { contrasena: _, ...safeUser } = user;
  return { user: safeUser, token: 'mock-token-' + safeUser.id };
}

async function mockRegister(datos) {
  await delay(800);
  const existe = MOCK_USERS.find((u) => u.correo === datos.correo);
  if (existe) throw new Error('Este correo ya está registrado');
  const newUser = {
    id: MOCK_USERS.length + 1,
    nombre: datos.nombre,
    correo: datos.correo,
    rol: 'Usuario',
    fotoPerfil: null,
    esPremium: false,
  };
  MOCK_USERS.push({ ...newUser, contrasena: datos.contrasena });
  return { user: newUser, token: 'mock-token-' + newUser.id };
}
// ============================================================
// FIN MOCK
// ============================================================


/**
 * Login de usuario
 * 
 * Cuando tengas tu API lista, reemplaza el mock por:
 * const response = await api.post('/auth/login', { correo, contrasena });
 * return response.data;
 */
export async function login(correo, contrasena) {
  // TODO: reemplazar con → const res = await api.post('/auth/login', { correo, contrasena }); return res.data;
  return mockLogin(correo, contrasena);
}

/**
 * Registro de nuevo usuario
 * 
 * Cuando tengas tu API lista, reemplaza el mock por:
 * const response = await api.post('/auth/registro', datos);
 * return response.data;
 */
export async function register(datos) {
  // TODO: reemplazar con → const res = await api.post('/auth/registro', datos); return res.data;
  return mockRegister(datos);
}

/**
 * Obtener usuario actual (para verificar token al recargar)
 */
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}