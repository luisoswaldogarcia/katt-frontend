import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarcodeDetector } from 'barcode-detector'
import { inventarioStore } from '../lib/demoStore'
import { getCategorias } from '../lib/categorias'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"

interface ScannedItem {
  codigo: string
  nombre: string
}

export default function InventarioCarga() {
  const navigate = useNavigate()
  const categorias = getCategorias()
  const [categoria, setCategoria] = useState('')
  const [items, setItems] = useState<ScannedItem[]>([])
  const [scanning, setScanning] = useState(false)
  const [pendingCode, setPendingCode] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  function handleDetected(code: string) {
    beep()
    setPendingCode(code)
    setNombre('')
    startListening()
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = 'es-MX'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript
      setNombre(text)
    }
    recognition.onend = () => setListening(false)
    recognition.start()
    setListening(true)
    recognitionRef.current = recognition
  }

  function handleAccept() {
    if (!pendingCode || !nombre.trim()) return
    setItems(prev => [...prev, { codigo: pendingCode, nombre: nombre.trim() }])
    setPendingCode(null)
    setNombre('')
  }

  function handleSave() {
    if (!categoria || items.length === 0) return
    for (const item of items) {
      inventarioStore.create({ nombre: item.nombre, categoria, cantidad: 1, unidad: '', precioUnitario: 0, codigoBarras: item.codigo } as never)
    }
    navigate('/inventario')
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-md mx-auto space-y-4">
        <select value={categoria} onChange={e => setCategoria(e.target.value)} className={inputClass}>
          <option value="">Seleccionar categoría *</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {!scanning ? (
          <button
            type="button"
            onClick={() => setScanning(true)}
            className="w-full py-6 rounded-xl border-2 border-dashed border-katt-300 dark:border-katt-700 flex flex-col items-center gap-2 text-katt-500 hover:bg-katt-50 dark:hover:bg-katt-900 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
              <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M7 12h10M7 8h2M7 16h2M15 8h2M15 16h2M11 8h2M11 16h2" />
            </svg>
            <span className="text-sm font-medium">Abrir escáner</span>
          </button>
        ) : (
          <Scanner onDetected={handleDetected} onClose={() => setScanning(false)} />
        )}

        {/* Modal dictar nombre */}
        {pendingCode && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPendingCode(null)}>
            <div className={cardClass + " w-full max-w-sm"} onClick={e => e.stopPropagation()}>
              <p className="text-xs text-gray-500">Código: <span className="font-mono">{pendingCode}</span></p>
              <p className="text-sm font-medium">Dicta o escribe el nombre del producto</p>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Nombre del producto"
                className={inputClass}
                autoFocus
              />
              <div className="flex gap-2">
                <button type="button" onClick={startListening} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300'}`}>
                  {listening ? '🎙 Escuchando...' : '🎙 Dictar'}
                </button>
                <button type="button" onClick={handleAccept} disabled={!nombre.trim()} className={`flex-1 ${btnPrimary} ${!nombre.trim() ? 'opacity-50' : ''}`}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-medium text-gray-500">{items.length} productos escaneados</span>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-katt-50 dark:bg-katt-800/40 text-sm">
                  <div>
                    <span className="block">{item.nombre}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{item.codigo}</span>
                  </div>
                  <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setScanning(false); navigate('/inventario') }} className="flex-1 px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                Cancelar
              </button>
              <button type="button" onClick={handleSave} disabled={!categoria} className={`flex-1 ${btnPrimary} ${!categoria ? 'opacity-50' : ''}`}>
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Scanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastCodeRef = useRef('')
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }, [])

  useEffect(() => {
    let active = true
    const detector = new BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
    })

    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then(async stream => {
        if (!active) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        const video = videoRef.current
        if (!video) return
        video.srcObject = stream
        await video.play().catch(() => {})

        const scan = async () => {
          if (!active) return
          if (video.readyState < 2) { requestAnimationFrame(scan); return }
          try {
            const barcodes = await detector.detect(video)
            if (barcodes.length > 0 && barcodes[0].rawValue !== lastCodeRef.current) {
              lastCodeRef.current = barcodes[0].rawValue
              onDetectedRef.current(barcodes[0].rawValue)
              await new Promise(r => setTimeout(r, 2000))
              lastCodeRef.current = ''
            }
          } catch { /* ignore */ }
          if (active) requestAnimationFrame(scan)
        }
        scan()
      })
      .catch(() => {})

    return () => { active = false; stopCamera() }
  }, [stopCamera])

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video ref={videoRef} className="w-full" muted playsInline autoPlay />
        <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-red-500/60 animate-pulse" />
      </div>
      <p className="text-center text-xs text-gray-500">Apunta al código de barras</p>
      <button type="button" onClick={() => { stopCamera(); onClose() }} className="w-full py-2 rounded-lg bg-katt-100 dark:bg-katt-800 text-sm">
        Cerrar escáner
      </button>
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
