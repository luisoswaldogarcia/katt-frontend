import { getConfig, saveConfig, getCached } from './configApi'

// Módulos sobre los que aplican permisos
export const MODULOS_PERMISOS = ['clientes', 'usuarios', 'agenda', 'tareas', 'documentos', 'agente'] as const
export type ModuloPermiso = (typeof MODULOS_PERMISOS)[number]

export const ACCIONES = ['ver', 'crear', 'editar', 'eliminar'] as const
export type Accion = (typeof ACCIONES)[number]

export interface Rol {
  id: string
  nombre: string
  // Grupo de Cognito con el que autentica este rol (owner | admin | user)
  grupo: 'owner' | 'admin' | 'user'
  permisos: Record<string, Accion[]>
}

const todas = [...ACCIONES]

const defaults: Rol[] = [
  {
    id: 'owner',
    nombre: 'Owner',
    grupo: 'owner',
    permisos: Object.fromEntries(MODULOS_PERMISOS.map(m => [m, todas])),
  },
  {
    id: 'superadmin',
    nombre: 'Superadmin',
    grupo: 'admin',
    permisos: Object.fromEntries(MODULOS_PERMISOS.map(m => [m, todas])),
  },
  {
    id: 'admin',
    nombre: 'Administrador',
    grupo: 'admin',
    permisos: {
      clientes: todas,
      usuarios: [], // como hoy: solo owner/superadmin gestionan usuarios
      agenda: todas,
      tareas: todas,
      documentos: todas,
      agente: todas,
    },
  },
  {
    id: 'user',
    nombre: 'Usuario',
    grupo: 'user',
    permisos: {
      clientes: ['ver', 'crear', 'editar'],
      usuarios: [],
      agenda: ['ver', 'crear', 'editar', 'eliminar'],
      tareas: ['ver', 'crear', 'editar'],
      documentos: ['ver', 'crear'],
      agente: ['ver'],
    },
  },
]

export async function fetchRoles(): Promise<Rol[]> {
  return getConfig<Rol[]>('roles', defaults)
}

export function getRoles(): Rol[] {
  return getCached<Rol[]>('roles', defaults)
}

export async function saveRoles(roles: Rol[]) {
  await saveConfig('roles', roles)
}

// Normaliza cualquier grafía ('owner', 'Owner', 'ADMIN', 'administrador'…) al rol del catálogo
export function normalizarRol(input: string, roles?: Rol[]): Rol | null {
  const q = (input || '').trim().toLowerCase()
  if (!q) return null
  const lista = roles ?? getRoles()
  const alias: Record<string, string> = { administrador: 'admin', 'médico': 'user', medico: 'user', usuario: 'user' }
  const id = alias[q] || q
  return lista.find(r => r.id === id || r.nombre.toLowerCase() === q) || null
}

// Rol efectivo de la sesión actual (a partir de los grupos de Cognito)
export function rolDeSesion(groups: string[]): Rol | null {
  const lista = getRoles()
  const g = groups || []
  const id = g.includes('owner') ? 'owner' : g.includes('superadmin') ? 'superadmin' : (g.includes('admin') || g.includes('administrador')) ? 'admin' : 'user'
  return normalizarRol(id, lista)
}

// Permiso efectivo: catálogo si existe, si no el comportamiento histórico
export function puede(groups: string[], modulo: ModuloPermiso, accion: Accion): boolean {
  const rol = rolDeSesion(groups)
  if (rol && rol.permisos && Array.isArray(rol.permisos[modulo])) {
    return rol.permisos[modulo].includes(accion)
  }
  // Respaldo: misma lógica que había antes
  const g = groups || []
  if (g.includes('owner') || g.includes('superadmin')) return true
  if (modulo === 'usuarios') return false
  return true
}
