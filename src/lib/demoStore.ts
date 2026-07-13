// Store en memoria para modo demo. Se reemplazará por llamadas al backend.

export interface PacienteData {
  id: number
  nombre: string
  doctor: string
  proximaCita: string
  telefono: string
  email: string
  custom?: Record<string, unknown>
}

export interface DoctorData {
  id: number
  nombre: string
  especialidad: string
  telefono: string
  email: string
  custom?: Record<string, unknown>
}

let pacientes: PacienteData[] = [
  { id: 1, nombre: 'Juan Pérez', doctor: 'Dr. García', proximaCita: '2025-02-10', telefono: '555-0101', email: 'juan@email.com' },
  { id: 2, nombre: 'María López', doctor: 'Dr. García', proximaCita: '2025-02-12', telefono: '555-0102', email: 'maria@email.com' },
  { id: 3, nombre: 'Carlos Ramírez', doctor: 'Dra. Sánchez', proximaCita: '2025-02-14', telefono: '555-0103', email: 'carlos@email.com' },
  { id: 4, nombre: 'Ana Torres', doctor: 'Dra. Sánchez', proximaCita: '2025-02-15', telefono: '555-0104', email: 'ana@email.com' },
  { id: 5, nombre: 'Roberto Díaz', doctor: 'Dra. Gómez', proximaCita: '2025-02-18', telefono: '555-0105', email: 'roberto@email.com' },
  { id: 6, nombre: 'Laura Mendoza', doctor: 'Dra. Gómez', proximaCita: '2025-02-20', telefono: '555-0106', email: 'laura@email.com' },
  { id: 7, nombre: 'Fernando Ruiz', doctor: 'Dr. García', proximaCita: '2025-02-22', telefono: '555-0107', email: 'fernando@email.com' },
  { id: 8, nombre: 'Sofía Castillo', doctor: 'Dr. Morales', proximaCita: '2025-02-24', telefono: '555-0108', email: 'sofia@email.com' },
  { id: 9, nombre: 'Diego Herrera', doctor: 'Dr. Morales', proximaCita: '2025-02-25', telefono: '555-0109', email: 'diego@email.com' },
  { id: 10, nombre: 'Valentina Ríos', doctor: 'Dra. Sánchez', proximaCita: '2025-02-26', telefono: '555-0110', email: 'valentina@email.com' },
  { id: 11, nombre: 'Andrés Vargas', doctor: 'Dr. García', proximaCita: '2025-02-27', telefono: '555-0111', email: 'andres@email.com' },
  { id: 12, nombre: 'Camila Ortega', doctor: 'Dra. Gómez', proximaCita: '2025-02-28', telefono: '555-0112', email: 'camila@email.com' },
  { id: 13, nombre: 'Mateo Jiménez', doctor: 'Dr. Herrera', proximaCita: '2025-03-01', telefono: '555-0113', email: 'mateo@email.com' },
  { id: 14, nombre: 'Isabella Moreno', doctor: 'Dr. Herrera', proximaCita: '2025-03-02', telefono: '555-0114', email: 'isabella@email.com' },
  { id: 15, nombre: 'Sebastián Luna', doctor: 'Dr. García', proximaCita: '2025-03-03', telefono: '555-0115', email: 'sebastian@email.com' },
  { id: 16, nombre: 'Luciana Flores', doctor: 'Dra. Sánchez', proximaCita: '2025-03-04', telefono: '555-0116', email: 'luciana@email.com' },
  { id: 17, nombre: 'Emiliano Cruz', doctor: 'Dr. Morales', proximaCita: '2025-03-05', telefono: '555-0117', email: 'emiliano@email.com' },
  { id: 18, nombre: 'Renata Aguilar', doctor: 'Dra. Gómez', proximaCita: '2025-03-06', telefono: '555-0118', email: 'renata@email.com' },
  { id: 19, nombre: 'Nicolás Peña', doctor: 'Dr. García', proximaCita: '2025-03-07', telefono: '555-0119', email: 'nicolas@email.com' },
  { id: 20, nombre: 'Mariana Delgado', doctor: 'Dr. Herrera', proximaCita: '2025-03-08', telefono: '555-0120', email: 'mariana@email.com' },
  { id: 21, nombre: 'Samuel Reyes', doctor: 'Dra. Sánchez', proximaCita: '2025-03-09', telefono: '555-0121', email: 'samuel@email.com' },
  { id: 22, nombre: 'Gabriela Navarro', doctor: 'Dr. Morales', proximaCita: '2025-03-10', telefono: '555-0122', email: 'gabriela@email.com' },
  { id: 23, nombre: 'Daniel Romero', doctor: 'Dra. Gómez', proximaCita: '2025-03-11', telefono: '555-0123', email: 'daniel@email.com' },
  { id: 24, nombre: 'Paula Medina', doctor: 'Dr. García', proximaCita: '2025-03-12', telefono: '555-0124', email: 'paula@email.com' },
  { id: 25, nombre: 'Tomás Guerrero', doctor: 'Dr. Herrera', proximaCita: '2025-03-13', telefono: '555-0125', email: 'tomas@email.com' },
  { id: 26, nombre: 'Alejandra Soto', doctor: 'Dra. Sánchez', proximaCita: '2025-03-14', telefono: '555-0126', email: 'alejandra@email.com' },
  { id: 27, nombre: 'Joaquín Vega', doctor: 'Dr. Morales', proximaCita: '2025-03-15', telefono: '555-0127', email: 'joaquin@email.com' },
  { id: 28, nombre: 'Catalina Ibarra', doctor: 'Dra. Gómez', proximaCita: '2025-03-16', telefono: '555-0128', email: 'catalina@email.com' },
  { id: 29, nombre: 'Martín Espinoza', doctor: 'Dr. García', proximaCita: '2025-03-17', telefono: '555-0129', email: 'martin@email.com' },
  { id: 30, nombre: 'Victoria Campos', doctor: 'Dr. Herrera', proximaCita: '2025-03-18', telefono: '555-0130', email: 'victoria@email.com' },
  { id: 31, nombre: 'Felipe Contreras', doctor: 'Dra. Sánchez', proximaCita: '2025-03-19', telefono: '555-0131', email: 'felipe@email.com' },
  { id: 32, nombre: 'Regina Salazar', doctor: 'Dr. Morales', proximaCita: '2025-03-20', telefono: '555-0132', email: 'regina@email.com' },
  { id: 33, nombre: 'Maximiliano Rojas', doctor: 'Dra. Gómez', proximaCita: '2025-03-21', telefono: '555-0133', email: 'maximiliano@email.com' },
  { id: 34, nombre: 'Antonella Paredes', doctor: 'Dr. García', proximaCita: '2025-03-22', telefono: '555-0134', email: 'antonella@email.com' },
  { id: 35, nombre: 'Santiago Fuentes', doctor: 'Dr. Herrera', proximaCita: '2025-03-23', telefono: '555-0135', email: 'santiago@email.com' },
  { id: 36, nombre: 'Julieta Acosta', doctor: 'Dra. Sánchez', proximaCita: '2025-03-24', telefono: '555-0136', email: 'julieta@email.com' },
  { id: 37, nombre: 'Leonardo Pacheco', doctor: 'Dr. Morales', proximaCita: '2025-03-25', telefono: '555-0137', email: 'leonardo@email.com' },
  { id: 38, nombre: 'Fernanda Guzmán', doctor: 'Dra. Gómez', proximaCita: '2025-03-26', telefono: '555-0138', email: 'fernanda@email.com' },
  { id: 39, nombre: 'Rodrigo Maldonado', doctor: 'Dr. García', proximaCita: '2025-03-27', telefono: '555-0139', email: 'rodrigo@email.com' },
  { id: 40, nombre: 'Daniela Córdoba', doctor: 'Dr. Herrera', proximaCita: '2025-03-28', telefono: '555-0140', email: 'daniela@email.com' },
  { id: 41, nombre: 'Ignacio Bravo', doctor: 'Dra. Sánchez', proximaCita: '2025-03-29', telefono: '555-0141', email: 'ignacio@email.com' },
  { id: 42, nombre: 'Constanza Pizarro', doctor: 'Dr. Morales', proximaCita: '2025-03-30', telefono: '555-0142', email: 'constanza@email.com' },
  { id: 43, nombre: 'Benjamín Tapia', doctor: 'Dra. Gómez', proximaCita: '2025-03-31', telefono: '555-0143', email: 'benjamin@email.com' },
  { id: 44, nombre: 'Florencia Muñoz', doctor: 'Dr. García', proximaCita: '2025-04-01', telefono: '555-0144', email: 'florencia@email.com' },
  { id: 45, nombre: 'Agustín Sandoval', doctor: 'Dr. Herrera', proximaCita: '2025-04-02', telefono: '555-0145', email: 'agustin@email.com' },
  { id: 46, nombre: 'Milagros Ávila', doctor: 'Dra. Sánchez', proximaCita: '2025-04-03', telefono: '555-0146', email: 'milagros@email.com' },
  { id: 47, nombre: 'Facundo Carrillo', doctor: 'Dr. Morales', proximaCita: '2025-04-04', telefono: '555-0147', email: 'facundo@email.com' },
  { id: 48, nombre: 'Alma Figueroa', doctor: 'Dra. Gómez', proximaCita: '2025-04-05', telefono: '555-0148', email: 'alma@email.com' },
  { id: 49, nombre: 'Emilio Cervantes', doctor: 'Dr. García', proximaCita: '2025-04-06', telefono: '555-0149', email: 'emilio@email.com' },
  { id: 50, nombre: 'Bianca Velázquez', doctor: 'Dr. Herrera', proximaCita: '2025-04-07', telefono: '555-0150', email: 'bianca@email.com' },
]

let doctores: DoctorData[] = [
  { id: 1, nombre: 'Dr. García', especialidad: 'Medicina General', telefono: '555-0201', email: 'garcia@clinica.com' },
  { id: 2, nombre: 'Dra. Sánchez', especialidad: 'Pediatría', telefono: '555-0202', email: 'sanchez@clinica.com' },
  { id: 3, nombre: 'Dra. Gómez', especialidad: 'Dermatología', telefono: '555-0203', email: 'gomez@clinica.com' },
  { id: 4, nombre: 'Dr. Morales', especialidad: 'Cardiología', telefono: '555-0204', email: 'morales@clinica.com' },
  { id: 5, nombre: 'Dr. Herrera', especialidad: 'Traumatología', telefono: '555-0205', email: 'herrera@clinica.com' },
]

export interface CitaData {
  id: number
  paciente: string
  doctor: string
  fecha: string
  hora: string
  motivo: string
}

const horas = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']
const motivos = ['Consulta general', 'Control', 'Seguimiento', 'Primera vez', 'Revisión de estudios', 'Urgencia']

function generateCitas(): CitaData[] {
  const citas: CitaData[] = []
  const today = new Date()
  for (let i = -7; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0) continue // skip sundays
    const count = d.getDay() === 6 ? 2 : 3 + Math.floor(Math.random() * 4)
    for (let j = 0; j < count; j++) {
      const pac = pacientes[Math.floor(Math.random() * pacientes.length)]
      citas.push({
        id: citas.length + 1,
        paciente: pac.nombre,
        doctor: pac.doctor,
        fecha: d.toISOString().split('T')[0],
        hora: horas[Math.floor(Math.random() * horas.length)],
        motivo: motivos[Math.floor(Math.random() * motivos.length)],
      })
    }
  }
  return citas
}

let citas: CitaData[] = generateCitas()

// Simula latencia de backend
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export interface PageResult<T> {
  data: T[]
  total: number
  hasMore: boolean
}

// Pacientes
export const pacienteStore = {
  getAll: () => [...pacientes],
  getById: (id: number) => pacientes.find(p => p.id === id),
  getPage: async (page: number, limit = 15): Promise<PageResult<PacienteData>> => {
    await delay(600)
    const start = page * limit
    const data = pacientes.slice(start, start + limit)
    return { data, total: pacientes.length, hasMore: start + limit < pacientes.length }
  },
  create: (data: Omit<PacienteData, 'id'>) => {
    const nuevo = { ...data, id: Date.now() }
    pacientes = [...pacientes, nuevo]
    return nuevo
  },
  update: (id: number, data: Partial<PacienteData>) => {
    pacientes = pacientes.map(p => p.id === id ? { ...p, ...data } : p)
  },
  remove: (id: number) => {
    pacientes = pacientes.filter(p => p.id !== id)
  },
}

// Citas
export const citaStore = {
  getByDateRange: (from: string, to: string) =>
    citas.filter(c => c.fecha >= from && c.fecha <= to).sort((a, b) => a.hora.localeCompare(b.hora)),
  create: (data: Omit<CitaData, 'id'>) => {
    const nueva = { ...data, id: Date.now() }
    citas = [...citas, nueva]
    return nueva
  },
  remove: (id: number) => {
    citas = citas.filter(c => c.id !== id)
  },
}

// Doctores
export const doctorStore = {
  getAll: () => [...doctores],
  getById: (id: number) => doctores.find(d => d.id === id),
  getPage: async (page: number, limit = 15): Promise<PageResult<DoctorData>> => {
    await delay(600)
    const start = page * limit
    const data = doctores.slice(start, start + limit)
    return { data, total: doctores.length, hasMore: start + limit < doctores.length }
  },
  create: (data: Omit<DoctorData, 'id'>) => {
    const nuevo = { ...data, id: Date.now() }
    doctores = [...doctores, nuevo]
    return nuevo
  },
  update: (id: number, data: Partial<DoctorData>) => {
    doctores = doctores.map(d => d.id === id ? { ...d, ...data } : d)
  },
  remove: (id: number) => {
    doctores = doctores.filter(d => d.id !== id)
  },
}
