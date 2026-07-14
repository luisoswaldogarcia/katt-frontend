import { labels } from './labels'
import { pacienteStore, doctorStore, empresaStore } from './demoStore'
import type { Column } from '../components/DataTable'
import type { FormField } from '../components/DataForm'

export interface EntityConfig {
  columns: Column[]
  fields: FormField[]
  store: { getPage: (p: number) => Promise<{ data: Record<string, unknown>[]; total: number; hasMore: boolean }>; getById: (id: number) => unknown; create: (data: never) => unknown; update: (id: number, data: unknown) => void; remove: (id: number) => void }
  basePath: string
  altaPath: string
  module: string
}

export const entityConfigs: Record<string, EntityConfig> = {
  paciente: {
    columns: [
      { key: 'nombre', label: 'Nombre', filterable: true },
      { key: 'doctor', label: labels.doctor, filterable: true },
      { key: 'proximaCita', label: 'Próxima cita', filterable: true, filterType: 'date' },
      { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
      { key: 'email', label: 'Email', hiddenOn: 'lg' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'doctor', label: labels.doctor },
      { key: 'proximaCita', label: 'Próxima cita', type: 'date', required: false },
      { key: 'telefono', label: 'Teléfono', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
    ],
    store: pacienteStore as unknown as EntityConfig['store'],
    basePath: '/paciente',
    altaPath: '/paciente/alta',
    module: 'paciente',
  },
  doctor: {
    columns: [
      { key: 'nombre', label: 'Nombre', filterable: true },
      { key: 'rol', label: 'Rol', filterable: true },
      { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
      { key: 'email', label: 'Email', hiddenOn: 'lg' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'rol', label: 'Rol', type: 'select', options: ['Owner', 'Administrador', 'Médico'] },
      { key: 'telefono', label: 'Teléfono', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
    ],
    store: doctorStore as unknown as EntityConfig['store'],
    basePath: '/doctor',
    altaPath: '/doctor/alta',
    module: 'doctor',
  },
  empresa: {
    columns: [
      { key: 'nombre', label: 'Nombre', filterable: true },
      { key: 'telefono', label: 'Teléfono', hiddenOn: 'md' },
    ],
    fields: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'rfc', label: 'RFC', required: false },
      { key: 'telefono', label: 'Teléfono', type: 'tel' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'direccion', label: 'Dirección', required: false },
    ],
    store: empresaStore as unknown as EntityConfig['store'],
    basePath: '/empresa',
    altaPath: '/empresa/alta',
    module: 'empresa',
  },
}
