import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { empresaStore } from '../lib/demoStore'
import { EntityAlta } from '../components/EntityAlta'
import type { FormField } from '../components/DataForm'
import QRCode from 'qrcode'

export default function UsuarioAlta() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<FormField[]>([])
  const [unauthorized, setUnauthorized] = useState(false)
  const [generateQr, setGenerateQr] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getSession(), empresaStore.fetch()]).then(([s]) => {
      if (!s?.groups.includes('owner') && !s?.groups.includes('superadmin')) {
        setUnauthorized(true)
        return
      }
      setFields([
        { key: 'nombre', label: 'Nombre' },
        { key: 'rol', label: 'Rol', type: 'select', options: ['Owner', 'Superadmin', 'Administrador', 'Usuario'] },
        { key: 'empresaId', label: 'Empresa', type: 'select', options: [], required: false },
        { key: 'telefono', label: 'Teléfono', type: 'tel' },
        { key: 'email', label: 'Email', type: 'email' },
      ])
      empresaStore.fetch().then(empresas => {
        setFields(prev => prev.map(f =>
          f.key === 'empresaId'
            ? { ...f, options: empresas.map(e => ({ value: String(e.id), label: e.nombre })) }
            : f
        ))
      })
    })
  }, [])

  if (unauthorized) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Solo el usuario owner o super admin puede crear usuarios.</p>
      </div>
    )
  }

  if (!fields.length) return null

  const onBeforeSubmit = (data: Record<string, string>) => {
    if (data.rol !== 'Owner' && data.rol !== 'Superadmin' && !data.empresaId) {
      return 'Debes seleccionar una empresa para este rol'
    }
    return null
  }

  const onAfterCreate = (result: any) => {
    if (result?.signupToken) {
      const base = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const url = `${base}/setup?token=${result.signupToken}`
      setQrUrl(url)
      QRCode.toDataURL(url, { width: 300, margin: 2 }).then(setQrData)
    }
  }

  return (
    <>
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={generateQr} onChange={e => setGenerateQr(e.target.checked)} className="rounded" />
          Generar código QR (no enviar email de activación)
        </label>
      </div>
      <EntityAlta entity="doctor" extraFields={fields} onBeforeSubmit={onBeforeSubmit} extraData={{ generateQr }} onAfterCreate={onAfterCreate} />

      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setQrData(null); setQrUrl(null); navigate('/doctor') }}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-6 max-w-sm mx-4 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Código de activación temporal</p>
            <img src={qrData} alt="QR de activación" className="mx-auto" />
            <p className="text-xs text-gray-500">Escanea con tu celular para configurar tu acceso</p>
            <button onClick={() => { navigator.clipboard?.writeText(qrUrl || '') }} className="text-xs text-katt-500 hover:underline">
              Copiar enlace
            </button>
            <button onClick={() => { setQrData(null); setQrUrl(null); navigate('/doctor') }} className="block w-full text-sm text-katt-500 hover:underline">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
