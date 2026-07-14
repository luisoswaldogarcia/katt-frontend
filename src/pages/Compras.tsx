import { useState } from 'react'
import { compraStore } from '../lib/compras'
import type { Compra, CompraItem } from '../lib/compras'
import { inventarioStore } from '../lib/demoStore'
import { ConfirmModal } from '../components/ConfirmModal'

const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

const estadoColor: Record<Compra['estado'], string> = {
  Pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Recibida: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Cancelada: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export default function Compras() {
  const [compras, setCompras] = useState(compraStore.getAll)
  const [showForm, setShowForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [filtro, setFiltro] = useState('')

  const filtradas = filtro
    ? compras.filter(c => c.proveedor.toLowerCase().includes(filtro.toLowerCase()) || c.estado.toLowerCase().includes(filtro.toLowerCase()))
    : compras

  function handleCrear(compra: Omit<Compra, 'id'>) {
    compraStore.create(compra)
    setCompras(compraStore.getAll())
    setShowForm(false)
  }

  function handleEstado(id: number, estado: Compra['estado']) {
    compraStore.update(id, { estado })
    if (estado === 'Recibida') {
      const compra = compraStore.getById(id)
      compra?.items.forEach(item => {
        const prod = inventarioStore.getById(item.itemId)
        if (prod) inventarioStore.update(item.itemId, { cantidad: prod.cantidad + item.cantidad })
      })
    }
    setCompras(compraStore.getAll())
  }

  function handleDelete(id: number) {
    compraStore.remove(id)
    setCompras(compraStore.getAll())
    setConfirmDelete(null)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar por proveedor o estado..." className={inputClass} />

      {filtradas.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No hay compras registradas</p>}

      <div className="space-y-3">
        {filtradas.map(c => (
          <div key={c.id} className={cardClass}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{c.proveedor}</p>
                <p className="text-xs text-gray-500">{c.fecha} · {c.items.length} producto{c.items.length > 1 ? 's' : ''}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[c.estado]}`}>{c.estado}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">${c.total.toFixed(2)}</span>
              <div className="flex gap-1">
                {c.estado === 'Pendiente' && (
                  <>
                    <button onClick={() => handleEstado(c.id, 'Recibida')} className="px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">Recibir</button>
                    <button onClick={() => handleEstado(c.id, 'Cancelada')} className="px-2 py-1 rounded text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Cancelar</button>
                  </>
                )}
                <button onClick={() => setConfirmDelete(c.id)} className="px-2 py-1 rounded text-xs bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setShowForm(true)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-katt-500 hover:bg-katt-600 text-white shadow-lg flex items-center justify-center transition-colors z-40" aria-label="Nueva compra">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      {showForm && <CompraForm onSave={handleCrear} onClose={() => setShowForm(false)} />}

      {confirmDelete !== null && (
        <ConfirmModal message="¿Eliminar esta orden de compra?" onConfirm={() => handleDelete(confirmDelete)} onCancel={() => setConfirmDelete(null)} />
      )}
    </div>
  )
}

function CompraForm({ onSave, onClose }: { onSave: (c: Omit<Compra, 'id'>) => void; onClose: () => void }) {
  const [proveedor, setProveedor] = useState('')
  const [items, setItems] = useState<CompraItem[]>([])
  const [busqueda, setBusqueda] = useState('')

  const productos = inventarioStore.getAll()
  const filtrados = busqueda.trim() ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase())).slice(0, 6) : []
  const total = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)

  function handleAgregar(id: number) {
    const prod = productos.find(p => p.id === id)
    if (!prod) return
    setItems(prev => {
      const existe = prev.find(i => i.itemId === id)
      if (existe) return prev.map(i => i.itemId === id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { itemId: id, nombre: prod.nombre, cantidad: 1, precioUnitario: prod.precioUnitario }]
    })
    setBusqueda('')
  }

  function handleSubmit() {
    if (!proveedor.trim() || items.length === 0) return
    onSave({ proveedor: proveedor.trim(), fecha: new Date().toISOString().split('T')[0], items, total, estado: 'Pendiente' })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={cardClass + " w-full max-w-sm max-h-[85vh] flex flex-col"} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">Nueva orden de compra</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <input value={proveedor} onChange={e => setProveedor(e.target.value)} placeholder="Proveedor" className={inputClass} autoFocus />

        <div className="relative">
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Agregar producto..." className={inputClass} />
          {filtrados.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-katt-900 border border-katt-200 dark:border-katt-700 rounded-lg shadow-lg max-h-36 overflow-y-auto">
              {filtrados.map(p => (
                <button key={p.id} onClick={() => handleAgregar(p.id)} className="w-full text-left px-3 py-2 hover:bg-katt-50 dark:hover:bg-katt-800 text-sm">
                  {p.nombre} — ${p.precioUnitario}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {items.map(item => (
            <div key={item.itemId} className="flex items-center justify-between bg-katt-50 dark:bg-katt-800/40 rounded-lg px-3 py-2">
              <span className="text-sm truncate flex-1">{item.nombre}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setItems(prev => prev.map(i => i.itemId === item.itemId ? { ...i, cantidad: Math.max(1, i.cantidad - 1) } : i))} className="w-6 h-6 rounded bg-katt-200 dark:bg-katt-700 text-xs font-bold">−</button>
                <span className="w-8 text-center text-sm">{item.cantidad}</span>
                <button onClick={() => setItems(prev => prev.map(i => i.itemId === item.itemId ? { ...i, cantidad: i.cantidad + 1 } : i))} className="w-6 h-6 rounded bg-katt-200 dark:bg-katt-700 text-xs font-bold">+</button>
              </div>
              <button onClick={() => setItems(prev => prev.filter(i => i.itemId !== item.itemId))} className="text-red-400 hover:text-red-500 ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && <p className="text-sm font-bold text-right">Total: ${total.toFixed(2)}</p>}

        <button onClick={handleSubmit} disabled={!proveedor.trim() || items.length === 0} className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${!proveedor.trim() || items.length === 0 ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-katt-500 hover:bg-katt-600 text-white'}`}>
          Crear orden
        </button>
      </div>
    </div>
  )
}
