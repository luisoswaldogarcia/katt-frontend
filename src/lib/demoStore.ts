import { api } from './api'

export interface PacienteData {
  id: string
  nombre: string
  doctor: string
  proximaCita: string
  telefono: string
  email: string
  foto?: string
  custom?: Record<string, unknown>
}

export interface DoctorData {
  id: string
  nombre: string
  rol: string
  empresaId?: string
  telefono: string
  email: string
  foto?: string
  custom?: Record<string, unknown>
  modules?: Partial<Record<string, boolean>>
}

export interface EmpresaData {
  id: string
  nombre: string
  rfc?: string
  telefono: string
  email: string
  direccion?: string
  foto?: string
  custom?: Record<string, unknown>
  modules?: Partial<Record<string, boolean>>
  statusPago?: 'Al día' | 'Pendiente' | 'Vencido'
}

export interface CitaData {
  id: string
  paciente: string
  doctor: string
  fecha: string
  hora: string
  motivo: string
}

export interface InventarioData {
  id: string
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  precioUnitario: number
  codigoBarras?: string
  foto?: string
  custom?: Record<string, unknown>
}

export interface MovimientoData {
  id: string
  itemId: string
  tipo: 'entrada' | 'salida'
  cantidad: number
  motivo: string
  fecha: string
}

export interface TareaData {
  id: string
  titulo: string
  tipo: string
  estado: string
  asignado: string
  campos: Record<string, unknown>
}

export interface PageResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}

// Cache + API store factory
function createStore<T extends { id: string }>(entity: string) {
  let cache: T[] = []
  let loaded = false

  return {
    // Sync access (reads from cache)
    getAll: () => cache,
    getById: (id: string) => cache.find(i => i.id === id),

    // Async - fetches from API and updates cache
    fetch: async (): Promise<T[]> => {
      const res = await api.list<T>(entity)
      cache = res.items
      loaded = true
      return cache
    },
    isLoaded: () => loaded,

    getPage: async (_page: number, _limit = 15): Promise<PageResult<T>> => {
      const res = await api.list<T>(entity)
      cache = res.items
      loaded = true
      return { data: res.items, total: res.items.length, hasMore: !!res.cursor }
    },

    create: async (data: Omit<T, 'id'>): Promise<T> => {
      const item = await api.create<T>(entity, data)
      cache = [...cache, item]
      return item
    },

    update: async (id: string, data: Partial<T>): Promise<void> => {
      await api.update(entity, id, data)
      cache = cache.map(i => i.id === id ? { ...i, ...data } : i)
    },

    remove: async (id: string): Promise<void> => {
      await api.remove(entity, id)
      cache = cache.filter(i => i.id !== id)
    },
  }
}

export const pacienteStore = createStore<PacienteData>('clientes')
export const doctorStore = createStore<DoctorData>('usuarios')
export const empresaStore = createStore<EmpresaData>('modulos')
export const inventarioStore = createStore<InventarioData>('inventario')
export const tareaStore = createStore<TareaData>('tareas')

export const citaStore = {
  ...createStore<CitaData>('agenda'),
  getByDateRange: (from: string, to: string): CitaData[] => {
    const all = citaStore.getAll()
    return all.filter(c => c.fecha >= from && c.fecha <= to).sort((a, b) => a.hora.localeCompare(b.hora))
  },
}

export const movimientoStore = {
  getByItem: (itemId: string): MovimientoData[] => [],
  create: async (data: Omit<MovimientoData, 'id'>): Promise<MovimientoData> => {
    return api.create<MovimientoData>('inventario', { ...data, tipo: data.tipo })
  },
}

// Preload all stores
export async function preloadStores() {
  await Promise.allSettled([
    pacienteStore.fetch(),
    doctorStore.fetch(),
    empresaStore.fetch(),
    inventarioStore.fetch(),
    tareaStore.fetch(),
    citaStore.fetch(),
  ])
}
