export type FieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'boolean'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'email'
  | 'tel'
  | 'url'
  | 'file'
  | 'color'
  | 'range'

export interface CustomField {
  id: string
  label: string
  type: FieldType
  required: boolean
  options?: string[]
  min?: number
  max?: number
}

const STORAGE_KEY_PREFIX = 'katt-custom-fields'

export type Module = 'paciente' | 'doctor' | 'inventario' | 'empresa'

export function getCustomFields(module: Module): CustomField[] {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${module}`)
  if (stored) return JSON.parse(stored)
  // Campos por defecto
  if (module === 'paciente') {
    const defaults: CustomField[] = [
      { id: 'sexo', label: 'Sexo', type: 'select', required: false, options: ['Masculino', 'Femenino', 'Otro'] }
    ]
    localStorage.setItem(`${STORAGE_KEY_PREFIX}-${module}`, JSON.stringify(defaults))
    return defaults
  }
  return []
}

export function saveCustomFields(module: Module, fields: CustomField[]) {
  localStorage.setItem(`${STORAGE_KEY_PREFIX}-${module}`, JSON.stringify(fields))
}

export const fieldTypeLabels: Record<FieldType, string> = {
  input: 'Texto corto',
  textarea: 'Texto largo',
  number: 'Número',
  date: 'Fecha',
  time: 'Hora',
  boolean: 'Sí/No',
  checkbox: 'Casillas (múltiple)',
  radio: 'Opción única',
  select: 'Lista desplegable',
  email: 'Email',
  tel: 'Teléfono',
  url: 'URL',
  file: 'Archivo',
  color: 'Color',
  range: 'Rango/Escala',
}
