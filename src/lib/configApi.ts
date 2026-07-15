import { api } from './api'

const cache = new Map<string, unknown>()
let allLoaded = false

export async function loadAllConfig(): Promise<Record<string, unknown>> {
  const data = await api.get<Record<string, unknown>>('config', '')
  for (const [k, v] of Object.entries(data)) cache.set(k, v)
  allLoaded = true
  // Update module-level variables
  const { loadLabels } = await import('./labels')
  const { loadBranding } = await import('./branding')
  await Promise.all([loadLabels(), loadBranding()])
  return data
}

export async function getConfig<T>(key: string, fallback: T): Promise<T> {
  if (cache.has(key)) return cache.get(key) as T
  if (allLoaded) return fallback
  try {
    const res = await api.get<{ key: string; value: T }>('config', key)
    const val = res.value ?? fallback
    cache.set(key, val)
    return val
  } catch {
    return fallback
  }
}

export async function saveConfig<T>(key: string, value: T): Promise<void> {
  cache.set(key, value)
  await api.update('config', key, { value })
}

export async function saveConfigBulk(data: Record<string, unknown>): Promise<void> {
  for (const [k, v] of Object.entries(data)) cache.set(k, v)
  // PUT /config (no id) — need raw request
  const { getToken } = await import('./auth')
  const { getEmpresaId } = await import('./api')
  const BASE_URL = 'https://b76owlak02.execute-api.us-east-1.amazonaws.com/dev/api/v1'
  const token = await getToken()
  await fetch(`${BASE_URL}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'x-empresa-id': getEmpresaId() },
    body: JSON.stringify(data),
  })
}

export function getCached<T>(key: string, fallback: T): T {
  return (cache.get(key) as T) ?? fallback
}
