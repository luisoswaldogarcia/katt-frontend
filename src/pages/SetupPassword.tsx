import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { startRegistration } from '@simplewebauthn/browser'
import { BASE_URL } from '../lib/api'

type Step = 'password' | 'fingerprint' | 'done'

export default function SetupPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [step, setStep] = useState<Step>('password')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Token de activación no encontrado')
    }
  }, [token])

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al establecer contraseña')
      setEmail(data.email)
      setStep('fingerprint')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterFingerprint() {
    setLoading(true)
    setError('')
    try {
      const beginRes = await fetch(`${BASE_URL}/webauthn/register/begin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!beginRes.ok) throw new Error('Error al iniciar registro biométrico')
      const options = await beginRes.json()

      const cred = await startRegistration({ optionsJSON: options })

      const completeRes = await fetch(`${BASE_URL}/webauthn/register/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, credential: cred }),
      })
      if (!completeRes.ok) throw new Error('Error al registrar huella digital')
      setStep('done')
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Registro biométrico cancelado')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function skipFingerprint() {
    setStep('done')
  }

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500'

  if (!token) {
    return (
      <div className="h-dvh flex items-center justify-center bg-katt-50 dark:bg-katt-950 p-4">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">Enlace de activación inválido</p>
          <button onClick={() => navigate('/')} className="text-sm text-katt-500 hover:underline">Ir al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-dvh flex items-center justify-center bg-katt-50 dark:bg-katt-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-katt-600 dark:text-katt-300">Katt</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {step === 'password' && 'Configura tu contraseña'}
            {step === 'fingerprint' && 'Configura tu huella digital (opcional)'}
            {step === 'done' && '¡Todo listo!'}
          </p>
        </div>

        {step === 'password' && (
          <form onSubmit={handleSetPassword} className="space-y-4 bg-white dark:bg-katt-900 rounded-xl p-5 border border-katt-200 dark:border-katt-800">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nueva contraseña</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className={inputClass + ' pr-9'} autoFocus />
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
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Confirmar contraseña</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} className={inputClass + ' pr-9'} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    {showConfirm
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {loading ? 'Guardando...' : 'Establecer contraseña'}
            </button>
          </form>
        )}

        {step === 'fingerprint' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-katt-900 rounded-xl p-5 border border-katt-200 dark:border-katt-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-katt-100 dark:bg-katt-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-katt-500">
                  <path d="M12 2a6 6 0 0 0-6 6v3" />
                  <path d="M18 11V8a6 6 0 0 0-1.5-4" />
                  <path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                  <path d="M9 16v1" />
                  <path d="M15 16v1" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Registra tu huella digital o Face ID para iniciar sesión más rápido
              </p>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={skipFingerprint} disabled={loading} className="flex-1 px-3 py-2 rounded-lg border border-katt-200 dark:border-katt-700 text-sm hover:bg-katt-50 dark:hover:bg-katt-800 transition-colors">
                  Omitir
                </button>
                <button type="button" onClick={handleRegisterFingerprint} disabled={loading} className="flex-1 px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                  {loading ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white dark:bg-katt-900 rounded-xl p-5 border border-katt-200 dark:border-katt-800 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-green-500">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tu cuenta ha sido configurada correctamente
            </p>
            <button onClick={() => navigate('/')} className="w-full px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
