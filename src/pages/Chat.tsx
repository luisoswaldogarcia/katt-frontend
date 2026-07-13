import { useState } from 'react'

interface Contacto {
  id: number
  nombre: string
  rol: string
  ultimoMensaje: string
  hora: string
  sinLeer: number
}

interface Mensaje {
  id: number
  texto: string
  propio: boolean
  hora: string
}

const mockContactos: Contacto[] = [
  { id: 1, nombre: 'Dr. García', rol: 'Doctor', ultimoMensaje: 'La cita está confirmada', hora: '10:30', sinLeer: 2 },
  { id: 2, nombre: 'María López', rol: 'Paciente', ultimoMensaje: '¿A qué hora es mi cita?', hora: '09:15', sinLeer: 1 },
  { id: 3, nombre: 'Admin Sistema', rol: 'Administrador', ultimoMensaje: 'Se actualizó el sistema', hora: 'Ayer', sinLeer: 0 },
  { id: 4, nombre: 'Dra. Gómez', rol: 'Doctor', ultimoMensaje: 'Revisé los resultados', hora: 'Ayer', sinLeer: 0 },
  { id: 5, nombre: 'Carlos Ramírez', rol: 'Paciente', ultimoMensaje: 'Gracias por la info', hora: 'Lun', sinLeer: 0 },
]

const mockMensajes: Record<number, Mensaje[]> = {
  1: [
    { id: 1, texto: 'Hola Dr., ¿está disponible mañana?', propio: true, hora: '10:20' },
    { id: 2, texto: 'Sí, tengo espacio a las 3pm', propio: false, hora: '10:25' },
    { id: 3, texto: 'Perfecto, agendo entonces', propio: true, hora: '10:28' },
    { id: 4, texto: 'La cita está confirmada', propio: false, hora: '10:30' },
  ],
  2: [
    { id: 1, texto: '¿A qué hora es mi cita?', propio: false, hora: '09:15' },
  ],
}

export default function Chat() {
  const [contactoActivo, setContactoActivo] = useState<Contacto | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [mensajes, setMensajes] = useState(mockMensajes)

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensaje.trim() || !contactoActivo) return
    const nuevo: Mensaje = { id: Date.now(), texto: mensaje, propio: true, hora: 'Ahora' }
    setMensajes(prev => ({
      ...prev,
      [contactoActivo.id]: [...(prev[contactoActivo.id] || []), nuevo],
    }))
    setMensaje('')
  }

  return (
    <div className="flex h-full">
      {/* Lista de contactos */}
      <div className={`${contactoActivo ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 border-r border-katt-200 dark:border-katt-800`}>
        <div className="p-3">
          <input
            placeholder="Buscar conversación..."
            className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockContactos.map(c => (
            <button
              key={c.id}
              onClick={() => setContactoActivo(c)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                contactoActivo?.id === c.id
                  ? 'bg-katt-100 dark:bg-katt-800'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-sm font-medium">
                {c.nombre[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium truncate">{c.nombre}</span>
                  <span className="text-xs text-gray-500">{c.hora}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 truncate">{c.ultimoMensaje}</span>
                  {c.sinLeer > 0 && (
                    <span className="ml-2 w-5 h-5 rounded-full bg-katt-500 text-white text-xs flex items-center justify-center">
                      {c.sinLeer}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área de chat */}
      {contactoActivo ? (
        <div className="flex-1 flex flex-col">
          {/* Header del chat */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-katt-200 dark:border-katt-800">
            <button
              onClick={() => setContactoActivo(null)}
              className="md:hidden p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center text-sm font-medium">
              {contactoActivo.nombre[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{contactoActivo.nombre}</p>
              <p className="text-xs text-gray-500">{contactoActivo.rol}</p>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(mensajes[contactoActivo.id] || []).map(m => (
              <div key={m.id} className={`flex ${m.propio ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  m.propio
                    ? 'bg-katt-500 text-white rounded-br-sm'
                    : 'bg-katt-100 dark:bg-katt-800 rounded-bl-sm'
                }`}>
                  <p>{m.texto}</p>
                  <p className={`text-xs mt-1 ${m.propio ? 'text-white/70' : 'text-gray-500'}`}>{m.hora}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <footer className="p-4 border-t border-katt-200 dark:border-katt-800">
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 focus:outline-none focus:ring-2 focus:ring-katt-500 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
              >
                Enviar
              </button>
            </form>
          </footer>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
          Selecciona una conversación
        </div>
      )}
    </div>
  )
}
