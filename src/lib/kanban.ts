const COLUMNS_KEY = 'katt-kanban-columnas'
const TASK_TYPES_KEY = 'katt-kanban-tipos'

const defaultColumns = ['Pendiente', 'En progreso', 'Completada']

export interface TaskTypeField {
  key: string
  label: string
  type: 'text' | 'date' | 'textarea' | 'file'
  required?: boolean
}

export interface TaskType {
  id: string
  nombre: string
  fields: TaskTypeField[]
}

const defaultTaskTypes: TaskType[] = [
  { id: 'general', nombre: 'General', fields: [
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
    { key: 'fechaLimite', label: 'Fecha límite', type: 'date' },
  ]},
  { id: 'cobrar-seguro', nombre: 'Cobrar seguro', fields: [
    { key: 'monto', label: 'Monto', type: 'text' },
    { key: 'archivo', label: 'Archivo', type: 'file' },
  ]},
  { id: 'crear-qr', nombre: 'Crear QR', fields: [
    { key: 'fechaLimite', label: 'Fecha límite', type: 'date' },
    { key: 'descripcion', label: 'Descripción', type: 'textarea' },
  ]},
]

export function getKanbanColumns(): string[] {
  const stored = localStorage.getItem(COLUMNS_KEY)
  return stored ? JSON.parse(stored) : defaultColumns
}

export function saveKanbanColumns(columns: string[]) {
  localStorage.setItem(COLUMNS_KEY, JSON.stringify(columns))
}

export function getTaskTypes(): TaskType[] {
  const stored = localStorage.getItem(TASK_TYPES_KEY)
  return stored ? JSON.parse(stored) : defaultTaskTypes
}

export function saveTaskTypes(types: TaskType[]) {
  localStorage.setItem(TASK_TYPES_KEY, JSON.stringify(types))
}

// Columnas visibles en la tabla de tareas
const TABLE_COLUMNS_KEY = 'katt-tareas-tabla-columnas'

export interface TareaTableColumn {
  key: string
  label: string
}

const allTableColumns: TareaTableColumn[] = [
  { key: 'titulo', label: 'Título' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'estado', label: 'Estado' },
  { key: 'monto', label: 'Monto' },
  { key: 'fechaLimite', label: 'Fecha límite' },
]

const defaultVisibleKeys = ['titulo', 'estado', 'monto']

export function getAllTableColumns(): TareaTableColumn[] {
  return allTableColumns
}

export function getVisibleTableColumns(): string[] {
  const stored = localStorage.getItem(TABLE_COLUMNS_KEY)
  return stored ? JSON.parse(stored) : defaultVisibleKeys
}

export function saveVisibleTableColumns(keys: string[]) {
  localStorage.setItem(TABLE_COLUMNS_KEY, JSON.stringify(keys))
}
