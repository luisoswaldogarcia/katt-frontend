import { useState } from 'react'

interface Mensaje {
  id: number
  texto: string
  propio: boolean
}

export default function Agente() {
  const [message, setMessage] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, texto: '¡Hola! Soy Katt 🐱 ¿En qué puedo ayudarte?', propio: false },
  ])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setMensajes(prev => [...prev, { id: Date.now(), texto: message, propio: true }])
    setMessage('')
    // TODO: conectar con backend de IA
    setTimeout(() => {
      setMensajes(prev => [...prev, { id: Date.now() + 1, texto: 'Estoy en modo demo, pronto tendré respuestas inteligentes 🐱', propio: false }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
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

      <footer className="p-4 border-t border-katt-200 dark:border-katt-800">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Pregúntale a Katt..."
            className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 focus:outline-none focus:ring-2 focus:ring-katt-500 text-sm"
          />
          <button type="submit" className="px-4 py-2 rounded-full bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
            Enviar
          </button>
        </form>
      </footer>
    </div>
  )
}
