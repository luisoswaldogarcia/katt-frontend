import { getConfig, saveConfig, getCached } from './configApi'

const ACTIVE_EMPRESA_KEY = 'katt-active-empresa'

export interface ModuleConfig {
  clientes: boolean
  usuarios: boolean
  inventario: boolean
  agenda: boolean
  chat: boolean
  agente: boolean
  tareas: boolean
  pos: boolean
  compras: boolean
}

export const moduleLabels: Record<keyof ModuleConfig, string> = {
  clientes: 'Clientes',
  usuarios: 'Usuarios',
  inventario: 'Inventario',
  agenda: 'Agenda',
  chat: 'Chat',
  agente: 'Agente',
  tareas: 'Tareas',
  pos: 'Punto de Venta',
  compras: 'Compras',
}

const allEnabled: ModuleConfig = {
  clientes: true,
  usuarios: true,
  inventario: true,
  agenda: true,
  chat: true,
  agente: true,
  tareas: true,
  pos: true,
  compras: true,
}

// empresaId is local-only (which empresa the user is viewing)
export function getActiveEmpresaId(): string | null {
  return localStorage.getItem(ACTIVE_EMPRESA_KEY)
}

export function setActiveEmpresaId(id: string | null) {
  if (id === null) localStorage.removeItem(ACTIVE_EMPRESA_KEY)
  else localStorage.setItem(ACTIVE_EMPRESA_KEY, id)
}

export async function fetchModules(): Promise<ModuleConfig> {
  return getConfig<ModuleConfig>('modules', allEnabled)
}

export function getModules(): ModuleConfig {
  return getCached<ModuleConfig>('modules', allEnabled)
}

export async function saveModules(modules: Partial<ModuleConfig>) {
  await saveConfig('modules', { ...allEnabled, ...modules })
  window.dispatchEvent(new Event('katt:modules'))
}

export async function saveEmpresaModules(_empresaId: string, modules: Partial<Record<string, boolean>>) {
  await saveModules(modules as Partial<ModuleConfig>)
}
