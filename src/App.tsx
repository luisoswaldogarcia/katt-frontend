import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { getSession, signOut } from './lib/auth'
import { preloadStores } from './lib/demoStore'
import { loadAllConfig } from './lib/configApi'
import { api } from './lib/api'
import './lib/amplify'
import { Sidebar } from './components/Sidebar'
import { useViewportHeight } from './hooks/useKeyboardOffset'
import { getLabels } from './lib/labels'
import Login from './pages/Login'
import SetupPassword from './pages/SetupPassword'
import Home from './pages/Home'
import Cliente from './pages/Cliente'
import ClienteAlta from './pages/ClienteAlta'
import ClienteDetalle from './pages/ClienteDetalle'
import Agenda from './pages/Agenda'
import Usuario from './pages/Usuario'
import UsuarioAlta from './pages/UsuarioAlta'
import UsuarioDetalle from './pages/UsuarioDetalle'
import ClienteCitas from './pages/ClienteCitas'
import TareasLista from './pages/TareasLista'
import Empresa from './pages/Empresa'
import EmpresaAlta from './pages/EmpresaAlta'
import EmpresaDetalle from './pages/EmpresaDetalle'
import Settings from './pages/Settings'

function Layout({ onLogout }: { onLogout: () => void }) {
  const viewportHeight = useViewportHeight()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const lbl = getLabels()
  const titles: Record<string, string> = {
    '/': 'Inicio',
    '/paciente': lbl.paciente + 's',
    '/paciente/alta': 'Alta ' + lbl.paciente,
    '/agenda': 'Agenda',
    '/doctor': lbl.doctor,
    '/doctor/alta': 'Alta ' + lbl.doctor,
    '/paciente/citas': 'Agendar citas',
    '/empresa': lbl.empresa,
    '/empresa/alta': 'Alta ' + lbl.empresa,
    '/tareas': lbl.tareas,
    '/settings': 'Configuración',
  }
  const title = titles[pathname]
    || (pathname.startsWith('/paciente/editar') ? 'Editar ' + lbl.paciente
    : pathname.startsWith('/paciente/') ? lbl.paciente
    : pathname.startsWith('/doctor/editar') ? 'Editar ' + lbl.doctor
    : pathname.startsWith('/doctor/') ? lbl.doctor
    : pathname.startsWith('/empresa/editar') ? 'Editar ' + lbl.empresa
    : pathname.startsWith('/empresa/') ? lbl.empresa
    : 'Katt')

  return (
    <div
      className={`flex overflow-hidden ${viewportHeight ? '' : 'h-dvh'}`}
      style={viewportHeight ? { height: viewportHeight } : undefined}
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-katt-200 dark:border-katt-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors"
            aria-label="Menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="font-bold text-katt-600 dark:text-katt-300">{title}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors"
              aria-label="Cerrar sesión"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/paciente" element={<Cliente />} />
            <Route path="/paciente/alta" element={<ClienteAlta />} />
            <Route path="/paciente/citas" element={<ClienteCitas />} />
            <Route path="/paciente/editar/:id" element={<ClienteAlta />} />
            <Route path="/paciente/:id" element={<ClienteDetalle />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/doctor" element={<Usuario />} />
            <Route path="/doctor/alta" element={<UsuarioAlta />} />
            <Route path="/doctor/editar/:id" element={<UsuarioAlta />} />
            <Route path="/doctor/:id" element={<UsuarioDetalle />} />
            <Route path="/empresa" element={<Empresa />} />
            <Route path="/empresa/alta" element={<EmpresaAlta />} />
            <Route path="/empresa/editar/:id" element={<EmpresaAlta />} />
            <Route path="/empresa/:id" element={<EmpresaDetalle />} />
            <Route path="/tareas" element={<TareasLista />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then(async s => {
      if (s) {
        const { setActiveEmpresaId, getActiveEmpresaId } = await import('./lib/modules')
        try {
          const me = await api.get<{ empresaId: string | null; empresas?: { id: string; nombre: string }[] }>('me', '')
          if (me.empresaId) {
            setActiveEmpresaId(me.empresaId)
          } else if (me.empresas?.length && !getActiveEmpresaId()) {
            setActiveEmpresaId(me.empresas[0].id)
          }
          if (me.empresas?.length) {
            const { seedEmpresas } = await import('./lib/demoStore')
            seedEmpresas(me.empresas)
          }
        } catch {}
        await loadAllConfig().catch(() => {})
        await preloadStores()
      }
      setAuthenticated(!!s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-dvh flex items-center justify-center bg-katt-50 dark:bg-katt-950"><span className="text-katt-500">Cargando...</span></div>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/setup" element={<SetupPassword />} />
        <Route path="*" element={authenticated
          ? <Layout onLogout={() => { signOut(); setAuthenticated(false) }} />
          : <Login onLogin={() => setAuthenticated(true)} />
        } />
      </Routes>
    </BrowserRouter>
  )
}
