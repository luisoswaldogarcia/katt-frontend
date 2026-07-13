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

export type Module = 'paciente' | 'doctor'

export function getCustomFields(module: Module): CustomField[] {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${module}`)
  return stored ? JSON.parse(stored) : []
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
