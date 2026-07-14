import { useParams, useNavigate } from 'react-router-dom'
import { inventarioStore } from '../lib/demoStore'
import { getCategorias } from '../lib/categorias'
import { DataForm } from '../components/DataForm'
import type { FormField } from '../components/DataForm'

const categorias = getCategorias()

const fields: FormField[] = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'categoria', label: 'Categoría', type: 'select', options: categorias },
  { key: 'cantidad', label: 'Cantidad' },
  { key: 'unidad', label: 'Unidad' },
  { key: 'precioUnitario', label: 'Precio unitario' },
]

export default function InventarioAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? inventarioStore.getById(Number(id)) : undefined

  const handleSubmit = (data: Record<string, string>, custom: Record<string, unknown>, foto?: string) => {
    const parsed = { ...data, cantidad: Number(data.cantidad), precioUnitario: Number(data.precioUnitario), custom, foto }
    if (isEdit) {
      inventarioStore.update(Number(id), parsed)
    } else {
      inventarioStore.create(parsed as never)
    }
    navigate('/inventario')
  }

  return <DataForm fields={fields} module="inventario" basePath="/inventario" initialData={initialData as never} onSubmit={handleSubmit} isEdit={isEdit} />
}
