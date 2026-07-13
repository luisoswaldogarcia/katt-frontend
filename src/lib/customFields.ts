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

const pacienteDefaults: CustomField[] = [
  { id: 'sexo', label: 'Sexo', type: 'select', required: false, options: ['Masculino', 'Femenino', 'Otro'] },
  { id: 'cirugias', label: 'Cirugías', type: 'textarea', required: false },
  { id: 'enfermedades', label: 'Enfermedades', type: 'textarea', required: false },
  { id: 'medicamentos', label: 'Medicamentos que toma', type: 'textarea', required: false },
]

export function getCustomFields(module: Module): CustomField[] {
  const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${module}`)
  if (stored) {
    const fields: CustomField[] = JSON.parse(stored)
    if (module === 'paciente') {
      const ids = fields.map(f => f.id)
      const missing = pacienteDefaults.filter(d => !ids.includes(d.id))
      if (missing.length > 0) {
        const merged = [...fields, ...missing]
        localStorage.setItem(`${STORAGE_KEY_PREFIX}-${module}`, JSON.stringify(merged))
        return merged
      }
    }
    return fields
  }
  if (module === 'paciente') {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}-${module}`, JSON.stringify(pacienteDefaults))
    return pacienteDefaults
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
