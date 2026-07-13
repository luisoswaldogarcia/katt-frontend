import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { inventarioStore } from '../lib/demoStore'
import { getCategorias } from '../lib/categorias'
import { getCustomFields } from '../lib/customFields'
import { DynamicFields } from '../components/DynamicFields'

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export default function InventarioAlta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const initialData = isEdit ? inventarioStore.getById(Number(id)) : undefined
  const categorias = getCategorias()
  const customFields = getCustomFields('inventario')
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ nombre: '', categoria: '', cantidad: '', unidad: '', precioUnitario: '' })
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({})
  const [foto, setFoto] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (initialData) {
      setForm({
        nombre: initialData.nombre,
        categoria: initialData.categoria,
        cantidad: String(initialData.cantidad),
        unidad: initialData.unidad,
        precioUnitario: String(initialData.precioUnitario),
      })
      if (initialData.custom) setCustomValues(initialData.custom)
      if (initialData.foto) setFoto(initialData.foto)
    }
  }, [initialData])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = { ...form, cantidad: Number(form.cantidad), precioUnitario: Number(form.precioUnitario), custom: customValues, foto }
    if (isEdit) {
      inventarioStore.update(Number(id), parsed)
    } else {
      inventarioStore.create(parsed as never)
    }
    navigate('/inventario')
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {/* Foto */}
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-full bg-katt-200 dark:bg-katt-700 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-katt-500 transition-all"
          >
            {foto ? (
              <img src={foto} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-gray-500 dark:text-gray-300 pointer-events-none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => fileRef.current?.click()} className="text-xs text-katt-500 hover:text-katt-600 transition-colors">
              {foto ? 'Cambiar foto' : 'Subir foto'}
            </button>
            <button type="button" onClick={() => cameraRef.current?.click()} className="text-xs text-katt-500 hover:text-katt-600 transition-colors">
              Tomar foto
            </button>
          </div>
          {foto && (
            <button type="button" onClick={() => setFoto(undefined)} className="text-xs text-red-500 hover:text-red-600 transition-colors">
              Quitar foto
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        </div>

        <input required placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={inputClass} />
        <select required value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className={inputClass}>
          <option value="">Seleccionar categoría</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input required type="number" placeholder="Cantidad" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} className={inputClass} />
        <input required placeholder="Unidad" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} className={inputClass} />
        <input required type="number" placeholder="Precio unitario" value={form.precioUnitario} onChange={e => setForm({ ...form, precioUnitario: e.target.value })} className={inputClass} />

        {customFields.length > 0 && (
          <>
            <hr className="border-katt-200 dark:border-katt-800" />
            <DynamicFields fields={customFields} values={customValues} onChange={(id, value) => setCustomValues(prev => ({ ...prev, [id]: value }))} />
          </>
        )}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => navigate('/inventario')} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
            {isEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
