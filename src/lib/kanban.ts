import { getConfig, saveConfig, getCached } from './configApi'

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

export async function fetchKanbanColumns(): Promise<string[]> {
  return getConfig<string[]>('kanban-columns', defaultColumns)
}

export function getKanbanColumns(): string[] {
  return getCached<string[]>('kanban-columns', defaultColumns)
}

export async function saveKanbanColumns(columns: string[]) {
  await saveConfig('kanban-columns', columns)
}

export async function fetchTaskTypes(): Promise<TaskType[]> {
  return getConfig<TaskType[]>('task-types', defaultTaskTypes)
}

export function getTaskTypes(): TaskType[] {
  return getCached<TaskType[]>('task-types', defaultTaskTypes)
}

export async function saveTaskTypes(types: TaskType[]) {
  await saveConfig('task-types', types)
}

// Table columns config
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

export async function fetchVisibleTableColumns(): Promise<string[]> {
  return getConfig<string[]>('tareas-table-columns', defaultVisibleKeys)
}

export function getVisibleTableColumns(): string[] {
  return getCached<string[]>('tareas-table-columns', defaultVisibleKeys)
}

export async function saveVisibleTableColumns(keys: string[]) {
  await saveConfig('tareas-table-columns', keys)
}
