import { getToken } from './auth'
import { getActiveEmpresaId } from './modules'

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export function getEmpresaId(): string {
  return getActiveEmpresaId() || 'mock-empresa-001'
}

async function headers(): Promise<Record<string, string>> {
  const token = await getToken()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-empresa-id': getEmpresaId(),
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const h = await headers()
  const url = `${BASE_URL}${path}`
  console.debug(`[API] ${opts.method || 'GET'} ${url}`, opts.body ? JSON.parse(opts.body as string) : '')
  try {
    const res = await fetch(url, { ...opts, headers: { ...h, ...opts.headers } })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      console.error(`[API] ❌ ${res.status} ${url}`, body)
      throw new Error(body.error || `HTTP ${res.status}`)
    }
    const data = await res.json()
    console.debug(`[API] ✅ ${url}`, data)
    return data
  } catch (err) {
    console.error(`[API] 💥 ${url}`, err)
    throw err
  }
}

export const api = {
  list: <T>(entity: string) => request<{ items: T[]; cursor: string | null }>(`/${entity}`),
  get: <T>(entity: string, id: string) => request<T>(id ? `/${entity}/${id}` : `/${entity}`),
  create: <T>(entity: string, data: unknown) => request<T>(`/${entity}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (entity: string, id: string, data: unknown) => request<{ ok: boolean }>(id ? `/${entity}/${id}` : `/${entity}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (entity: string, id: string) => request<{ ok: boolean }>(`/${entity}/${id}`, { method: 'DELETE' }),
  onboard: (data: Record<string, unknown>) =>
    fetch(`${BASE_URL}/onboarding`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()) as Promise<{ empresaId: string; userId: string; nombre: string }>,
}
