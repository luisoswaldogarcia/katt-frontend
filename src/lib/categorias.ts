import { getConfig, saveConfig, getCached } from './configApi'

const KEY = 'inventario-categorias'
const defaults = ['Medicamento', 'Insumo', 'Equipo']

export async function fetchCategorias(): Promise<string[]> {
  return getConfig<string[]>(KEY, defaults)
}

export function getCategorias(): string[] {
  return getCached<string[]>(KEY, defaults)
}

export async function saveCategorias(categorias: string[]) {
  await saveConfig(KEY, categorias)
}
