const STORAGE_KEY = 'katt-branding'

export interface Branding {
  appName: string
  appIcon: string
}

const defaults: Branding = {
  appName: 'Katt',
  appIcon: '/katt-avatar.jpeg',
}

function load(): Branding {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) try { return { ...defaults, ...JSON.parse(stored) } } catch { /* ignore */ }
  return defaults
}

export let branding: Branding = load()

export function saveBranding(updated: Partial<Branding>) {
  branding = { ...branding, ...updated }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branding))
}

export function getBranding(): Branding {
  return load()
}
