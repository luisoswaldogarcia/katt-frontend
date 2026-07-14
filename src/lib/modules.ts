import { empresaStore } from './demoStore'

const ACTIVE_EMPRESA_KEY = 'katt-active-empresa'

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
  pos: boolean
}

export const moduleLabels: Record<keyof ModuleConfig, string> = {
  paciente: 'Pacientes',
  doctor: 'Usuarios',
  empresa: 'Empresas',
  inventario: 'Inventario',
  agenda: 'Agenda',
  chat: 'Chat',
  agente: 'Agente',
  tablero: 'Tablero',
  tareas: 'Tareas',
  pos: 'Punto de Venta',
}

const allEnabled: ModuleConfig = {
  paciente: true,
  doctor: true,
  empresa: true,
  inventario: true,
  agenda: true,
  chat: true,
  agente: true,
  tablero: true,
  tareas: true,
  pos: true,
}

export function getActiveEmpresaId(): number | null {
  const stored = localStorage.getItem(ACTIVE_EMPRESA_KEY)
  return stored ? Number(stored) : null
}

export function setActiveEmpresaId(id: number | null) {
  if (id === null) {
    localStorage.removeItem(ACTIVE_EMPRESA_KEY)
  } else {
    localStorage.setItem(ACTIVE_EMPRESA_KEY, String(id))
  }
}

export function getModules(): ModuleConfig {
  const empresaId = getActiveEmpresaId()
  if (!empresaId) return allEnabled

  const empresa = empresaStore.getById(empresaId)
  if (!empresa || !empresa.modules) return allEnabled

  const result = { ...allEnabled }
  for (const key of Object.keys(result) as (keyof ModuleConfig)[]) {
    result[key] = empresa.modules[key] !== false
  }
  return result
}

export function saveEmpresaModules(empresaId: number, modules: Partial<Record<string, boolean>>) {
  empresaStore.update(empresaId, { modules })
}
