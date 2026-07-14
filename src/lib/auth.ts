const SESSION_KEY = 'katt-session'

export interface Session {
  email: string
  nombre: string
}

const MOCK_USERS = [
  { email: 'admin@katt.com', password: '1234', nombre: 'Admin' },
  { email: 'demo@katt.com', password: 'demo', nombre: 'Demo' },
]

export function signIn(email: string, password: string): Session | null {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password)
  if (!user) return null
  const session: Session = { email: user.email, nombre: user.nombre }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession(): Session | null {
  const stored = localStorage.getItem(SESSION_KEY)
  return stored ? JSON.parse(stored) : null
}
