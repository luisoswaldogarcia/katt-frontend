import { getConfig, saveConfig, getCached } from './configApi'

export interface ModuleCatalogItem {
  key: string
  nombre: string
  descripcion: string
  costo: number
}

const defaults: ModuleCatalogItem[] = [
  { key: 'paciente', nombre: 'Pacientes', descripcion: 'Gestión de pacientes y expedientes', costo: 299 },
  { key: 'doctor', nombre: 'Usuarios', descripcion: 'Administración de usuarios y roles', costo: 0 },
  { key: 'empresa', nombre: 'Empresas', descripcion: 'Gestión de empresas y sus configuraciones', costo: 0 },
  { key: 'agenda', nombre: 'Agenda', descripcion: 'Calendario y citas', costo: 149 },
  { key: 'tareas', nombre: 'Tareas', descripcion: 'Tablero kanban y listas de tareas', costo: 149 },
]

export async function fetchModuleCatalog(): Promise<ModuleCatalogItem[]> {
  return getConfig<ModuleCatalogItem[]>('module-catalog', defaults)
}

export function getModuleCatalog(): ModuleCatalogItem[] {
  return getCached<ModuleCatalogItem[]>('module-catalog', defaults)
}

export async function saveModuleCatalog(catalog: ModuleCatalogItem[]) {
  await saveConfig('module-catalog', catalog)
}

export async function updateModulePrice(key: string, costo: number) {
  const catalog = getModuleCatalog()
  const updated = catalog.map(m => m.key === key ? { ...m, costo } : m)
  await saveModuleCatalog(updated)
  return updated
}

export async function updateModuleInfo(key: string, data: Partial<ModuleCatalogItem>) {
  const catalog = getModuleCatalog()
  const updated = catalog.map(m => m.key === key ? { ...m, ...data } : m)
  await saveModuleCatalog(updated)
  return updated
}
