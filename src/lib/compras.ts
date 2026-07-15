import { api } from './api'

export interface Proveedor {
  id: string
  nombre: string
  contacto: string
  telefono: string
  email: string
  notas: string
}

export interface CompraItem {
  itemId: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Compra {
  id: string
  proveedor: string
  fecha: string
  items: CompraItem[]
  total: number
  estado: 'Pendiente' | 'Recibida' | 'Cancelada'
}

let comprasCache: Compra[] = []
let proveedoresCache: Proveedor[] = []

export const proveedorStore = {
  getAll: () => proveedoresCache,
  getById: (id: string) => proveedoresCache.find(p => p.id === id),
  fetch: async (): Promise<Proveedor[]> => {
    // Proveedores stored as compras with tipo=proveedor
    const res = await api.list<any>('compras')
    proveedoresCache = res.items.filter((i: any) => i.tipo === 'proveedor')
    return proveedoresCache
  },
  create: async (data: Omit<Proveedor, 'id'>): Promise<Proveedor> => {
    const item = await api.create<Proveedor>('compras', { ...data, tipo: 'proveedor' })
    proveedoresCache = [...proveedoresCache, item]
    return item
  },
  update: async (id: string, data: Partial<Proveedor>): Promise<void> => {
    await api.update('compras', id, data)
    proveedoresCache = proveedoresCache.map(p => p.id === id ? { ...p, ...data } : p)
  },
  remove: async (id: string): Promise<void> => {
    await api.remove('compras', id)
    proveedoresCache = proveedoresCache.filter(p => p.id !== id)
  },
}

export const compraStore = {
  getAll: () => comprasCache,
  getById: (id: string) => comprasCache.find(c => c.id === id),
  fetch: async (): Promise<Compra[]> => {
    const res = await api.list<any>('compras')
    comprasCache = res.items.filter((i: any) => !i.tipo || i.tipo === 'compra')
    return comprasCache
  },
  create: async (data: Omit<Compra, 'id'>): Promise<Compra> => {
    const item = await api.create<Compra>('compras', { ...data, tipo: 'compra' })
    comprasCache = [...comprasCache, item]
    return item
  },
  update: async (id: string, data: Partial<Compra>): Promise<void> => {
    await api.update('compras', id, data)
    comprasCache = comprasCache.map(c => c.id === id ? { ...c, ...data } : c)
  },
  remove: async (id: string): Promise<void> => {
    await api.remove('compras', id)
    comprasCache = comprasCache.filter(c => c.id !== id)
  },
}
