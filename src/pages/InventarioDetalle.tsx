import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { inventarioStore, movimientoStore } from '../lib/demoStore'
import { getCustomFields } from '../lib/customFields'
import { ConfirmModal } from '../components/ConfirmModal'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function InventarioDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showMov, setShowMov] = useState(false)
  const [tipoMov, setTipoMov] = useState<'entrada' | 'salida'>('entrada')
  const [showConfirm, setShowConfirm] = useState(false)
  const [, forceUpdate] = useState(0)

  const item = inventarioStore.getById(id!)
  if (!item) {
    return <div className="p-4 text-center text-gray-500">Artículo no encontrado.</div>
  }

  const customFields = getCustomFields('inventario')
  const custom = item.custom as Record<string, unknown> | undefined
  const movimientos = movimientoStore.getByItem(item.id)

  function handleMovimiento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    movimientoStore.create({
      itemId: item!.id,
      tipo: tipoMov,
      cantidad: Number(fd.get('cantidad')),
      motivo: fd.get('motivo') as string,
      fecha: new Date().toISOString().split('T')[0],
    })
    setShowMov(false)
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-xl font-bold overflow-hidden">
            {item.foto ? (
              <img src={item.foto} alt="" className="w-full h-full object-cover" />
            ) : (
              item.nombre[0]
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold">{item.nombre}</h2>
            <p className="text-sm text-gray-500">{labels.inventario}</p>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Categoría</span>
            <span>{item.categoria}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cantidad</span>
            <span className={item.cantidad <= 10 ? 'text-red-500 font-medium' : ''}>{item.cantidad} {item.unidad}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Precio unitario</span>
            <span>${item.precioUnitario}</span>
          </div>
        </div>

        {custom && customFields.length > 0 && (
          <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
            {customFields.map(f => {
              const val = custom[f.id]
              if (val === undefined || val === '' || val === null) return null
              return (
                <div key={f.id} className="flex justify-between text-sm">
                  <span className="text-gray-500">{f.label}</span>
                  <span>{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Botones movimiento */}
        <div className="flex gap-2">
          <button
            onClick={() => { setTipoMov('entrada'); setShowMov(true) }}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
          >
            + Entrada
          </button>
          <button
            onClick={() => { setTipoMov('salida'); setShowMov(true) }}
            className="flex-1 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-colors"
          >
            − Salida
          </button>
        </div>

        {/* Historial de movimientos */}
        {movimientos.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Movimientos</h3>
            <div className="space-y-2">
              {movimientos.map(m => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800 text-sm">
                  <div>
                    <span className={m.tipo === 'entrada' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                      {m.tipo === 'entrada' ? '+' : '−'}{m.cantidad}
                    </span>
                    <span className="ml-2 text-gray-500">{m.motivo}</span>
                  </div>
                  <span className="text-xs text-gray-500">{m.fecha}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/inventario/editar/${item.id}`)}
            className="flex-1 px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium transition-colors"
          >
            Eliminar
          </button>
        </div>

        <button
          onClick={() => navigate('/inventario')}
          className="w-full px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors border border-katt-200 dark:border-katt-800"
        >
          Volver
        </button>
      </div>

      {/* Modal movimiento */}
      {showMov && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowMov(false)}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 w-full max-w-sm space-y-4 border border-katt-200 dark:border-katt-700" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-sm">
              {tipoMov === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
            </h3>
            <form onSubmit={handleMovimiento} className="space-y-3">
              <input name="cantidad" type="number" min="1" required placeholder="Cantidad" className={inputClass} />
              <input name="motivo" required placeholder="Motivo" className={inputClass} />
              <button type="submit" className={`w-full px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${tipoMov === 'entrada' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                Confirmar
              </button>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <ConfirmModal
          message={`¿Eliminar "${item.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={async () => { await inventarioStore.remove(item.id); navigate('/inventario') }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  )
}
