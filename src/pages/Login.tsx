import { useState } from 'react'
import { signIn } from '../lib/auth'

const inputClass = 'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = signIn(email, password)
    if (session) {
      onLogin()
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="h-dvh flex items-center justify-center bg-katt-50 dark:bg-katt-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-katt-600 dark:text-katt-300">Katt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inicia sesión para continuar</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-katt-900 rounded-xl p-5 border border-katt-200 dark:border-katt-800">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@katt.com" className={inputClass} autoFocus />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Contraseña</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" className={inputClass} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" className="w-full px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
            Iniciar sesión
          </button>
        </form>
        <p className="text-xs text-center text-gray-400">Demo: admin@katt.com / 1234</p>
      </div>
    </div>
  )
}
