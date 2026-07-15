const ACTIVE_EMPRESA_KEY = 'katt-active-empresa'
const MODULES_KEY = 'katt-modules'

export interface ModuleConfig {
  paciente: boolean
  doctor: boolean
  empresa: boolean
  inventario: boolean
  agenda: boolean
  chat: boolean
  agente: boolean
  tareas: boolean
  pos: boolean
  compras: boolean
}

export const moduleLabels: Record<keyof ModuleConfig, string> = {
  paciente: 'Pacientes',
  doctor: 'Usuarios',
  empresa: 'Empresas',
  inventario: 'Inventario',
  agenda: 'Agenda',
  chat: 'Chat',
  agente: 'Agente',
  tareas: 'Tareas',
  pos: 'Punto de Venta',
  compras: 'Compras',
}

const allEnabled: ModuleConfig = {
  paciente: true,
  doctor: true,
  empresa: true,
  inventario: true,
  agenda: true,
  chat: true,
  agente: true,
  tareas: true,
  pos: true,
  compras: true,
}

export function getActiveEmpresaId(): string | null {
  return localStorage.getItem(ACTIVE_EMPRESA_KEY)
}

export function setActiveEmpresaId(id: string | null) {
  if (id === null) {
    localStorage.removeItem(ACTIVE_EMPRESA_KEY)
  } else {
    localStorage.setItem(ACTIVE_EMPRESA_KEY, id)
  }
}

export function getModules(): ModuleConfig {
  const stored = localStorage.getItem(MODULES_KEY)
  if (stored) try { return { ...allEnabled, ...JSON.parse(stored) } } catch { /* ignore */ }
  return allEnabled
}

export function saveModules(modules: Partial<ModuleConfig>) {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules))
}

export function saveEmpresaModules(_empresaId: string, modules: Partial<Record<string, boolean>>) {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules))
}
