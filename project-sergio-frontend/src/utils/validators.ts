// src/utils/validators.ts
// Funciones de validación reutilizables para formularios.
// Retornan string con el error o undefined si es válido.

export type Validator = (value: string) => string | undefined

/** Campo requerido */
export const required =
  (label = 'Este campo'): Validator =>
  (value) =>
    !value?.trim() ? `${label} es obligatorio.` : undefined

/** Email válido */
export const isEmail: Validator = (value) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return !regex.test(value) ? 'Ingresa un correo electrónico válido.' : undefined
}

/** Longitud mínima */
export const minLength =
  (min: number, label = 'Este campo'): Validator =>
  (value) =>
    value.length < min ? `${label} debe tener al menos ${min} caracteres.` : undefined

/** Longitud máxima */
export const maxLength =
  (max: number, label = 'Este campo'): Validator =>
  (value) =>
    value.length > max ? `${label} no puede superar los ${max} caracteres.` : undefined

/** Teléfono (formato básico) */
export const isPhone: Validator = (value) => {
  const regex = /^[+\d\s\-()]{7,20}$/
  return !regex.test(value) ? 'Ingresa un número de teléfono válido.' : undefined
}

/** URL válida */
export const isURL: Validator = (value) => {
  if (!value) return undefined // opcional
  try {
    new URL(value)
    return undefined
  } catch {
    return 'Ingresa una URL válida (ej: https://ejemplo.com).'
  }
}

/** Las contraseñas coinciden */
export const passwordsMatch =
  (other: string): Validator =>
  (value) =>
    value !== other ? 'Las contraseñas no coinciden.' : undefined

/**
 * Aplica múltiples validadores en orden y devuelve el primer error.
 *
 * Uso:
 *   const error = validate(form.correo, [required('Correo'), isEmail])
 */
export function validate(value: string, validators: Validator[]): string | undefined {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return undefined
}

/**
 * Valida un formulario completo.
 * Devuelve un objeto con los errores por campo.
 *
 * Uso:
 *   const errors = validateForm({
 *     correo:    [form.correo,    [required('Correo'), isEmail]],
 *     contrasena:[form.contrasena,[required(), minLength(6)]],
 *   })
 *   if (Object.keys(errors).length > 0) { ... }
 */
export function validateForm(
  fields: Record<string, [string, Validator[]]>
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const [field, [value, validators]] of Object.entries(fields)) {
    const error = validate(value, validators)
    if (error) errors[field] = error
  }

  return errors
}

/**
 * Calcula la fortaleza de una contraseña.
 * Devuelve nivel 1 (débil), 2 (media) o 3 (fuerte).
 */
export function passwordStrength(password: string): {
  level: 0 | 1 | 2 | 3
  label: string
  color: string
} {
  if (!password) return { level: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 6)          score++
  if (password.length >= 10)         score++
  if (/[A-Z]/.test(password))        score++
  if (/[0-9]/.test(password))        score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Débil',  color: 'bg-red-500'     }
  if (score <= 3) return { level: 2, label: 'Media',  color: 'bg-amber-500'   }
  return             { level: 3, label: 'Fuerte', color: 'bg-emerald-500' }
}