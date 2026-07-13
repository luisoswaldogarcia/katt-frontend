import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCustomFields } from '../lib/customFields'
import { DynamicFields } from './DynamicFields'
import type { Module } from '../lib/customFields'

export interface FormField {
  key: string
  label: string
  type?: 'text' | 'email' | 'tel' | 'date'
  required?: boolean
}

interface Props {
  fields: FormField[]
  module: Module
  basePath: string
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, string>, custom: Record<string, unknown>) => void
  isEdit?: boolean
}

export function DataForm({ fields, module, basePath, initialData, onSubmit, isEdit }: Props) {
  const navigate = useNavigate()
  const customFields = getCustomFields(module)
  const [form, setForm] = useState<Record<string, string>>({})
  const [customValues, setCustomValues] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (initialData) {
      const formData: Record<string, string> = {}
      fields.forEach(f => { formData[f.key] = String(initialData[f.key] || '') })
      setForm(formData)
      if (initialData.custom) setCustomValues(initialData.custom as Record<string, unknown>)
    } else {
      const formData: Record<string, string> = {}
      fields.forEach(f => { formData[f.key] = '' })
      setForm(formData)
    }
  }, [initialData, fields])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form, customValues)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

  return (
    <div className="p-4 h-full overflow-y-auto">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        {fields.map(f => (
          <input
            key={f.key}
            required={f.required !== false}
            type={f.type || 'text'}
            placeholder={f.label}
            value={form[f.key] || ''}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            className={inputClass}
          />
        ))}

        {customFields.length > 0 && (
          <>
            <hr className="border-katt-200 dark:border-katt-800" />
            <DynamicFields
              fields={customFields}
              values={customValues}
              onChange={(id, value) => setCustomValues(prev => ({ ...prev, [id]: value }))}
            />
          </>
        )}

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => navigate(basePath)} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
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
