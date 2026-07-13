import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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
  '/settings': 'Configuración',
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const title = titles[pathname]
    || (pathname.startsWith('/paciente/editar') ? 'Editar ' + labels.paciente
    : pathname.startsWith('/paciente/') ? labels.paciente
    : pathname.startsWith('/doctor/editar') ? 'Editar ' + labels.doctor
    : pathname.startsWith('/doctor/') ? labels.doctor
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
          <button className="p-2 rounded-lg hover:bg-katt-100 dark:hover:bg-katt-800 transition-colors relative" aria-label="Notificaciones">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agente" element={<Agente />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/paciente" element={<Paciente />} />
            <Route path="/paciente/alta" element={<PacienteAlta />} />
            <Route path="/paciente/editar/:id" element={<PacienteAlta />} />
            <Route path="/paciente/:id" element={<PacienteDetalle />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/doctor" element={<Doctor />} />
            <Route path="/doctor/alta" element={<DoctorAlta />} />
            <Route path="/doctor/editar/:id" element={<DoctorAlta />} />
            <Route path="/doctor/:id" element={<DoctorDetalle />} />
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
