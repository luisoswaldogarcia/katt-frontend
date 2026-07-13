import type { CustomField } from '../lib/customFields'

interface Props {
  fields: CustomField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
}

const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export function DynamicFields({ fields, values, onChange }: Props) {
  return (
    <>
      {fields.map(field => (
        <div key={field.id} className="space-y-1">
          <label className="text-sm font-medium">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {field.type === 'input' && (
            <input type="text" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'textarea' && (
            <textarea required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} rows={3} />
          )}

          {field.type === 'number' && (
            <input type="number" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'date' && (
            <input type="date" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'time' && (
            <input type="time" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'email' && (
            <input type="email" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'tel' && (
            <input type="tel" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'url' && (
            <input type="url" required={field.required} value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} className={inputClass} />
          )}

          {field.type === 'file' && (
            <input type="file" required={field.required} onChange={e => onChange(field.id, e.target.files?.[0])} className={inputClass} />
          )}

          {field.type === 'color' && (
            <input type="color" value={(values[field.id] as string) || '#7c3aed'} onChange={e => onChange(field.id, e.target.value)} className="w-12 h-10 rounded-lg border border-katt-200 dark:border-katt-700 cursor-pointer" />
          )}

          {field.type === 'range' && (
            <div className="flex items-center gap-3">
              <input type="range" min={field.min ?? 0} max={field.max ?? 10} value={(values[field.id] as number) || 0} onChange={e => onChange(field.id, Number(e.target.value))} className="flex-1" />
              <span className="text-sm w-8 text-center">{(values[field.id] as number) || 0}</span>
            </div>
          )}

          {field.type === 'boolean' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!values[field.id]} onChange={e => onChange(field.id, e.target.checked)} className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500" />
              <span className="text-sm">Sí</span>
            </label>
          )}

          {field.type === 'checkbox' && (
            <div className="space-y-1">
              {(field.options || []).map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={((values[field.id] as string[]) || []).includes(opt)}
                    onChange={e => {
                      const current = (values[field.id] as string[]) || []
                      onChange(field.id, e.target.checked ? [...current, opt] : current.filter(v => v !== opt))
                    }}
                    className="w-4 h-4 rounded border-katt-300 text-katt-500 focus:ring-katt-500"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          )}

          {field.type === 'radio' && (
            <div className="flex flex-wrap gap-2">
              {(field.options || []).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange(field.id, opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    values[field.id] === opt
                      ? 'bg-katt-500 text-white border-katt-500'
                      : 'border-katt-200 dark:border-katt-700 hover:bg-katt-100 dark:hover:bg-katt-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {field.type === 'select' && (
            <select value={(values[field.id] as string) || ''} onChange={e => onChange(field.id, e.target.value)} required={field.required} className={inputClass}>
              <option value="">Seleccionar...</option>
              {(field.options || []).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}
    </>
  )
}
