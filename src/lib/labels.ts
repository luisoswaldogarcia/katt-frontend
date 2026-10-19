import { getConfig, saveConfig, getCached } from './configApi'

export interface Labels {
  paciente: string
  doctor: string
  empresa: string
  agenda: string
  tareas: string
}

const defaults: Labels = {
  paciente: 'Cliente',
  doctor: 'Usuario',
  empresa: 'Empresa',
  agenda: 'Agenda',
  tareas: 'Tareas',
}

export async function fetchLabels(): Promise<Labels> {
  return getConfig<Labels>('labels', defaults)
}

export function getLabels(): Labels {
  return getCached<Labels>('labels', defaults)
}

export let labels: Labels = defaults

export async function loadLabels(): Promise<Labels> {
  labels = await fetchLabels()
  return labels
}

export async function saveLabels(updated: Labels) {
  labels = updated
  await saveConfig('labels', updated)
}
