// Store en memoria para modo demo. Se reemplazará por llamadas al backend.

export interface PacienteData {
  id: number
  nombre: string
  doctor: string
  proximaCita: string
  telefono: string
  email: string
  foto?: string
  custom?: Record<string, unknown>
}

export interface DoctorData {
  id: number
  nombre: string
  rol: string
  empresaId?: number
  telefono: string
  email: string
  foto?: string
  custom?: Record<string, unknown>
  modules?: Partial<Record<string, boolean>>
}

export interface EmpresaData {
  id: number
  nombre: string
  rfc?: string
  telefono: string
  email: string
  direccion?: string
  foto?: string
  custom?: Record<string, unknown>
  modules?: Partial<Record<string, boolean>>
  statusPago?: 'Al día' | 'Pendiente' | 'Vencido'
}

const nombres = ['Juan','María','Carlos','Ana','Roberto','Laura','Fernando','Sofía','Diego','Valentina','Andrés','Camila','Mateo','Isabella','Sebastián','Luciana','Emiliano','Renata','Nicolás','Mariana']
const apellidos = ['Pérez','López','Ramírez','Torres','Díaz','Mendoza','Ruiz','Castillo','Herrera','Ríos','Vargas','Ortega','Jiménez','Moreno','Luna','Flores','Cruz','Aguilar','Peña','Delgado']
const doctoresRef = ['Dr. García','Dra. Sánchez','Dra. Gómez','Dr. Morales','Dr. Herrera']

function generatePacientes(): PacienteData[] {
  const base = new Date('2025-02-10')
  return Array.from({ length: 100 }, (_, i) => {
    const fecha = new Date(base)
    fecha.setDate(fecha.getDate() + i)
    const nombre = nombres[i % nombres.length]
    const apellido = apellidos[Math.floor(i / nombres.length) % apellidos.length]
    return {
      id: i + 1,
      nombre: `${nombre} ${apellido}`,
      doctor: doctoresRef[i % doctoresRef.length],
      proximaCita: fecha.toISOString().split('T')[0],
      telefono: `555-${String(101 + i).padStart(4, '0')}`,
      email: `${nombre.toLowerCase()}${i}@email.com`,
      ...(i === 0 ? { custom: { sexo: 'Masculino', cirugias: 'Apendicectomía (2019)\nArtroscopia rodilla derecha (2022)', enfermedades: 'Hipertensión arterial\nDiabetes tipo 2', medicamentos: 'Metformina 850mg - 2 veces al día\nLosartán 50mg - 1 vez al día\nAspirina 100mg - 1 vez al día' } } : {}),
    }
  })
}

let pacientes: PacienteData[] = generatePacientes()

let empresas: EmpresaData[] = [
  { id: 1, nombre: 'Johnny', rfc: '', telefono: '', email: '', statusPago: 'Al día', modules: { paciente: true, doctor: true, empresa: true, inventario: true, agenda: true, chat: true, agente: true, tareas: true } },
  { id: 2, nombre: 'Odeth', rfc: '', telefono: '', email: '', statusPago: 'Pendiente', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tareas: false } },
  { id: 3, nombre: 'Gutiérrez', rfc: '', telefono: '', email: '', statusPago: 'Al día', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tareas: false } },
  { id: 4, nombre: 'Carpol', rfc: '', telefono: '', email: '', statusPago: 'Vencido', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tareas: false } },
]

let doctores: DoctorData[] = [
  { id: 1, nombre: 'Dr. García', rol: 'Owner', telefono: '555-0201', email: 'garcia@clinica.com' },
  { id: 2, nombre: 'Dra. Sánchez', rol: 'Administrador', empresaId: 1, telefono: '555-0202', email: 'sanchez@clinica.com' },
  { id: 3, nombre: 'Dra. Gómez', rol: 'Médico', empresaId: 1, telefono: '555-0203', email: 'gomez@clinica.com' },
  { id: 4, nombre: 'Dr. Morales', rol: 'Administrador', empresaId: 2, telefono: '555-0204', email: 'morales@clinica.com' },
  { id: 5, nombre: 'Dr. Herrera', rol: 'Médico', empresaId: 2, telefono: '555-0205', email: 'herrera@clinica.com' },
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

export interface InventarioData {
  id: number
  nombre: string
  categoria: string
  cantidad: number
  unidad: string
  precioUnitario: number
  codigoBarras?: string
  foto?: string
  custom?: Record<string, unknown>
}

let inventario: InventarioData[] = [
  { id: 1, nombre: 'Paracetamol 500mg', categoria: 'Medicamento', cantidad: 200, unidad: 'caja', precioUnitario: 45, codigoBarras: '7501001164015' },
  { id: 2, nombre: 'Ibuprofeno 400mg', categoria: 'Medicamento', cantidad: 150, unidad: 'caja', precioUnitario: 55, codigoBarras: '7501001164022' },
  { id: 3, nombre: 'Guantes de látex', categoria: 'Insumo', cantidad: 500, unidad: 'par', precioUnitario: 8, codigoBarras: '7501001164039' },
  { id: 4, nombre: 'Jeringa 5ml', categoria: 'Insumo', cantidad: 300, unidad: 'pieza', precioUnitario: 12, codigoBarras: '7501001164046' },
  { id: 5, nombre: 'Alcohol 70%', categoria: 'Insumo', cantidad: 80, unidad: 'litro', precioUnitario: 35, codigoBarras: '7501001164053' },
  { id: 6, nombre: 'Gasas estériles', categoria: 'Insumo', cantidad: 400, unidad: 'paquete', precioUnitario: 20 },
  { id: 7, nombre: 'Amoxicilina 500mg', categoria: 'Medicamento', cantidad: 120, unidad: 'caja', precioUnitario: 85 },
  { id: 8, nombre: 'Termómetro digital', categoria: 'Equipo', cantidad: 15, unidad: 'pieza', precioUnitario: 180 },
  { id: 9, nombre: 'Estetoscopio', categoria: 'Equipo', cantidad: 8, unidad: 'pieza', precioUnitario: 950 },
  { id: 10, nombre: 'Vendas elásticas', categoria: 'Insumo', cantidad: 250, unidad: 'rollo', precioUnitario: 25 },
]

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
  update: (id: number, data: Partial<CitaData>) => {
    citas = citas.map(c => c.id === id ? { ...c, ...data } : c)
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

// Inventario
export interface MovimientoData {
  id: number
  itemId: number
  tipo: 'entrada' | 'salida'
  cantidad: number
  motivo: string
  fecha: string
}

let movimientos: MovimientoData[] = []

export const inventarioStore = {
  getAll: () => [...inventario],
  getById: (id: number) => inventario.find(i => i.id === id),
  getPage: async (page: number, limit = 15): Promise<PageResult<InventarioData>> => {
    await delay(600)
    const start = page * limit
    const data = inventario.slice(start, start + limit)
    return { data, total: inventario.length, hasMore: start + limit < inventario.length }
  },
  create: (data: Omit<InventarioData, 'id'>) => {
    const nuevo = { ...data, id: Date.now() }
    inventario = [...inventario, nuevo]
    return nuevo
  },
  update: (id: number, data: Partial<InventarioData>) => {
    inventario = inventario.map(i => i.id === id ? { ...i, ...data } : i)
  },
  remove: (id: number) => {
    inventario = inventario.filter(i => i.id !== id)
  },
}

export const movimientoStore = {
  getByItem: (itemId: number) => movimientos.filter(m => m.itemId === itemId).sort((a, b) => b.fecha.localeCompare(a.fecha)),
  create: (data: Omit<MovimientoData, 'id'>) => {
    const nuevo = { ...data, id: Date.now() }
    movimientos = [...movimientos, nuevo]
    const item = inventario.find(i => i.id === data.itemId)
    if (item) {
      const delta = data.tipo === 'entrada' ? data.cantidad : -data.cantidad
      inventarioStore.update(data.itemId, { cantidad: item.cantidad + delta })
    }
    return nuevo
  },
}

// Tareas
export interface TareaData {
  id: number
  titulo: string
  tipo: string
  estado: string
  asignado: string
  campos: Record<string, unknown>
}

let tareas: TareaData[] = [
  { id: 1, titulo: 'Cobrar seguro paciente Pérez', tipo: 'cobrar-seguro', estado: 'Pendiente', asignado: 'Admin', campos: { monto: '4500' } },
  { id: 2, titulo: 'Crear QR consultorio 3', tipo: 'crear-qr', estado: 'En progreso', asignado: 'Dr. García', campos: { fechaLimite: '2025-02-20', descripcion: 'QR para acceso al consultorio' } },
  { id: 3, titulo: 'Revisar expedientes', tipo: 'general', estado: 'Pendiente', asignado: 'Dra. Sánchez', campos: { descripcion: 'Actualizar expedientes pendientes', fechaLimite: '2025-02-15' } },
  { id: 4, titulo: 'Cobrar seguro paciente Torres', tipo: 'cobrar-seguro', estado: 'Completada', asignado: 'Admin', campos: { monto: '3200' } },
  { id: 5, titulo: 'Crear QR farmacia', tipo: 'crear-qr', estado: 'Pendiente', asignado: 'Dr. Morales', campos: { fechaLimite: '2025-02-25', descripcion: 'QR para inventario farmacia' } },
  { id: 6, titulo: 'Implementar login con Amplify + Cognito', tipo: 'general', estado: 'Pendiente', asignado: 'Dev', campos: { descripcion: 'Integrar AWS Amplify Auth con Cognito User Pool. Incluye: pantalla de login, protección de rutas, signIn/signUp/signOut. Evaluar si hacer mock primero o ir directo a Cognito.', fechaLimite: '2025-03-01' } },
]

export const tareaStore = {
  getAll: () => [...tareas],
  getById: (id: number) => tareas.find(t => t.id === id),
  create: (data: Omit<TareaData, 'id'>) => {
    const nueva = { ...data, id: Date.now() }
    tareas = [...tareas, nueva]
    return nueva
  },
  update: (id: number, data: Partial<TareaData>) => {
    tareas = tareas.map(t => t.id === id ? { ...t, ...data } : t)
  },
  remove: (id: number) => {
    tareas = tareas.filter(t => t.id !== id)
  },
}

export const empresaStore = {
  getAll: () => [...empresas],
  getById: (id: number) => empresas.find(e => e.id === id),
  getPage: async (page: number, limit = 15): Promise<PageResult<EmpresaData>> => {
    await delay(600)
    const start = page * limit
    const data = empresas.slice(start, start + limit)
    return { data, total: empresas.length, hasMore: start + limit < empresas.length }
  },
  create: (data: Omit<EmpresaData, 'id'>) => {
    const nueva = { ...data, id: Date.now() } as EmpresaData
    empresas = [...empresas, nueva]
    return nueva
  },
  update: (id: number, data: Partial<EmpresaData>) => {
    empresas = empresas.map(e => e.id === id ? { ...e, ...data } : e)
  },
  remove: (id: number) => {
    empresas = empresas.filter(e => e.id !== id)
  },
}
