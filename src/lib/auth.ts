import { signIn as ampSignIn, signOut as ampSignOut, getCurrentUser, fetchAuthSession, confirmSignIn } from 'aws-amplify/auth'
import { startAuthentication } from '@simplewebauthn/browser'

export interface Session {
  email: string
  userId: string
  groups: string[]
  token: string
}

const FINGERPRINT_TOKEN_KEY = 'katt_webauthn_token'

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

  localStorage.setItem(FINGERPRINT_TOKEN_KEY, tokens.idToken)
  return getSession() as Promise<Session>
}

export async function signOut() {
  localStorage.removeItem(FINGERPRINT_TOKEN_KEY)
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

  // Fallback: fingerprint token
  const stored = localStorage.getItem(FINGERPRINT_TOKEN_KEY)
  if (stored) {
    const claims = decodeJwt(stored)
    if (claims && claims.email) {
      return {
        email: claims.email as string,
        userId: claims.sub as string || claims.email as string,
        groups: (claims['cognito:groups'] as string[]) || [],
        token: stored,
      }
    }
  }
  return null
}

export async function getToken(): Promise<string | null> {
  const session = await getSession()
  return session?.token || null
}

