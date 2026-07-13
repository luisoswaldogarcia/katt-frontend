import { useState } from 'react'

interface Props {
  label: string
  field: string
  type?: 'text' | 'date'
  value: string
  onChange: (value: string) => void
  onSort?: () => void
  sortActive?: boolean
  sortAsc?: boolean
}

export function ColumnFilter({ label, field: _field, type, value, onChange, onSort, sortActive, sortAsc }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <th className="text-left px-4 py-3 font-medium">
        <div className="flex items-center gap-1">
          <span className="cursor-pointer select-none" onClick={onSort}>
            {label} {sortActive && (sortAsc ? '↑' : '↓')}
          </span>
          <button
            onClick={() => setOpen(true)}
            className={`p-1 rounded hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors ${value ? 'text-katt-500' : 'opacity-50'}`}
            aria-label={`Filtrar ${label}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>
      </th>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
            <h3 className="font-bold text-sm">Filtrar por {label}</h3>
            <input
              autoFocus
              type={type || 'text'}
              placeholder={`Buscar ${label.toLowerCase()}...`}
              value={value}
              onChange={e => onChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { onChange(''); setOpen(false) }}
                className="px-4 py-2 rounded-lg text-sm hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
