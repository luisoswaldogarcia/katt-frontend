import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { inventarioStore, movimientoStore } from '../lib/demoStore'

const isDesktop = !('ontouchstart' in window || navigator.maxTouchPoints > 0)

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function InventarioMovimiento() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { ids: string[] } | null }
  const ids: string[] = state?.ids || []
  const items = ids.map(id => inventarioStore.getById(id)).filter(Boolean)

  const [motivo, setMotivo] = useState('')
  const [cantidades, setCantidades] = useState<Record<string, number>>(
    Object.fromEntries(ids.map(id => [id, 0]))
  )
  const [rawInputs, setRawInputs] = useState<Record<string, string>>(
    Object.fromEntries(ids.map(id => [id, '0']))
  )

  function updateCantidad(id: string, delta: number) {
    const next = (cantidades[id] || 0) + delta
    setCantidades(prev => ({ ...prev, [id]: next }))
    setRawInputs(prev => ({ ...prev, [id]: String(next) }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!motivo.trim()) return
    const fecha = new Date().toISOString().split('T')[0]
    for (const id of ids) {
      const cant = cantidades[id]
      if (cant !== 0) {
        movimientoStore.create({ itemId: id, tipo: cant > 0 ? 'entrada' : 'salida', cantidad: Math.abs(cant), motivo, fecha })
      }
    }
    navigate('/inventario')
  }

  if (items.length === 0) {
    navigate('/inventario')
    return null
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Motivo general en encabezado */}
        <div className="rounded-lg border border-katt-200 dark:border-katt-800 bg-white/40 dark:bg-katt-900/40 backdrop-blur-xl p-4 space-y-2">
          <label className="text-sm font-medium">Motivo del movimiento</label>
          <input
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ej: Reabastecimiento, Uso en consulta..."
            required
            className={inputClass}
          />
        </div>

        {/* Lista de productos */}
        <div className="space-y-3">
          {items.map(item => {
            if (!item) return null
            return (
              <div key={item.id} className="rounded-lg border border-katt-200 dark:border-katt-800 bg-white/40 dark:bg-katt-900/40 backdrop-blur-xl p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-katt-500 truncate">{item.nombre}</p>
                  <p className="text-xs text-gray-500">Stock: {item.cantidad} {item.unidad}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateCantidad(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 flex items-center justify-center transition-colors text-base font-black"
                  >−</button>
                  <input
                    type={isDesktop ? 'text' : 'number'}
                    inputMode="numeric"
                    value={rawInputs[item.id] ?? '0'}
                    onChange={e => {
                      const v = e.target.value
                      setRawInputs(prev => ({ ...prev, [item.id]: v }))
                      const n = Number(v)
                      if (!isNaN(n) && v !== '' && v !== '-') setCantidades(prev => ({ ...prev, [item.id]: n }))
                    }}
                    onBlur={() => setRawInputs(prev => ({ ...prev, [item.id]: String(cantidades[item.id] || 0) }))}
                    className={`w-10 py-1 text-xs rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-center focus:outline-none focus:ring-2 focus:ring-katt-500 ${cantidades[item.id] > 0 ? 'text-green-500' : cantidades[item.id] < 0 ? 'text-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => updateCantidad(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 flex items-center justify-center transition-colors text-base font-black"
                  >+</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/inventario')} className="flex-1 px-4 py-2 rounded-lg border border-katt-200 dark:border-katt-700 text-sm font-medium transition-colors hover:bg-katt-100 dark:hover:bg-katt-800">
            Cancelar
          </button>
          <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
            Aplicar movimientos
          </button>
        </div>
      </form>
    </div>
  )
}
