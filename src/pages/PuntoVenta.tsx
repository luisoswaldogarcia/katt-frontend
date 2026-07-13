import { useState, useRef, useEffect, useCallback } from 'react'
import { BarcodeDetector } from 'barcode-detector'
import { inventarioStore } from '../lib/demoStore'
import { registrarVenta, getVentasHoy } from '../lib/pos'
import type { VentaItem, Venta } from '../lib/pos'

const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"

export default function PuntoVenta() {
  const [busqueda, setBusqueda] = useState('')
  const [carrito, setCarrito] = useState<VentaItem[]>([])
  const [showCobrar, setShowCobrar] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [ventaExitosa, setVentaExitosa] = useState<Venta | null>(null)

  const productos = inventarioStore.getAll()
  const filtrados = busqueda.trim()
    ? productos.filter(p => (p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigoBarras?.includes(busqueda)) && p.cantidad > 0)
    : []

  const total = carrito.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0)
  const ventasHoy = getVentasHoy()
  const totalHoy = ventasHoy.reduce((s, v) => s + v.total, 0)

  function handleAgregar(itemId: number) {
    const prod = productos.find(p => p.id === itemId)
    if (!prod) return
    setCarrito(prev => {
      const existe = prev.find(i => i.itemId === itemId)
      if (existe) {
        if (existe.cantidad >= prod.cantidad) return prev
        return prev.map(i => i.itemId === itemId ? { ...i, cantidad: i.cantidad + 1 } : i)
      }
      return [...prev, { itemId, nombre: prod.nombre, cantidad: 1, precioUnitario: prod.precioUnitario }]
    })
    setBusqueda('')
  }

  function handleCantidad(itemId: number, delta: number) {
    setCarrito(prev => prev.map(i => {
      if (i.itemId !== itemId) return i
      const nueva = i.cantidad + delta
      return nueva < 1 ? i : { ...i, cantidad: nueva }
    }))
  }

  function handleQuitar(itemId: number) {
    setCarrito(prev => prev.filter(i => i.itemId !== itemId))
  }

  function handleCobrar(metodoPago: Venta['metodoPago'], recibido?: number) {
    const venta = registrarVenta(carrito, metodoPago, recibido)
    setCarrito([])
    setShowCobrar(false)
    setVentaExitosa(venta)
    setTimeout(() => setVentaExitosa(null), 3000)
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Resumen del día */}
      <div className="flex gap-4 text-sm">
        <div className={cardClass + " flex-1 !space-y-1"}>
          <p className="text-xs text-gray-500">Ventas hoy</p>
          <p className="font-bold text-lg">{ventasHoy.length}</p>
        </div>
        <div className={cardClass + " flex-1 !space-y-1"}>
          <p className="text-xs text-gray-500">Total hoy</p>
          <p className="font-bold text-lg text-green-600 dark:text-green-400">${totalHoy.toFixed(2)}</p>
        </div>
      </div>

      {ventaExitosa && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-3 text-sm text-green-700 dark:text-green-300">
          ✓ Venta registrada — ${ventaExitosa.total.toFixed(2)} ({ventaExitosa.metodoPago})
          {ventaExitosa.recibido && ventaExitosa.recibido > ventaExitosa.total && (
            <span className="ml-2">· Cambio: ${(ventaExitosa.recibido - ventaExitosa.total).toFixed(2)}</span>
          )}
        </div>
      )}

      {/* Buscar producto */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar producto o código..."
            className={inputClass}
            autoFocus
          />
          <button
            onClick={() => setShowScanner(true)}
            className={btnPrimary + " shrink-0"}
            title="Escanear código de barras"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M7 12h10M7 8h2M7 16h2M15 8h2M15 16h2M11 8h2M11 16h2" />
            </svg>
          </button>
        </div>
        {filtrados.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-katt-900 border border-katt-200 dark:border-katt-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtrados.map(p => (
              <button
                key={p.id}
                onClick={() => handleAgregar(p.id)}
                className="w-full text-left px-3 py-2 hover:bg-katt-50 dark:hover:bg-katt-800 text-sm flex justify-between"
              >
                <span>{p.nombre}</span>
                <span className="text-gray-500">${p.precioUnitario} · Stock: {p.cantidad}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrito */}
      <div className={cardClass}>
        <h3 className="text-sm font-bold">Carrito ({carrito.length})</h3>
        {carrito.length === 0 && <p className="text-xs text-gray-400">Agrega productos para iniciar una venta</p>}
        <div className="space-y-2">
          {carrito.map(item => (
            <div key={item.itemId} className="flex items-center justify-between gap-2 bg-katt-50 dark:bg-katt-800/40 rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.nombre}</p>
                <p className="text-xs text-gray-500">${item.precioUnitario} c/u</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleCantidad(item.itemId, -1)} className="w-6 h-6 rounded bg-katt-200 dark:bg-katt-700 text-xs font-bold">−</button>
                <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                <button onClick={() => handleCantidad(item.itemId, 1)} className="w-6 h-6 rounded bg-katt-200 dark:bg-katt-700 text-xs font-bold">+</button>
              </div>
              <span className="text-sm font-medium w-16 text-right">${(item.cantidad * item.precioUnitario).toFixed(2)}</span>
              <button onClick={() => handleQuitar(item.itemId)} className="text-red-400 hover:text-red-500 ml-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>

        {carrito.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-katt-200 dark:border-katt-700">
            <span className="font-bold">Total</span>
            <span className="font-bold text-lg">${total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Botón cobrar */}
      {carrito.length > 0 && (
        <button onClick={() => setShowCobrar(true)} className={`w-full py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-base transition-colors`}>
          Cobrar ${total.toFixed(2)}
        </button>
      )}

      {/* Modal cobrar */}
      {showCobrar && <CobrarModal total={total} onCobrar={handleCobrar} onClose={() => setShowCobrar(false)} />}

      {/* Scanner */}
      {showScanner && <BarcodeScanner onDetected={(code) => {
        const prod = inventarioStore.getAll().find(p => p.codigoBarras === code)
        if (prod) {
          beep()
          setCarrito(prev => {
            const existe = prev.find(i => i.itemId === prod.id)
            if (existe) {
              if (existe.cantidad >= prod.cantidad) return prev
              return prev.map(i => i.itemId === prod.id ? { ...i, cantidad: i.cantidad + 1 } : i)
            }
            return [...prev, { itemId: prod.id, nombre: prod.nombre, cantidad: 1, precioUnitario: prod.precioUnitario }]
          })
        } else {
          beepError()
          setPendingCode(code)
        }
      }} onClose={() => setShowScanner(false)} />
      }

      {/* Modal asignar código */}
      {pendingCode && <AsignarCodigoModal code={pendingCode} onAsignar={(itemId) => {
        inventarioStore.update(itemId, { codigoBarras: pendingCode })
        beep()
        const prod = inventarioStore.getById(itemId)
        if (prod) {
          setCarrito(prev => {
            const existe = prev.find(i => i.itemId === itemId)
            if (existe) {
              if (existe.cantidad >= prod.cantidad) return prev
              return prev.map(i => i.itemId === itemId ? { ...i, cantidad: i.cantidad + 1 } : i)
            }
            return [...prev, { itemId, nombre: prod.nombre, cantidad: 1, precioUnitario: prod.precioUnitario }]
          })
        }
        setPendingCode(null)
      }} onClose={() => setPendingCode(null)} />}
    </div>
  )
}

function CobrarModal({ total, onCobrar, onClose }: {
  total: number
  onCobrar: (metodo: Venta['metodoPago'], recibido?: number) => void
  onClose: () => void
}) {
  const [metodo, setMetodo] = useState<Venta['metodoPago']>('efectivo')
  const [recibido, setRecibido] = useState('')

  const cambio = metodo === 'efectivo' && Number(recibido) > total ? Number(recibido) - total : 0

  function handleConfirmar() {
    if (metodo === 'efectivo' && Number(recibido) < total) return
    onCobrar(metodo, metodo === 'efectivo' ? Number(recibido) : undefined)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={cardClass + " w-full max-w-sm"} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-center">Cobrar ${total.toFixed(2)}</h3>

        <div className="flex gap-2">
          {(['efectivo', 'tarjeta', 'transferencia'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMetodo(m)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${metodo === m ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300'}`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {metodo === 'efectivo' && (
          <div className="space-y-2">
            <input
              type="number"
              value={recibido}
              onChange={e => setRecibido(e.target.value)}
              placeholder="Monto recibido"
              className={inputClass}
              autoFocus
            />
            {cambio > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Cambio: ${cambio.toFixed(2)}</p>
            )}
          </div>
        )}

        <button
          onClick={handleConfirmar}
          disabled={metodo === 'efectivo' && Number(recibido) < total}
          className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${metodo === 'efectivo' && Number(recibido) < total ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          Confirmar pago
        </button>
      </div>
    </div>
  )
}

function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastCodeRef = useRef('')
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected
  const [error, setError] = useState('')
  const [lastScanned, setLastScanned] = useState('')

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let active = true
    const detector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
    })

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Cámara no disponible. Asegúrate de usar HTTPS.')
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(async stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream

        await video.play().catch(() => { /* autoplay handles it */ })

        const scan = async () => {
          if (!active) return
          if (video.readyState < 2) { requestAnimationFrame(scan); return }
          try {
            const barcodes = await detector.detect(video)
            if (barcodes.length > 0 && barcodes[0].rawValue !== lastCodeRef.current) {
              lastCodeRef.current = barcodes[0].rawValue
              setLastScanned(barcodes[0].rawValue)
              onDetectedRef.current(barcodes[0].rawValue)
              await new Promise(r => setTimeout(r, 1500))
              lastCodeRef.current = ''
            }
          } catch { /* ignore */ }
          if (active) requestAnimationFrame(scan)
        }
        scan()
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') setError('Permiso de cámara denegado. Activa el permiso en ajustes del navegador.')
        else if (err.name === 'NotFoundError') setError('No se encontró cámara en este dispositivo.')
        else if (err.name === 'NotReadableError') setError('La cámara está en uso por otra app.')
        else setError(`Error de cámara: ${err.message}`)
      })

    return () => { active = false; stopCamera() }
  }, [stopCamera])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-sm space-y-3" onClick={e => e.stopPropagation()}>
        {error ? (
          <p className="text-center text-red-400 text-sm">{error}</p>
        ) : (
          <video ref={videoRef} className="w-full rounded-xl" muted playsInline autoPlay />
        )}
        {lastScanned && (
          <p className="text-center text-green-400 text-xs">✓ {lastScanned}</p>
        )}
        <p className="text-center text-white/70 text-xs">Escanea productos uno tras otro</p>
        <button onClick={() => { stopCamera(); onClose() }} className="w-full py-2 rounded-lg bg-white/10 text-white text-sm">
          Listo
        </button>
      </div>
    </div>
  )
}

function beep() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 1200
  gain.gain.value = 0.3
  osc.start()
  osc.stop(ctx.currentTime + 0.1)
}

function beepError() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.frequency.value = 400
  osc.type = 'square'
  gain.gain.value = 0.2
  osc.start()
  osc.stop(ctx.currentTime + 0.25)
}

function AsignarCodigoModal({ code, onAsignar, onClose }: {
  code: string
  onAsignar: (itemId: number) => void
  onClose: () => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const productos = inventarioStore.getAll().filter(p => !p.codigoBarras)
  const filtrados = busqueda.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : productos

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={cardClass + " w-full max-w-sm max-h-[80vh] flex flex-col"} onClick={e => e.stopPropagation()}>
        <h3 className="font-bold text-sm">Código no registrado</h3>
        <p className="text-xs text-gray-500">Código: <span className="font-mono">{code}</span></p>
        <p className="text-xs text-gray-500">Selecciona el producto para asignarle este código:</p>
        <input
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar producto..."
          className={inputClass}
          autoFocus
        />
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {filtrados.map(p => (
            <button
              key={p.id}
              onClick={() => onAsignar(p.id)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-katt-50 dark:hover:bg-katt-800 text-sm flex justify-between"
            >
              <span>{p.nombre}</span>
              <span className="text-xs text-gray-500">${p.precioUnitario}</span>
            </button>
          ))}
          {filtrados.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No hay productos sin código</p>}
        </div>
        <button onClick={onClose} className="w-full py-2 rounded-lg bg-katt-100 dark:bg-katt-800 text-sm">
          Cancelar
        </button>
      </div>
    </div>
  )
}
