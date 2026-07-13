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
}

let pacientes: PacienteData[] = [
  { id: 1, nombre: 'Juan Pérez', doctor: 'Dr. García', proximaCita: '2025-02-10', telefono: '555-0101', email: 'juan@email.com', custom: { sexo: 'Masculino' } },
  { id: 2, nombre: 'María López', doctor: 'Dr. García', proximaCita: '2025-02-12', telefono: '555-0102', email: 'maria@email.com', custom: { sexo: 'Femenino' } },
  { id: 3, nombre: 'Carlos Ramírez', doctor: 'Dra. Sánchez', proximaCita: '2025-02-14', telefono: '555-0103', email: 'carlos@email.com', custom: { sexo: 'Masculino' } },
  { id: 4, nombre: 'Ana Torres', doctor: 'Dra. Sánchez', proximaCita: '2025-02-15', telefono: '555-0104', email: 'ana@email.com', custom: { sexo: 'Femenino' } },
  { id: 5, nombre: 'Roberto Díaz', doctor: 'Dra. Gómez', proximaCita: '2025-02-18', telefono: '555-0105', email: 'roberto@email.com', custom: { sexo: 'Masculino' } },
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
  { id: 51, nombre: 'Héctor Villarreal', doctor: 'Dr. García', proximaCita: '2025-04-08', telefono: '555-0151', email: 'hector@email.com' },
  { id: 52, nombre: 'Natalia Esquivel', doctor: 'Dra. Sánchez', proximaCita: '2025-04-09', telefono: '555-0152', email: 'natalia@email.com' },
  { id: 53, nombre: 'Óscar Montoya', doctor: 'Dra. Gómez', proximaCita: '2025-04-10', telefono: '555-0153', email: 'oscar@email.com' },
  { id: 54, nombre: 'Paola Rivas', doctor: 'Dr. Morales', proximaCita: '2025-04-11', telefono: '555-0154', email: 'paola@email.com' },
  { id: 55, nombre: 'Raúl Estrada', doctor: 'Dr. Herrera', proximaCita: '2025-04-12', telefono: '555-0155', email: 'raul@email.com' },
  { id: 56, nombre: 'Cecilia Montes', doctor: 'Dr. García', proximaCita: '2025-04-13', telefono: '555-0156', email: 'cecilia@email.com' },
  { id: 57, nombre: 'Iván Solís', doctor: 'Dra. Sánchez', proximaCita: '2025-04-14', telefono: '555-0157', email: 'ivan@email.com' },
  { id: 58, nombre: 'Lorena Bautista', doctor: 'Dra. Gómez', proximaCita: '2025-04-15', telefono: '555-0158', email: 'lorena@email.com' },
  { id: 59, nombre: 'Germán Trejo', doctor: 'Dr. Morales', proximaCita: '2025-04-16', telefono: '555-0159', email: 'german@email.com' },
  { id: 60, nombre: 'Adriana Lara', doctor: 'Dr. Herrera', proximaCita: '2025-04-17', telefono: '555-0160', email: 'adriana@email.com' },
  { id: 61, nombre: 'Hugo Cisneros', doctor: 'Dr. García', proximaCita: '2025-04-18', telefono: '555-0161', email: 'hugo@email.com' },
  { id: 62, nombre: 'Elena Quiroz', doctor: 'Dra. Sánchez', proximaCita: '2025-04-19', telefono: '555-0162', email: 'elena@email.com' },
  { id: 63, nombre: 'Marcos Balderas', doctor: 'Dra. Gómez', proximaCita: '2025-04-20', telefono: '555-0163', email: 'marcos@email.com' },
  { id: 64, nombre: 'Alicia Nava', doctor: 'Dr. Morales', proximaCita: '2025-04-21', telefono: '555-0164', email: 'alicia@email.com' },
  { id: 65, nombre: 'Enrique Zavala', doctor: 'Dr. Herrera', proximaCita: '2025-04-22', telefono: '555-0165', email: 'enrique@email.com' },
  { id: 66, nombre: 'Mónica Terán', doctor: 'Dr. García', proximaCita: '2025-04-23', telefono: '555-0166', email: 'monica@email.com' },
  { id: 67, nombre: 'Julio Palma', doctor: 'Dra. Sánchez', proximaCita: '2025-04-24', telefono: '555-0167', email: 'julio@email.com' },
  { id: 68, nombre: 'Verónica Duarte', doctor: 'Dra. Gómez', proximaCita: '2025-04-25', telefono: '555-0168', email: 'veronica@email.com' },
  { id: 69, nombre: 'Alberto Corona', doctor: 'Dr. Morales', proximaCita: '2025-04-26', telefono: '555-0169', email: 'alberto@email.com' },
  { id: 70, nombre: 'Silvia Rangel', doctor: 'Dr. Herrera', proximaCita: '2025-04-27', telefono: '555-0170', email: 'silvia@email.com' },
  { id: 71, nombre: 'César Olvera', doctor: 'Dr. García', proximaCita: '2025-04-28', telefono: '555-0171', email: 'cesar@email.com' },
  { id: 72, nombre: 'Karla Bermúdez', doctor: 'Dra. Sánchez', proximaCita: '2025-04-29', telefono: '555-0172', email: 'karla@email.com' },
  { id: 73, nombre: 'Rubén Gallardo', doctor: 'Dra. Gómez', proximaCita: '2025-04-30', telefono: '555-0173', email: 'ruben@email.com' },
  { id: 74, nombre: 'Teresa Ocampo', doctor: 'Dr. Morales', proximaCita: '2025-05-01', telefono: '555-0174', email: 'teresa@email.com' },
  { id: 75, nombre: 'Francisco Ponce', doctor: 'Dr. Herrera', proximaCita: '2025-05-02', telefono: '555-0175', email: 'francisco@email.com' },
  { id: 76, nombre: 'Gloria Sepúlveda', doctor: 'Dr. García', proximaCita: '2025-05-03', telefono: '555-0176', email: 'gloria@email.com' },
  { id: 77, nombre: 'Arturo Meza', doctor: 'Dra. Sánchez', proximaCita: '2025-05-04', telefono: '555-0177', email: 'arturo@email.com' },
  { id: 78, nombre: 'Claudia Barrera', doctor: 'Dra. Gómez', proximaCita: '2025-05-05', telefono: '555-0178', email: 'claudia@email.com' },
  { id: 79, nombre: 'Rafael Ontiveros', doctor: 'Dr. Morales', proximaCita: '2025-05-06', telefono: '555-0179', email: 'rafael@email.com' },
  { id: 80, nombre: 'Susana Villegas', doctor: 'Dr. Herrera', proximaCita: '2025-05-07', telefono: '555-0180', email: 'susana@email.com' },
  { id: 81, nombre: 'Ernesto Camacho', doctor: 'Dr. García', proximaCita: '2025-05-08', telefono: '555-0181', email: 'ernesto@email.com' },
  { id: 82, nombre: 'Irma Salinas', doctor: 'Dra. Sánchez', proximaCita: '2025-05-09', telefono: '555-0182', email: 'irma@email.com' },
  { id: 83, nombre: 'Gustavo Leyva', doctor: 'Dra. Gómez', proximaCita: '2025-05-10', telefono: '555-0183', email: 'gustavo@email.com' },
  { id: 84, nombre: 'Patricia Cárdenas', doctor: 'Dr. Morales', proximaCita: '2025-05-11', telefono: '555-0184', email: 'patricia@email.com' },
  { id: 85, nombre: 'Armando Téllez', doctor: 'Dr. Herrera', proximaCita: '2025-05-12', telefono: '555-0185', email: 'armando@email.com' },
  { id: 86, nombre: 'Rocío Valenzuela', doctor: 'Dr. García', proximaCita: '2025-05-13', telefono: '555-0186', email: 'rocio@email.com' },
  { id: 87, nombre: 'Víctor Arellano', doctor: 'Dra. Sánchez', proximaCita: '2025-05-14', telefono: '555-0187', email: 'victor@email.com' },
  { id: 88, nombre: 'Norma Bustamante', doctor: 'Dra. Gómez', proximaCita: '2025-05-15', telefono: '555-0188', email: 'norma@email.com' },
  { id: 89, nombre: 'Eduardo Piña', doctor: 'Dr. Morales', proximaCita: '2025-05-16', telefono: '555-0189', email: 'eduardo@email.com' },
  { id: 90, nombre: 'Leticia Granados', doctor: 'Dr. Herrera', proximaCita: '2025-05-17', telefono: '555-0190', email: 'leticia@email.com' },
  { id: 91, nombre: 'Ramiro Alcántara', doctor: 'Dr. García', proximaCita: '2025-05-18', telefono: '555-0191', email: 'ramiro@email.com' },
  { id: 92, nombre: 'Yolanda Pedraza', doctor: 'Dra. Sánchez', proximaCita: '2025-05-19', telefono: '555-0192', email: 'yolanda@email.com' },
  { id: 93, nombre: 'Alfredo Quintero', doctor: 'Dra. Gómez', proximaCita: '2025-05-20', telefono: '555-0193', email: 'alfredo@email.com' },
  { id: 94, nombre: 'Beatriz Zamora', doctor: 'Dr. Morales', proximaCita: '2025-05-21', telefono: '555-0194', email: 'beatriz@email.com' },
  { id: 95, nombre: 'Gilberto Tovar', doctor: 'Dr. Herrera', proximaCita: '2025-05-22', telefono: '555-0195', email: 'gilberto@email.com' },
  { id: 96, nombre: 'Marisol Dávila', doctor: 'Dr. García', proximaCita: '2025-05-23', telefono: '555-0196', email: 'marisol@email.com' },
  { id: 97, nombre: 'Rolando Cabrera', doctor: 'Dra. Sánchez', proximaCita: '2025-05-24', telefono: '555-0197', email: 'rolando@email.com' },
  { id: 98, nombre: 'Elisa Portillo', doctor: 'Dra. Gómez', proximaCita: '2025-05-25', telefono: '555-0198', email: 'elisa@email.com' },
  { id: 99, nombre: 'Mauricio Ávalos', doctor: 'Dr. Morales', proximaCita: '2025-05-26', telefono: '555-0199', email: 'mauricio@email.com' },
  { id: 100, nombre: 'Ximena Cordero', doctor: 'Dr. Herrera', proximaCita: '2025-05-27', telefono: '555-0200', email: 'ximena@email.com' },
]

let empresas: EmpresaData[] = [
  { id: 1, nombre: 'Johnny', rfc: '', telefono: '', email: '', modules: { paciente: true, doctor: true, empresa: true, inventario: true, agenda: true, chat: true, agente: true, tablero: true, tareas: true } },
  { id: 2, nombre: 'Odeth', rfc: '', telefono: '', email: '', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tablero: false, tareas: false } },
  { id: 3, nombre: 'Gutiérrez', rfc: '', telefono: '', email: '', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tablero: false, tareas: false } },
  { id: 4, nombre: 'Carpol', rfc: '', telefono: '', email: '', modules: { paciente: false, doctor: false, empresa: false, inventario: false, agenda: false, chat: true, agente: false, tablero: false, tareas: false } },
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
  foto?: string
  custom?: Record<string, unknown>
}

let inventario: InventarioData[] = [
  { id: 1, nombre: 'Paracetamol 500mg', categoria: 'Medicamento', cantidad: 200, unidad: 'caja', precioUnitario: 45 },
  { id: 2, nombre: 'Ibuprofeno 400mg', categoria: 'Medicamento', cantidad: 150, unidad: 'caja', precioUnitario: 55 },
  { id: 3, nombre: 'Guantes de látex', categoria: 'Insumo', cantidad: 500, unidad: 'par', precioUnitario: 8 },
  { id: 4, nombre: 'Jeringa 5ml', categoria: 'Insumo', cantidad: 300, unidad: 'pieza', precioUnitario: 12 },
  { id: 5, nombre: 'Alcohol 70%', categoria: 'Insumo', cantidad: 80, unidad: 'litro', precioUnitario: 35 },
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
