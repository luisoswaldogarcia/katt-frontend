export interface Labels {
  paciente: string
  doctor: string
  doctorIcon: string
}

const presets: Record<string, Labels> = {
  salud: { paciente: 'Paciente', doctor: 'Doctor', doctorIcon: 'stethoscope' },
  negocio: { paciente: 'Cliente', doctor: 'Empresa', doctorIcon: 'building' },
}

const current = presets[localStorage.getItem('katt-preset') || 'salud'] ?? presets.salud

export const labels: Labels = current
export { presets }
