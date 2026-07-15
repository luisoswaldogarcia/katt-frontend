export interface Proveedor {
  id: number
  nombre: string
  contacto: string
  telefono: string
  email: string
  notas: string
}

export interface CompraItem {
  itemId: number
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Compra {
  id: number
  proveedor: string
  fecha: string
  items: CompraItem[]
  total: number
  estado: 'Pendiente' | 'Recibida' | 'Cancelada'
}

const STORAGE_KEY = 'katt-compras'
const PROV_KEY = 'katt-proveedores'

function load(): Compra[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) try { return JSON.parse(stored) } catch { /* ignore */ }
  return []
}

function save(data: Compra[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadProv(): Proveedor[] {
  const stored = localStorage.getItem(PROV_KEY)
  if (stored) try { return JSON.parse(stored) } catch { /* ignore */ }
  return []
}

function saveProv(data: Proveedor[]) {
  localStorage.setItem(PROV_KEY, JSON.stringify(data))
}

let proveedores = loadProv()
let compras = load()

export const proveedorStore = {
  getAll: () => [...proveedores],
  getById: (id: number) => proveedores.find(p => p.id === id),
  create: (data: Omit<Proveedor, 'id'>) => {
    const nuevo = { ...data, id: Date.now() }
    proveedores = [...proveedores, nuevo]
    saveProv(proveedores)
    return nuevo
  },
  update: (id: number, data: Partial<Proveedor>) => {
    proveedores = proveedores.map(p => p.id === id ? { ...p, ...data } : p)
    saveProv(proveedores)
  },
  remove: (id: number) => {
    proveedores = proveedores.filter(p => p.id !== id)
    saveProv(proveedores)
  },
}

export const compraStore = {
  getAll: () => [...compras],
  getById: (id: number) => compras.find(c => c.id === id),
  create: (data: Omit<Compra, 'id'>) => {
    const nueva = { ...data, id: Date.now() }
    compras = [...compras, nueva]
    save(compras)
    return nueva
  },
  update: (id: number, data: Partial<Compra>) => {
    compras = compras.map(c => c.id === id ? { ...c, ...data } : c)
    save(compras)
  },
  remove: (id: number) => {
    compras = compras.filter(c => c.id !== id)
    save(compras)
  },
}
