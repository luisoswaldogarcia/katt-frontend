// Color sutil y estable por doctor (hash del nombre → paleta suave)
const PALETA = [
  { dot: '#6366f1', bg: '#eef2ff' }, // indigo
  { dot: '#0ea5e9', bg: '#e0f2fe' }, // sky
  { dot: '#10b981', bg: '#d1fae5' }, // emerald
  { dot: '#f59e0b', bg: '#fef3c7' }, // amber
  { dot: '#ec4899', bg: '#fce7f3' }, // pink
  { dot: '#8b5cf6', bg: '#ede9fe' }, // violet
  { dot: '#14b8a6', bg: '#ccfbf1' }, // teal
  { dot: '#f97316', bg: '#ffedd5' }, // orange
]

export function doctorColor(nombre: string): { dot: string; bg: string } {
  const s = String(nombre || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return PALETA[h % PALETA.length]
}
