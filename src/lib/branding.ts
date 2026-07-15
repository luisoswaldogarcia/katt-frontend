import { getConfig, saveConfig, getCached } from './configApi'

export interface Branding {
  appName: string
  appIcon: string
}

const defaults: Branding = {
  appName: 'Katt',
  appIcon: '/katt-avatar.jpeg',
}

export async function fetchBranding(): Promise<Branding> {
  return getConfig<Branding>('branding', defaults)
}

export function getBranding(): Branding {
  return getCached<Branding>('branding', defaults)
}

export let branding: Branding = defaults

export async function loadBranding(): Promise<Branding> {
  branding = await fetchBranding()
  return branding
}

export async function saveBranding(updated: Partial<Branding>) {
  branding = { ...branding, ...updated }
  await saveConfig('branding', branding)
}
