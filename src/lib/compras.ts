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

function load(): Compra[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) try { return JSON.parse(stored) } catch { /* ignore */ }
  return []
}

function save(data: Compra[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

let compras = load()

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
