import { getConfig, saveConfig, getCached } from './configApi'

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

export type Module = 'paciente' | 'doctor' | 'inventario' | 'empresa'

const pacienteDefaults: CustomField[] = [
  { id: 'sexo', label: 'Sexo', type: 'select', required: false, options: ['Masculino', 'Femenino', 'Otro'] },
  { id: 'cirugias', label: 'Cirugías', type: 'textarea', required: false },
  { id: 'enfermedades', label: 'Enfermedades', type: 'textarea', required: false },
  { id: 'medicamentos', label: 'Medicamentos que toma', type: 'textarea', required: false },
]

function defaultsFor(module: Module): CustomField[] {
  return module === 'paciente' ? pacienteDefaults : []
}

export async function fetchCustomFields(module: Module): Promise<CustomField[]> {
  return getConfig<CustomField[]>(`custom-fields-${module}`, defaultsFor(module))
}

export function getCustomFields(module: Module): CustomField[] {
  return getCached<CustomField[]>(`custom-fields-${module}`, defaultsFor(module))
}

export async function saveCustomFields(module: Module, fields: CustomField[]) {
  await saveConfig(`custom-fields-${module}`, fields)
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
