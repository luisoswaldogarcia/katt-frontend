import { useState, useRef } from 'react'
import { inventarioStore } from '../lib/demoStore'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function InventarioImagenes() {
  const [items, setItems] = useState(() => inventarioStore.getAll().filter(i => !i.foto))
  const [busqueda, setBusqueda] = useState('')
  const [capturando, setCapturando] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const filtrados = busqueda.trim()
    ? items.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : items

  function handleClick(id: string) {
    setCapturando(id)
    setTimeout(() => cameraRef.current?.click(), 50)
  }

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !capturando) { setCapturando(null); return }
    const reader = new FileReader()
    reader.onload = () => {
      inventarioStore.update(capturando!, { foto: reader.result as string })
      setItems(prev => prev.filter(i => i.id !== capturando))
      setCapturando(null)
    }
    reader.readAsDataURL(file)
    if (cameraRef.current) cameraRef.current.value = ''
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-md mx-auto space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {items.length} producto{items.length !== 1 && 's'} sin imagen
        </p>

        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Filtrar productos..."
          className={inputClass}
          autoFocus
        />

        <div className="space-y-1">
          {filtrados.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-katt-50 dark:hover:bg-katt-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-katt-100 dark:bg-katt-800 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-katt-400">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm block truncate">{item.nombre}</span>
                <span className="text-[10px] text-gray-400">{item.categoria}</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-katt-500 shrink-0">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          ))}
          {filtrados.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">
              {items.length === 0 ? 'Todos los productos tienen imagen 🎉' : 'Sin resultados'}
            </p>
          )}
        </div>

        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />
      </div>
    </div>
  )
}
