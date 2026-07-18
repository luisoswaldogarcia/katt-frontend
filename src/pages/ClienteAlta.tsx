import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EntityAlta } from '../components/EntityAlta'
import type { FormField } from '../components/DataForm'
import { entityConfigs } from '../lib/entityConfig'
import QRCode from 'qrcode'

export default function ClienteAlta() {
  const navigate = useNavigate()
  const [generateQr, setGenerateQr] = useState(false)
  const [qrData, setQrData] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  const extraData = useMemo(() => ({ generateQr }), [generateQr])

  const displayFields: FormField[] = useMemo(() =>
    (entityConfigs.paciente.fields as FormField[]).map(f =>
      (f.key === 'email' || f.key === 'telefono' || f.key === 'doctor') && generateQr ? { ...f, required: false } : f
    ),
    [generateQr]
  )

  const onAfterCreate = (result: any) => {
    if (result?.signupToken) {
      const base = import.meta.env.VITE_FRONTEND_URL || window.location.origin
      const url = `${base}/setup?token=${result.signupToken}`
      setQrUrl(url)
      QRCode.toDataURL(url, { width: 300, margin: 2 }).then(setQrData)
    }
  }

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

  return (
    <>
      <div className="px-4 pt-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={generateQr} onChange={e => setGenerateQr(e.target.checked)} className="rounded" />
          Generar código QR para que el paciente configure su acceso
        </label>
      </div>
      <EntityAlta entity="paciente" extraFields={displayFields} extraData={extraData} onAfterCreate={onAfterCreate} />

      {qrData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setQrData(null); setQrUrl(null); navigate('/paciente') }}>
          <div className="bg-white dark:bg-katt-900 rounded-xl p-6 max-w-sm mx-4 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Código de activación para paciente</p>
            <img src={qrData} alt="QR de activación" className="mx-auto" />
            <p className="text-xs text-gray-500">El paciente escanea para configurar su acceso</p>
            <button onClick={() => { navigator.clipboard?.writeText(qrUrl || '') }} className="text-xs text-katt-500 hover:underline">
              Copiar enlace
            </button>
            <button onClick={() => { setQrData(null); setQrUrl(null); navigate('/paciente') }} className="block w-full text-sm text-katt-500 hover:underline">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  )
}
