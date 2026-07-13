import { useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'

export default function Home() {
  const [message, setMessage] = useState('')

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-katt-200 dark:border-katt-800">
        <h1 className="text-lg font-bold text-katt-600 dark:text-katt-300">
          🐱 Katt
        </h1>
        <ThemeToggle />
      </header>

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="max-w-xs bg-katt-100 dark:bg-katt-800 rounded-2xl rounded-tl-sm px-4 py-2 text-sm">
          ¡Hola! Soy Katt 🐱 ¿En qué puedo ayudarte?
        </div>
      </main>

      {/* Input */}
      <footer className="p-4 border-t border-katt-200 dark:border-katt-800">
        <form
          onSubmit={e => { e.preventDefault(); setMessage('') }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
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
  )
}
