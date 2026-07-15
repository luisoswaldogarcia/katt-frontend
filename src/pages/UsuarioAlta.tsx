import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import { empresaStore } from '../lib/demoStore'
import { EntityAlta } from '../components/EntityAlta'
import type { FormField } from '../components/DataForm'

export default function UsuarioAlta() {
  const [fields, setFields] = useState<FormField[]>([])

  useEffect(() => {
    Promise.all([getSession(), empresaStore.fetch()]).then(([s, empresas]) => {
      const isOwner = s?.groups.includes('owner')
      const roles = isOwner ? ['Owner', 'Administrador', 'Usuario'] : ['Administrador', 'Usuario']
      setFields([
        { key: 'nombre', label: 'Nombre' },
        { key: 'rol', label: 'Rol', type: 'select', options: roles },
        { key: 'empresaId', label: 'Empresa', type: 'select', options: empresas.map(e => ({ value: String(e.id), label: e.nombre })), required: false },
        { key: 'telefono', label: 'Teléfono', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
      ])
    })
  }, [])

  if (!fields.length) return null
  return <EntityAlta entity="doctor" extraFields={fields} />
}
