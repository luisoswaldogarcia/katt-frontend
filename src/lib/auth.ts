import { signIn as ampSignIn, signOut as ampSignOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth'
import { startAuthentication } from '@simplewebauthn/browser'

export interface Session {
  email: string
  userId: string
  groups: string[]
  token: string
}

const FINGERPRINT_TOKEN_KEY = 'katt_webauthn_token' // legacy: solo idToken
const FINGERPRINT_SESSION_KEY = 'katt_webauthn_session'

interface FingerprintSession {
  idToken: string
  accessToken: string
  refreshToken: string
  exp: number // epoch ms del idToken
}

function apiUrl(path: string) {
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}${path}`
}

function saveFingerprintSession(tokens: { idToken?: string; accessToken?: string; refreshToken?: string }) {
  if (!tokens.idToken) return
  const claims = decodeJwt(tokens.idToken)
  const expSec = typeof claims?.exp === 'number' ? claims.exp : Math.floor(Date.now() / 1000) + 3300
  const session: FingerprintSession = {
    idToken: tokens.idToken,
    accessToken: tokens.accessToken || '',
    refreshToken: tokens.refreshToken || '',
    exp: expSec * 1000,
  }
  localStorage.setItem(FINGERPRINT_SESSION_KEY, JSON.stringify(session))
  localStorage.removeItem(FINGERPRINT_TOKEN_KEY)
}

function loadFingerprintSession(): FingerprintSession | null {
  const raw = localStorage.getItem(FINGERPRINT_SESSION_KEY)
  if (raw) {
    try { return JSON.parse(raw) as FingerprintSession } catch {}
  }
  // Migración de la sesión antigua (solo idToken, sin refresh)
  const legacy = localStorage.getItem(FINGERPRINT_TOKEN_KEY)
  if (legacy) {
    const claims = decodeJwt(legacy)
    if (claims?.email) {
      return {
        idToken: legacy,
        accessToken: '',
        refreshToken: '',
        exp: (typeof claims.exp === 'number' ? claims.exp : 0) * 1000,
      }
    }
  }
  return null
}

async function refreshFingerprintSession(): Promise<FingerprintSession | null> {
  const current = loadFingerprintSession()
  if (!current?.refreshToken) return null
  try {
    const res = await fetch(apiUrl('/webauthn/login/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
    if (!res.ok) return null
    const tokens = await res.json()
    if (!tokens.idToken) return null
    saveFingerprintSession(tokens)
    return loadFingerprintSession()
  } catch {
    return null
  }
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch { return null }
}

export async function signIn(email: string, password: string): Promise<Session> {
  const { isSignedIn, nextStep } = await ampSignIn({ username: email, password })
  if (nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
    throw new Error('NEW_PASSWORD_REQUIRED')
  }
  if (!isSignedIn) throw new Error('Login failed')
  return getSession() as Promise<Session>
}

export async function confirmNewPassword(newPassword: string): Promise<Session> {
  await confirmSignIn({ challengeResponse: newPassword })
  return getSession() as Promise<Session>
}

export async function signInWithFingerprint(): Promise<Session> {
  const beginRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/webauthn/login/begin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!beginRes.ok) throw new Error('No se pudo iniciar la autenticación biométrica')
  const options = await beginRes.json()

  const credential = await startAuthentication({ optionsJSON: options })

  const completeRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/webauthn/login/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
  if (!completeRes.ok) {
    const err = await completeRes.json().catch(() => ({}))
    throw new Error(err.error || 'Error al verificar huella digital')
  }
  const tokens = await completeRes.json()
  saveFingerprintSession(tokens)
  return getSession() as Promise<Session>
}

export async function signOut() {
  localStorage.removeItem(FINGERPRINT_TOKEN_KEY)
  localStorage.removeItem(FINGERPRINT_SESSION_KEY)
  await ampSignOut()
}

export async function getSession(): Promise<Session | null> {
  // Try Amplify session first (email/password login)
  try {
    const user = await getCurrentUser()
    const { tokens } = await fetchAuthSession()
    const idToken = tokens?.idToken
    if (idToken) {
      const claims = idToken.payload
      return {
        email: claims.email as string,
        userId: user.userId,
        groups: (claims['cognito:groups'] as string[]) || [],
        token: idToken.toString(),
      }
    }
  } catch {}

  // Fallback: sesión de huella (se refresca sola cuando el token está por expirar)
  let fp = loadFingerprintSession()
  if (fp) {
    if (fp.exp - Date.now() < 60_000) {
      fp = await refreshFingerprintSession()
    }
    if (fp) {
      const claims = decodeJwt(fp.idToken)
      if (claims && claims.email) {
        return {
          email: claims.email as string,
          userId: (claims.sub as string) || (claims.email as string),
          groups: (claims['cognito:groups'] as string[]) || [],
          token: fp.idToken,
        }
      }
    }
  }
  return null
}

export async function getToken(): Promise<string | null> {
  const session = await getSession()
  return session?.token || null
}

