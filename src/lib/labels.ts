export interface Labels {
  paciente: string
  doctor: string
  empresa: string
  inventario: string
  tablero: string
  tareas: string
}

const defaults: Labels = {
  paciente: 'Cliente',
  doctor: 'Usuario',
  empresa: 'Empresa',
  inventario: 'Inventario',
  tablero: 'Tablero',
  tareas: 'Tareas',
}

function load(): Labels {
  const stored = localStorage.getItem('katt-labels')
  if (stored) {
    try { return { ...defaults, ...JSON.parse(stored) } } catch { /* ignore */ }
  }
  return { ...defaults }
}

export let labels: Labels = load()

export function saveLabels(updated: Labels) {
  labels = { ...updated }
  localStorage.setItem('katt-labels', JSON.stringify(labels))
}

export function getLabels(): Labels {
  return load()
}
