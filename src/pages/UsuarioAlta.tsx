import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession } from '../lib/auth'
import { empresaStore } from '../lib/demoStore'
import { EntityAlta } from '../components/EntityAlta'
import { getRoles } from '../lib/roles'
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
        { key: 'rol', label: 'Rol', type: 'select', options: getRoles().map(r => r.nombre) },
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

  const displayFields = useMemo(() => {
    const base = fields.map(f =>
      (f.key === 'email' || f.key === 'telefono') && generateQr ? { ...f, required: false } : f
    )
    if (generateQr) {
      base.push({ key: 'usuario', label: 'Usuario', required: false })
    }
    return base
  }, [fields, generateQr])

  const extraData = useMemo(() => ({ generateQr }), [generateQr])

  // Poll signup token status; cerrar QR cuando el usuario lo use
  useEffect(() => {
    if (!qrUrl) return
    const token = new URL(qrUrl).searchParams.get('token')
    if (!token) return
    const id = setInterval(async () => {
      try {
        const { api } = await import('../lib/api')
        const res = await api.get<{ active: boolean }>('signup', `${token}/status`)
        if (!res.active) { setQrData(null); setQrUrl(null) }
      } catch {}
    }, 3000)
    return () => clearInterval(id)
  }, [qrUrl])

  if (unauthorized) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">Solo el usuario owner o super admin puede crear usuarios.</p>
      </div>
    )
  }

  if (!fields.length) return null

  const onBeforeSubmit = (data: Record<string, string>) => {
    if (data.rol !== 'Owner' && data.rol !== 'Superadmin' && !data.empresaId && !generateQr) {
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
    } else {
      navigate('/usuarios')
    }
  }

  return (
    <>
      <div className="px-4 pt-4">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={generateQr} onChange={e => setGenerateQr(e.target.checked)} className="rounded mt-0.5" />
          <span>
            Tiene acceso a la aplicación
            <span className="block text-xs text-katt-500 dark:text-katt-400">
              Se activa con un código QR: la persona escanea, define su contraseña y entra.
              Sin esto, el usuario queda solo como registro de la clínica.
            </span>
          </span>
        </label>
      </div>
      <EntityAlta entity="usuarios" extraFields={displayFields} onBeforeSubmit={onBeforeSubmit} extraData={extraData} onAfterCreate={onAfterCreate} />

      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setQrData(null); setQrUrl(null); navigate('/usuarios') }}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-6 max-w-sm mx-4 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Código de activación temporal</p>
            <img src={qrData} alt="QR de activación" className="mx-auto" />
            <p className="text-xs text-gray-500">Escanea con tu celular para configurar tu acceso</p>
            <button onClick={() => { navigator.clipboard?.writeText(qrUrl || '') }} className="text-xs text-katt-500 hover:underline">
              Copiar enlace
            </button>
            <button onClick={() => { setQrData(null); setQrUrl(null); navigate('/usuarios') }} className="block w-full text-sm text-katt-500 hover:underline">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
