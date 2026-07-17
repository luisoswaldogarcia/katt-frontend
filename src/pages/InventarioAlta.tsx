import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { inventarioStore } from '../lib/demoStore'
import { getCategorias } from '../lib/categorias'
import { DataForm } from '../components/DataForm'
import type { FormField } from '../components/DataForm'

export default function InventarioAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? inventarioStore.getById(id) : undefined

  const fields: FormField[] = useMemo(() => [
    { key: 'nombre', label: 'Nombre' },
    { key: 'categoria', label: 'Categoría', type: 'select', options: getCategorias() },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'unidad', label: 'Unidad', required: false },
    { key: 'precioUnitario', label: 'Precio unitario' },
  ], [])

  const handleSubmit = async (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    const parsed = { ...data, cantidad: Number(data.cantidad), precioUnitario: Number(data.precioUnitario), custom, foto }
    if (isEdit) {
      await inventarioStore.update(id, parsed)
    } else {
      await inventarioStore.create(parsed as never)
    }
    navigate('/inventario')
  }

  return <DataForm fields={fields} module="inventario" basePath="/inventario" initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
