import { getConfig, saveConfig, getCached } from './configApi'

export interface Labels {
  paciente: string
  doctor: string
  empresa: string
  inventario: string
  agenda: string
  chat: string
  agente: string
  tareas: string
  pos: string
  compras: string
}

const defaults: Labels = {
  paciente: 'Cliente',
  doctor: 'Usuario',
  empresa: 'Empresa',
  inventario: 'Inventario',
  agenda: 'Agenda',
  chat: 'Chat',
  agente: 'Agente',
  tareas: 'Tareas',
  pos: 'Punto de Venta',
  compras: 'Compras',
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
