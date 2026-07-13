import { useParams, useNavigate } from 'react-router-dom'
import { labels } from '../lib/labels'
import { empresaStore, doctorStore } from '../lib/demoStore'
import { DataDetail } from '../components/DataDetail'

export default function EmpresaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const empresa = empresaStore.getById(Number(id))

  if (!empresa) {
    return <div className="p-4 text-center text-gray-500">{labels.empresa} no encontrada.</div>
  }

  const usuarios = doctorStore.getAll().filter(u => u.empresaId === empresa.id)

  return (
    <div className="p-4 h-full overflow-y-auto space-y-6">
      <DataDetail
        data={empresa as unknown as Record<string, unknown>}
        fields={[
          { key: 'rfc', label: 'RFC' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'email', label: 'Email' },
          { key: 'direccion', label: 'Dirección' },
        ]}
        module="empresa"
        basePath="/empresa"
        entityLabel={labels.empresa}
        onDelete={() => { empresaStore.remove(Number(id)); navigate('/empresa') }}
        bare
      />

      <div className="space-y-3 rounded-lg border border-katt-200 dark:border-katt-800 p-4">
        <p className="text-sm font-semibold text-katt-600 dark:text-katt-300">Usuarios asignados</p>
        {usuarios.length === 0 ? (
          <p className="text-xs text-gray-500">Sin usuarios asignados.</p>
        ) : (
          <div className="space-y-2">
            {usuarios.map(u => (
              <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
                <span className="text-sm">{u.nombre}</span>
                <span className="text-xs text-gray-500">{u.rol}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
