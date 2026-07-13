const STORAGE_KEY = 'katt-inventario-categorias'

const defaults = ['Medicamento', 'Insumo', 'Equipo']

export function getCategorias(): string[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : defaults
}

export function saveCategorias(categorias: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categorias))
}
