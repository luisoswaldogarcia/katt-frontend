import { getToken } from './auth'
import { getActiveEmpresaId } from './modules'

const BASE_URL = 'https://b76owlak02.execute-api.us-east-1.amazonaws.com/dev/api/v1'

export function getEmpresaId(): string {
  return getActiveEmpresaId() || 'default'
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
  const res = await fetch(`${BASE_URL}${path}`, { ...opts, headers: { ...h, ...opts.headers } })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  list: <T>(entity: string) => request<{ items: T[]; cursor: string | null }>(`/${entity}`),
  get: <T>(entity: string, id: string) => request<T>(`/${entity}/${id}`),
  create: <T>(entity: string, data: unknown) => request<T>(`/${entity}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (entity: string, id: string, data: unknown) => request<{ ok: boolean }>(`/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (entity: string, id: string) => request<{ ok: boolean }>(`/${entity}/${id}`, { method: 'DELETE' }),
}
