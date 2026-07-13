import { useState } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { labels, presets } from '../lib/labels'
import type { CustomField, FieldType, Module } from '../lib/customFields'
import { fieldTypeLabels, getCustomFields, saveCustomFields } from '../lib/customFields'

export default function Settings() {
  const [preset, setPreset] = useState(localStorage.getItem('katt-preset') || 'salud')
  const [activeModule, setActiveModule] = useState<Module>('paciente')
  const [fields, setFields] = useState<Record<Module, CustomField[]>>({
    paciente: getCustomFields('paciente'),
    doctor: getCustomFields('doctor'),
  })
  const [showFieldForm, setShowFieldForm] = useState(false)
  const [newField, setNewField] = useState<Partial<CustomField>>({ type: 'input', required: false, options: [] })
  const [optionInput, setOptionInput] = useState('')

  const handlePreset = (value: string) => {
    localStorage.setItem('katt-preset', value)
    setPreset(value)
    window.location.reload()
  }

  const needsOptions = (type?: FieldType) => type === 'checkbox' || type === 'radio' || type === 'select'
  const needsRange = (type?: FieldType) => type === 'range'

  const addField = () => {
    if (!newField.label || !newField.type) return
    const field: CustomField = {
      id: Date.now().toString(),
      label: newField.label!,
      type: newField.type!,
      required: newField.required || false,
      ...(needsOptions(newField.type) && { options: newField.options }),
      ...(needsRange(newField.type) && { min: newField.min ?? 0, max: newField.max ?? 10 }),
    }
    const updated = [...fields[activeModule], field]
    setFields({ ...fields, [activeModule]: updated })
    saveCustomFields(activeModule, updated)
    setNewField({ type: 'input', required: false, options: [] })
    setOptionInput('')
    setShowFieldForm(false)
  }

  const removeField = (id: string) => {
    const updated = fields[activeModule].filter(f => f.id !== id)
    setFields({ ...fields, [activeModule]: updated })
    saveCustomFields(activeModule, updated)
  }

  return (
    <div className="p-4 space-y-6 h-full overflow-y-auto">
      <h2 className="text-lg font-bold">Configuración</h2>

      <div className="flex items-center justify-between">
        <span className="text-sm">Tema</span>
        <ThemeToggle />
      </div>

      <div className="space-y-2">
        <span className="text-sm">Tipo de negocio</span>
        <select
          value={preset}
          onChange={e => handlePreset(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-900 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
        >
          {Object.entries(presets).map(([key, val]) => (
            <option key={key} value={key}>
              {val.paciente} / {val.doctor}
            </option>
          ))}
        </select>
      </div>

      {/* Campos personalizados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Campos personalizados</span>
          <button
            onClick={() => setShowFieldForm(true)}
            className="px-3 py-1 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
          >
            + Campo
          </button>
        </div>

        {/* Tabs módulo */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveModule('paciente')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeModule === 'paciente' ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800'}`}
          >
            {labels.paciente}
          </button>
          <button
            onClick={() => setActiveModule('doctor')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${activeModule === 'doctor' ? 'bg-katt-500 text-white' : 'bg-katt-100 dark:bg-katt-800'}`}
          >
            {labels.doctor}
          </button>
        </div>

        {fields[activeModule].length === 0 && (
          <p className="text-xs text-gray-500">No hay campos personalizados para {activeModule === 'paciente' ? labels.paciente : labels.doctor}.</p>
        )}

        <div className="space-y-2">
          {fields[activeModule].map(f => (
            <div key={f.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-katt-900 border border-katt-200 dark:border-katt-800">
              <div>
                <span className="text-sm">{f.label}</span>
                <span className="ml-2 text-xs text-gray-500">{fieldTypeLabels[f.type]}</span>
                {f.required && <span className="ml-1 text-xs text-red-500">*</span>}
              </div>
              <button
                onClick={() => removeField(f.id)}
                className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal nuevo campo */}
      {showFieldForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowFieldForm(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
            <h3 className="font-bold text-sm">Nuevo campo para {activeModule === 'paciente' ? labels.paciente : labels.doctor}</h3>
            <input
              placeholder="Nombre del campo"
              value={newField.label || ''}
              onChange={e => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            />
            <select
              value={newField.type}
              onChange={e => setNewField({ ...newField, type: e.target.value as FieldType, options: [] })}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            >
              {Object.entries(fieldTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {needsOptions(newField.type as FieldType) && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    placeholder="Agregar opción"
                    value={optionInput}
                    onChange={e => setOptionInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && optionInput.trim()) {
                        e.preventDefault()
                        setNewField({ ...newField, options: [...(newField.options || []), optionInput.trim()] })
                        setOptionInput('')
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (optionInput.trim()) {
                        setNewField({ ...newField, options: [...(newField.options || []), optionInput.trim()] })
                        setOptionInput('')
                      }
                    }}
                    className="px-3 py-2 rounded-lg bg-katt-500 text-white text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(newField.options || []).map((opt, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-katt-100 dark:bg-katt-800 text-xs flex items-center gap-1">
                      {opt}
                      <button onClick={() => setNewField({ ...newField, options: newField.options?.filter((_, idx) => idx !== i) })} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {needsRange(newField.type as FieldType) && (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={newField.min ?? 0}
                  onChange={e => setNewField({ ...newField, min: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={newField.max ?? 10}
                  onChange={e => setNewField({ ...newField, max: Number(e.target.value) })}
                  className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
                />
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newField.required || false}
                onChange={e => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
              />
              <span className="text-sm">Obligatorio</span>
            </label>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowFieldForm(false)} className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
                Cancelar
              </button>
              <button onClick={addField} className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
