const STORAGE_KEY = 'katt-modules'

export interface ModuleConfig {
  paciente: boolean
  doctor: boolean
  empresa: boolean
  inventario: boolean
  agenda: boolean
  chat: boolean
  agente: boolean
  tablero: boolean
  tareas: boolean
}

const defaults: ModuleConfig = {
  paciente: true,
  doctor: true,
  empresa: true,
  inventario: true,
  agenda: true,
  chat: true,
  agente: true,
  tablero: true,
  tareas: true,
}

export function getModules(): ModuleConfig {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
}

export function saveModules(modules: ModuleConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules))
}
