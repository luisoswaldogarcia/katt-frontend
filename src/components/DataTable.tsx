import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ColumnFilter } from './FilterBar'
import type { PageResult } from '../lib/demoStore'

export interface Column {
  key: string
  label: string
  filterable?: boolean
  filterType?: 'text' | 'date'
  hiddenOn?: 'md' | 'lg'
}

export interface FabMenuItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
}

interface Props {
  columns: Column[]
  fetchPage: (page: number) => Promise<PageResult<Record<string, unknown>>>
  basePath: string
  altaPath: string
  selectable?: boolean
  onSelectionAction?: (ids: number[]) => void
  selectionIcon?: React.ReactNode
  fabMenu?: FabMenuItem[]
}

export function DataTable({ columns, fetchPage, basePath, altaPath, selectable = false, onSelectionAction, selectionIcon, fabMenu }: Props) {
  const navigate = useNavigate()
  const [data, setData] = useState<Record<string, unknown>[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [fabOpen, setFabOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadPage = useCallback(async (p: number) => {
    setLoading(true)
    const result = await fetchPage(p)
    setData(prev => p === 0 ? result.data : [...prev, ...result.data])
    setHasMore(result.hasMore)
    setLoading(false)
  }, [fetchPage])

  useEffect(() => { loadPage(0) }, [loadPage])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || loading || !hasMore) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      const next = page + 1
      setPage(next)
      loadPage(next)
    }
  }

  const handleFilter = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value }))

  const handleSort = (field: string) => {
    if (sortField === field) setSortAsc(!sortAsc)
    else { setSortField(field); setSortAsc(true) }
  }

  const filtered = data.filter(row =>
    columns.every(col => {
      const filter = filters[col.key]
      if (!filter) return true
      const val = String(row[col.key] || '').toLowerCase()
      if (col.filterType === 'date') return val === filter
      return val.includes(filter.toLowerCase())
    })
  ).sort((a, b) => {
    if (!sortField) return 0
    const valA = String(a[sortField] || '')
    const valB = String(b[sortField] || '')
    if (valA < valB) return sortAsc ? -1 : 1
    if (valA > valB) return sortAsc ? 1 : -1
    return 0
  })

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="p-4 space-y-4 h-full overflow-y-auto">


      <div className="overflow-x-auto rounded-lg border border-katt-200/50 dark:border-katt-800/50 bg-white/40 dark:bg-katt-900/40 backdrop-blur-xl shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-white/60 dark:bg-katt-900/60">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every(r => selected.has(r.id as number))}
                    onChange={e => {
                      if (e.target.checked) setSelected(new Set(filtered.map(r => r.id as number)))
                      else setSelected(new Set())
                    }}
                    className="accent-katt-500"
                  />
                </th>
              )}
              {columns.map(col => col.filterable ? (
                <ColumnFilter
                  key={col.key}
                  label={col.label}
                  field={col.key}
                  type={col.filterType}
                  value={filters[col.key] || ''}
                  onChange={v => handleFilter(col.key, v)}
                  onSort={() => handleSort(col.key)}
                  sortActive={sortField === col.key}
                  sortAsc={sortAsc}
                />
              ) : (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 font-medium cursor-pointer select-none ${col.hiddenOn ? `hidden ${col.hiddenOn}:table-cell` : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortField === col.key && (sortAsc ? '↑' : '↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-katt-100 dark:divide-katt-800">
            {filtered.map(row => (
              <tr
                key={row.id as number}
                className={`hover:bg-katt-50 dark:hover:bg-katt-800/50 transition-colors cursor-pointer ${selected.has(row.id as number) ? 'bg-katt-50 dark:bg-katt-800/30' : ''}`}
                onClick={() => navigate(`${basePath}/${row.id}`)}
              >
                {selectable && (
                  <td className="px-4 py-3 w-10" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id as number)}
                      onChange={() => {
                        const next = new Set(selected)
                        if (next.has(row.id as number)) next.delete(row.id as number)
                        else next.add(row.id as number)
                        setSelected(next)
                      }}
                      className="accent-katt-500"
                    />
                  </td>
                )}
                {columns.map((col, i) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${i === 0 ? 'text-katt-500' : ''} ${col.hiddenOn ? `hidden ${col.hiddenOn}:table-cell` : ''}`}
                  >
                    {String(row[col.key] || '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <svg className="w-5 h-5 animate-spin text-katt-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {!hasMore && data.length > 0 && (
        <p className="text-center text-xs text-gray-500 py-2">No hay más registros</p>
      )}

      {!loading && data.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-8">No hay registros</p>
      )}

      {fabOpen && <div className="fixed inset-0 z-30" onClick={() => setFabOpen(false)} />}

      {fabMenu && fabOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-2">
          {fabMenu.map((item, i) => (
            <button key={i} onClick={() => { item.onClick(); setFabOpen(false) }} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-katt-800 shadow-lg border border-katt-200 dark:border-katt-700 text-sm font-medium text-katt-700 dark:text-katt-200 hover:bg-katt-50 dark:hover:bg-katt-700 transition-colors">
              {item.label}
              <span className="w-8 h-8 rounded-full bg-katt-500 text-white flex items-center justify-center">{item.icon}</span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (selected.size > 0 && onSelectionAction) {
            onSelectionAction(Array.from(selected))
            setSelected(new Set())
          } else if (fabMenu) {
            setFabOpen(!fabOpen)
          } else {
            navigate(altaPath)
          }
        }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-katt-500 hover:bg-katt-600 text-white shadow-lg flex items-center justify-center transition-all z-40 ${fabOpen ? 'rotate-45' : ''}`}
        aria-label={selected.size > 0 ? 'Acción masiva' : 'Alta'}
      >
        {selected.size > 0 ? (
          selectionIcon || <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path d="M12 5v14M5 12h14" /></svg>
        )}
      </button>
    </div>
  )
}
