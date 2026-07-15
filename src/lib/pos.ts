import { api } from './api'
import { inventarioStore } from './demoStore'

export interface VentaItem {
  itemId: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Venta {
  id: string
  items: VentaItem[]
  total: number
  metodoPago: 'efectivo' | 'tarjeta' | 'transferencia'
  fecha: string
  recibido?: number
}

let ventasCache: Venta[] = []

export async function fetchVentas(): Promise<Venta[]> {
  const res = await api.list<Venta>('ventas')
  ventasCache = res.items
  return ventasCache
}

export function getVentas(): Venta[] {
  return ventasCache
}

export async function registrarVenta(items: VentaItem[], metodoPago: Venta['metodoPago'], recibido?: number): Promise<Venta> {
  const total = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
  const venta = await api.create<Venta>('ventas', { items, total, metodoPago, fecha: new Date().toISOString(), recibido })
  ventasCache = [venta, ...ventasCache]

  // Descontar del inventario local
  for (const item of items) {
    const prod = inventarioStore.getById(item.itemId)
    if (prod) await inventarioStore.update(item.itemId, { cantidad: prod.cantidad - item.cantidad })
  }

  return venta
}

export function getVentasHoy(): Venta[] {
  const hoy = new Date().toISOString().split('T')[0]
  return ventasCache.filter(v => v.fecha.startsWith(hoy))
}
