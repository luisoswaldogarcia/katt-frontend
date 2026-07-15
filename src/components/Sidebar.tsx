import { NavLink } from 'react-router-dom'
import { labels } from '../lib/labels'
import { getModules } from '../lib/modules'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const modules = getModules()

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
            <img src="/katt-avatar.jpeg" alt="Katt" className="w-8 h-8 rounded-full" />
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
          {modules.agente && <NavLink
            to="/agente"
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Agente
          </NavLink>}
          {modules.chat && <NavLink
            to="/chat"
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
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            Chat
          </NavLink>}
          <NavLink
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
          </NavLink>
          <NavLink
            to="/doctor"
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
            {labels.doctor}
          </NavLink>
          {modules.empresa && <NavLink
            to="/empresa"
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
              <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15" />
              <path d="M9 9h1M9 13h1M9 17h1" />
            </svg>
            {labels.empresa}
          </NavLink>}
          {modules.inventario && <NavLink
            to="/inventario"
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
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
            </svg>
            {labels.inventario}
          </NavLink>}
          {modules.pos && <NavLink
            to="/pos"
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20M6 16h4" />
            </svg>
            {labels.pos}
          </NavLink>}
          {modules.compras && <NavLink
            to="/compras"
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
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {labels.compras}
          </NavLink>}
          {modules.agenda && <NavLink
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
          {modules.tareas && <NavLink
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
