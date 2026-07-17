import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { empresaStore } from '../lib/demoStore'
import { EntityAlta } from '../components/EntityAlta'
import type { FormField } from '../components/DataForm'

export default function UsuarioAlta() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<FormField[]>([])
  const [unauthorized, setUnauthorized] = useState(false)

  useEffect(() => {
    Promise.all([getSession(), empresaStore.fetch()]).then(([s]) => {
      if (!s?.groups.includes('owner')) {
        setUnauthorized(true)
        return
      }
      setFields([
        { key: 'nombre', label: 'Nombre' },
        { key: 'rol', label: 'Rol', type: 'select', options: ['Owner', 'Administrador', 'Usuario'] },
        { key: 'empresaId', label: 'Empresa', type: 'select', options: [] },
        { key: 'telefono', label: 'Teléfono', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
      ])
      empresaStore.fetch().then(empresas => {
        setFields(prev => prev.map(f =>
          f.key === 'empresaId'
            ? { ...f, options: empresas.map(e => ({ value: String(e.id), label: e.nombre })) }
            : f
        ))
      })
    })
  }, [])

  if (unauthorized) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Solo el usuario owner puede crear usuarios.</p>
      </div>
    )
  }

  if (!fields.length) return null
  return <EntityAlta entity="doctor" extraFields={fields} />
}
