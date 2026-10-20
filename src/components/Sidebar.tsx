import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { labels } from '../lib/labels'
import { getModules } from '../lib/modules'
import { puede } from '../lib/roles'
import { getSession } from '../lib/auth'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [modules, setModules] = useState(getModules)
  const [groups, setGroups] = useState<string[]>([])

  useEffect(() => {
    getSession().then(s => {
      setGroups(s?.groups || [])
    })
    const refresh = () => setModules(getModules())
    window.addEventListener('katt:modules', refresh)
    return () => window.removeEventListener('katt:modules', refresh)
  }, [])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-white dark:bg-katt-900 border-r border-katt-200 dark:border-katt-800 transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 ${!open ? 'md:-translate-x-full' : ''}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-katt-200 dark:border-katt-800">
          <div className="flex items-center gap-2">
            <img src="/katt-avatar.jpeg" alt="Katt" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-bold text-katt-600 dark:text-katt-300">Katt</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="p-3 space-y-1">
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Inicio
          </NavLink>
          {modules.clientes && puede(groups, 'clientes', 'ver') && <NavLink
            to="/paciente"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {labels.paciente}
          </NavLink>}
          {modules.usuarios && puede(groups, 'usuarios', 'ver') && <NavLink
            to="/usuarios"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {labels.usuarios}
          </NavLink>}

          {modules.agenda && puede(groups, 'agenda', 'ver') && <NavLink
            to="/agenda"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Agenda
          </NavLink>}
          {modules.tareas && puede(groups, 'tareas', 'ver') && <NavLink
            to="/tareas"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            {labels.tareas}
          </NavLink>}
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300 font-medium'
                  : 'hover:bg-katt-50 dark:hover:bg-katt-800/50'
              }`
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Configuración
          </NavLink>
        </nav>
      </aside>
    </>
  )
}
