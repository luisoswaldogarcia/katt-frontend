import { getConfig, saveConfig, getCached } from './configApi'

export interface Labels {
  paciente: string
  usuario: string   // entidad usuario (módulo Usuarios)
  usuarios: string  // plural para la navegación
  doctor: string    // doctor de la cita (un usuario con rol doctor)
  empresa: string
  agenda: string
  tareas: string
}

const defaults: Labels = {
  paciente: 'Cliente',
  usuario: 'Usuario',
  usuarios: 'Usuarios',
  doctor: 'Doctor',
  empresa: 'Empresa',
  agenda: 'Agenda',
  tareas: 'Tareas',
}

// El valor guardado de 'doctor' era 'Usuario' cuando el módulo se llamaba así
function normaliza(stored: Partial<Labels>): Labels {
  const merged = { ...defaults, ...stored }
  if (merged.doctor === 'Usuario') merged.doctor = 'Doctor'
  return merged
}

export async function fetchLabels(): Promise<Labels> {
  return normaliza(await getConfig<Partial<Labels>>('labels', {}))
}

export function getLabels(): Labels {
  return normaliza(getCached<Partial<Labels>>('labels', {}))
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
