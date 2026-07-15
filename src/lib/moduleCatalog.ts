const STORAGE_KEY = 'katt-module-catalog'

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
  { key: 'inventario', nombre: 'Inventario', descripcion: 'Control de stock y movimientos', costo: 199 },
  { key: 'agenda', nombre: 'Agenda', descripcion: 'Calendario y citas', costo: 149 },
  { key: 'chat', nombre: 'Chat', descripcion: 'Mensajería interna', costo: 99 },
  { key: 'agente', nombre: 'Agente', descripcion: 'Asistente virtual con IA', costo: 499 },
  { key: 'tareas', nombre: 'Tareas', descripcion: 'Tablero kanban y listas de tareas', costo: 149 },
  { key: 'pos', nombre: 'Punto de Venta', descripcion: 'Cobro rápido y registro de ventas', costo: 249 },
]

export function getModuleCatalog(): ModuleCatalogItem[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try { return JSON.parse(stored) } catch { /* ignore */ }
  }
  return [...defaults]
}

export function saveModuleCatalog(catalog: ModuleCatalogItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
}

export function updateModulePrice(key: string, costo: number) {
  const catalog = getModuleCatalog()
  const updated = catalog.map(m => m.key === key ? { ...m, costo } : m)
  saveModuleCatalog(updated)
  return updated
}

export function updateModuleInfo(key: string, data: Partial<ModuleCatalogItem>) {
  const catalog = getModuleCatalog()
  const updated = catalog.map(m => m.key === key ? { ...m, ...data } : m)
  saveModuleCatalog(updated)
  return updated
}
