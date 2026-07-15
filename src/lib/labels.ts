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

const demoOverrides: Partial<Labels> = {}

function load(): Labels {
  const stored = localStorage.getItem('katt-labels')
  if (stored) {
    try { return { ...defaults, ...JSON.parse(stored) } } catch { /* ignore */ }
  }
  // Seed demo config on first load
  const seeded = { ...defaults, ...demoOverrides }
  localStorage.setItem('katt-labels', JSON.stringify(seeded))
  return seeded
}

export let labels: Labels = load()

export function saveLabels(updated: Labels) {
  labels = { ...updated }
  localStorage.setItem('katt-labels', JSON.stringify(labels))
}

export function getLabels(): Labels {
  return load()
}
