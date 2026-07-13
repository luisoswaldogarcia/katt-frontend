import { inventarioStore } from './demoStore'

const STORAGE_KEY = 'katt-ventas'

export interface VentaItem {
  itemId: number
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Venta {
  id: number
  items: VentaItem[]
  total: number
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
  fecha: string
  recibido?: number
}

function load(): Venta[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) try { return JSON.parse(stored) } catch { /* ignore */ }
  return []
}

function save(ventas: Venta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ventas))
}

export function getVentas(): Venta[] {
  return load()
}

export function registrarVenta(items: VentaItem[], metodoPago: Venta['metodoPago'], recibido?: number): Venta {
  const ventas = load()
  const venta: Venta = {
    id: Date.now(),
    items,
    total: items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0),
    metodoPago,
    fecha: new Date().toISOString(),
    recibido,
  }
  ventas.unshift(venta)
  save(ventas)

  // Descontar del inventario
  for (const item of items) {
    const prod = inventarioStore.getById(item.itemId)
    if (prod) inventarioStore.update(item.itemId, { cantidad: prod.cantidad - item.cantidad })
  }

  return venta
}

export function getVentasHoy(): Venta[] {
  const hoy = new Date().toISOString().split('T')[0]
  return load().filter(v => v.fecha.startsWith(hoy))
}
