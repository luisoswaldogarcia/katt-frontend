import { useState } from 'react'
import { signIn } from '../lib/auth'
import { preloadStores } from '../lib/demoStore'

const inputClass = 'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      // Descubrir empresa
      const { api } = await import('../lib/api')
      const { setActiveEmpresaId } = await import('../lib/modules')
      try {
        const me = await api.get<{ empresaId: string }>('me', '')
        if (me.empresaId) setActiveEmpresaId(me.empresaId)
      } catch {}
      await preloadStores()
      onLogin()
    } catch (err: any) {
      if (err.message === 'NEW_PASSWORD_REQUIRED') {
        setError('Debes cambiar tu contraseña temporal')
      } else if (err.name === 'UserAlreadyAuthenticatedException') {
        onLogin()
      } else {
        setError('Credenciales incorrectas')
      }
    } finally {
      setLoading(false)
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
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@katt.app" className={inputClass} autoFocus />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••" className={inputClass + ' pr-9'} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  }
                </svg>
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
