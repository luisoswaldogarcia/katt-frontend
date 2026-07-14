import { empresaStore } from '../lib/demoStore'
import { EntityAlta } from '../components/EntityAlta'
import type { FormField } from '../components/DataForm'

const empresas = empresaStore.getAll()

const fields: FormField[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'rol', label: 'Rol', type: 'select', options: ['Owner', 'Administrador', 'Médico'] },
  { key: 'empresaId', label: 'Empresa', type: 'select', options: empresas.map(e => ({ value: String(e.id), label: e.nombre })), required: false },
  { key: 'telefono', label: 'Teléfono', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
]

export default function UsuarioAlta() {
  return <EntityAlta entity="doctor" extraFields={fields} />
}
