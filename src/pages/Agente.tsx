import { useState, useEffect, useRef } from 'react'
import { BASE_URL } from '../lib/api'
import { getToken } from '../lib/auth'
import { useKeyboardOffset } from '../hooks/useKeyboardOffset'

interface Mensaje {
  id: number
  texto: string
  propio: boolean
}

interface Sesion {
  id: string
  titulo: string
  createdAt: number
  updatedAt: number
}

const SESIONES_KEY = 'katt-agente-sesiones'
const MSG_PREFIX = 'katt-agente-msg-'

function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function cargarSesiones(): Sesion[] {
  try {
    const saved = localStorage.getItem(SESIONES_KEY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function guardarSesiones(sesiones: Sesion[]) {
  localStorage.setItem(SESIONES_KEY, JSON.stringify(sesiones))
}

function cargarMensajes(sesionId: string): Mensaje[] {
  try {
    const saved = localStorage.getItem(MSG_PREFIX + sesionId)
    if (saved) return JSON.parse(saved)
  } catch {}
  return [{ id: 1, texto: '¡Hola! Soy Katt 🐱 ¿En qué puedo ayudarte?', propio: false }]
}

function guardarMensajes(sesionId: string, mensajes: Mensaje[]) {
  localStorage.setItem(MSG_PREFIX + sesionId, JSON.stringify(mensajes))
}

function borrarSesion(sesionId: string) {
  localStorage.removeItem(MSG_PREFIX + sesionId)
}

export default function Agente() {
  const [sesiones, setSesiones] = useState<Sesion[]>(cargarSesiones)
  const [activa, setActiva] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const keyboardOffset = useKeyboardOffset()

  useEffect(() => {
    if (sesiones.length > 0 && !activa) {
      setActiva(sesiones[0].id)
    } else if (sesiones.length === 0) {
      crearSesion()
    }
  }, [])

  useEffect(() => {
    if (activa) {
      setMensajes(cargarMensajes(activa))
    }
  }, [activa])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [mensajes])

  function crearSesion() {
    const id = generarId()
    const nueva: Sesion = { id, titulo: 'Nueva conversación', createdAt: Date.now(), updatedAt: Date.now() }
    const updated = [nueva, ...sesiones]
    setSesiones(updated)
    guardarSesiones(updated)
    guardarMensajes(id, [{ id: 1, texto: '¡Hola! Soy Katt 🐱 ¿En qué puedo ayudarte?', propio: false }])
    setActiva(id)
    setSidebarOpen(false)
  }

  function eliminarSesion(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    borrarSesion(id)
    const updated = sesiones.filter(s => s.id !== id)
    setSesiones(updated)
    guardarSesiones(updated)
    if (activa === id) {
      setActiva(updated.length > 0 ? updated[0].id : null)
      if (updated.length === 0) crearSesion()
    }
  }

  function actualizarSesion(id: string, primerMsg: string) {
    const titulo = primerMsg.length > 40 ? primerMsg.slice(0, 40) + '…' : primerMsg
    const updated = sesiones.map(s => s.id === id ? { ...s, titulo, updatedAt: Date.now() } : s)
    setSesiones(updated)
    guardarSesiones(updated)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading || !activa) return
    const userMsg = message
    const updatedMsgs = [...mensajes, { id: Date.now(), texto: userMsg, propio: true }]
    setMensajes(updatedMsgs)
    guardarMensajes(activa, updatedMsgs)
    if (mensajes.filter(m => m.propio).length === 0) actualizarSesion(activa, userMsg)
    setMessage('')
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${BASE_URL}/agente`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: userMsg }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      const finalMsgs = [...updatedMsgs, { id: Date.now() + 1, texto: data.response, propio: false }]
      setMensajes(finalMsgs)
      guardarMensajes(activa, finalMsgs)
    } catch {
      const finalMsgs = [...updatedMsgs, { id: Date.now() + 1, texto: 'Ups, no pude procesar tu mensaje 😿', propio: false }]
      setMensajes(finalMsgs)
      guardarMensajes(activa, finalMsgs)
    } finally {
      setLoading(false)
    }
  }

  const sesionActiva = sesiones.find(s => s.id === activa)

  return (
    <div className="flex h-full">
      {/* Sidebar de sesiones */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-katt-900 border-r border-katt-200 dark:border-katt-800 transform transition-transform duration-300 flex flex-col`}>
        <div className="p-3 border-b border-katt-200 dark:border-katt-800">
          <button onClick={crearSesion} className="w-full px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
            + Nueva conversación
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sesiones.map(s => (
            <button
              key={s.id}
              onClick={() => { setActiva(s.id); setSidebarOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${activa === s.id ? 'bg-katt-100 dark:bg-katt-800 font-medium' : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'}`}
            >
              <span className="flex-1 truncate">{s.titulo}</span>
              <span onClick={e => eliminarSesion(s.id, e)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </span>
            </button>
          ))}
          {sesiones.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-8">Sin conversaciones</p>
          )}
        </div>
      </aside>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-2 px-4 py-3 border-b border-katt-200 dark:border-katt-800">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="text-sm font-medium truncate">{sesionActiva?.titulo || 'Agente'}</span>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {mensajes.map(m => (
            <div key={m.id} className={`flex ${m.propio ? 'justify-end' : 'justify-start'}`}>
              {!m.propio && <img src="/katt-avatar.jpeg" alt="Katt" className="w-6 h-6 rounded-full mr-2 self-end" />}
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                m.propio
                  ? 'bg-katt-500 text-white rounded-br-sm'
                  : 'bg-katt-100 dark:bg-katt-800 rounded-bl-sm'
              }`}>
                {m.texto}
              </div>
            </div>
          ))}
        </main>

        <footer className="p-4 border-t border-katt-200 dark:border-katt-800" style={{ paddingBottom: keyboardOffset > 0 ? keyboardOffset + 16 : undefined }}>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Pregúntale a Katt..."
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 focus:outline-none focus:ring-2 focus:ring-katt-500 text-sm"
            />
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-full bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {loading ? '...' : 'Enviar'}
            </button>
          </form>
        </footer>
      </div>
    </div>
  )
}
