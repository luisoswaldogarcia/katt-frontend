import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { getUnreadCount, clearUnread } from './lib/unreadMessages'
import { Sidebar } from './components/Sidebar'
import { labels } from './lib/labels'
import Home from './pages/Home'
import Agente from './pages/Agente'
import Chat from './pages/Chat'
import Paciente from './pages/Paciente'
import PacienteAlta from './pages/PacienteAlta'
import PacienteDetalle from './pages/PacienteDetalle'
import Agenda from './pages/Agenda'
import Doctor from './pages/Doctor'
import DoctorAlta from './pages/DoctorAlta'
import DoctorDetalle from './pages/DoctorDetalle'
import Inventario from './pages/Inventario'
import InventarioAlta from './pages/InventarioAlta'
import InventarioDetalle from './pages/InventarioDetalle'
import InventarioMovimiento from './pages/InventarioMovimiento'
import PacienteCitas from './pages/PacienteCitas'
import Tablero from './pages/Tablero'
import TareasLista from './pages/TareasLista'
import Settings from './pages/Settings'

const titles: Record<string, string> = {
  '/': 'Inicio',
  '/agente': 'Agente',
  '/chat': 'Chat',
  '/paciente': labels.paciente + 's',
  '/paciente/alta': 'Alta ' + labels.paciente,
  '/agenda': 'Agenda',
  '/doctor': labels.doctor,
  '/doctor/alta': 'Alta ' + labels.doctor,
  '/inventario': labels.inventario,
  '/inventario/alta': 'Alta ' + labels.inventario,
  '/inventario/movimiento': 'Movimiento de inventario',
  '/paciente/citas': 'Agendar citas',
  '/tablero': labels.tablero,
  '/tareas': labels.tareas,
  '/settings': 'Configuración',
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unread, setUnread] = useState(getUnreadCount)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const title = titles[pathname]
    || (pathname.startsWith('/paciente/editar') ? 'Editar ' + labels.paciente
    : pathname.startsWith('/paciente/') ? labels.paciente
    : pathname.startsWith('/doctor/editar') ? 'Editar ' + labels.doctor
    : pathname.startsWith('/doctor/') ? labels.doctor
    : pathname.startsWith('/inventario/editar') ? 'Editar ' + labels.inventario
    : pathname.startsWith('/inventario/') ? labels.inventario
    : 'Katt')

  return (
    <div className="flex h-dvh overflow-hidden">
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
          <button
            onClick={() => { clearUnread(); setUnread(0); navigate('/chat') }}
            className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors relative"
            aria-label="Mensajes nuevos"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agente" element={<Agente />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/paciente" element={<Paciente />} />
            <Route path="/paciente/alta" element={<PacienteAlta />} />
            <Route path="/paciente/citas" element={<PacienteCitas />} />
            <Route path="/paciente/editar/:id" element={<PacienteAlta />} />
            <Route path="/paciente/:id" element={<PacienteDetalle />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/doctor/alta" element={<DoctorAlta />} />
            <Route path="/doctor/editar/:id" element={<DoctorAlta />} />
            <Route path="/doctor/:id" element={<DoctorDetalle />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/inventario/alta" element={<InventarioAlta />} />
            <Route path="/inventario/editar/:id" element={<InventarioAlta />} />
            <Route path="/inventario/movimiento" element={<InventarioMovimiento />} />
            <Route path="/inventario/:id" element={<InventarioDetalle />} />
            <Route path="/tablero" element={<Tablero />} />
            <Route path="/tareas" element={<TareasLista />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
