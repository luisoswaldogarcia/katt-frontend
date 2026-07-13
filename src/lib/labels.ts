export interface Labels {
  paciente: string
  doctor: string
  doctorIcon: string
  inventario: string
  tablero: string
  tareas: string
}

const presets: Record<string, Labels> = {
  salud: { paciente: 'Paciente', doctor: 'Doctor', doctorIcon: 'stethoscope', inventario: 'Inventario', tablero: 'Tablero', tareas: 'Tareas' },
  negocio: { paciente: 'Cliente', doctor: 'Empresa', doctorIcon: 'building', inventario: 'Inventario', tablero: 'Tablero', tareas: 'Tareas' },
}

const current = presets[localStorage.getItem('katt-preset') || 'salud'] ?? presets.salud

export const labels: Labels = current
export { presets }
