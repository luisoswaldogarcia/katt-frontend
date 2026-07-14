import { useState, useRef } from 'react'
import Tesseract from 'tesseract.js'
import type { Module } from '../lib/customFields'
import { getModuleDocTypes, getDocuments, saveDocument, removeDocument } from '../lib/documents'
import type { DocumentItem } from '../lib/documents'

interface Props {
  module: Module
  entityId: number
}

const cardClass = "rounded-lg border border-katt-200 dark:border-katt-800 p-4 space-y-4"
const btnPrimary = "px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export function Documents({ module, entityId }: Props) {
  const docTypes = getModuleDocTypes(module)
  const [docs, setDocs] = useState(() => getDocuments(module, entityId))

  if (docTypes.length === 0) return null

  const sorted = [...docs].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  function handleSave(doc: Omit<DocumentItem, 'id' | 'fecha'>) {
    const updated = saveDocument(module, entityId, doc)
    setDocs(updated)
  }

  function handleDelete(docId: number) {
    setDocs(removeDocument(module, entityId, docId))
  }

  return (
    <div className={cardClass}>
      <h3 className="text-sm font-bold">Documentos</h3>
      {docTypes.map(tipo => (
        <DocTypeSection
          key={tipo.id}
          tipoId={tipo.id}
          label={tipo.label}
          docs={sorted.filter(d => d.tipoId === tipo.id)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}

function DocTypeSection({ tipoId, label, docs, onSave, onDelete }: {
  tipoId: string
  label: string
  docs: DocumentItem[]
  onSave: (doc: Omit<DocumentItem, 'id' | 'fecha'>) => void
  onDelete: (id: number) => void
}) {
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [contenido, setContenido] = useState('')
  const [scanning, setScanning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  function handleCreate() {
    if (!nombre.trim() || !contenido.trim()) return
    onSave({ tipoId, nombre: nombre.trim(), origen: 'creado', contenido: contenido.trim() })
    setNombre('')
    setContenido('')
    setShowForm(false)
  }

  async function handleOCR(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'spa')
      setContenido(prev => prev ? `${prev}\n${text}` : text)
    } catch { /* ignore */ }
    setScanning(false)
    if (cameraRef.current) cameraRef.current.value = ''
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      onSave({ tipoId, nombre: file.name, origen: 'subido', contenido: reader.result as string, mimeType: file.type })
    }
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-katt-600 dark:text-katt-300">{label} ({docs.length})</span>
        <button type="button" onClick={() => setShowForm(!showForm)} className={btnPrimary}>
          {showForm ? 'Cancelar' : `+ ${label}`}
        </button>
      </div>

      {showForm && (
        <div className="space-y-2 pl-2 border-l-2 border-katt-300 dark:border-katt-700">
          <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={inputClass} />
          <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Contenido..." rows={3} className={`${inputClass} resize-none`} />
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={handleCreate} className={`flex-1 ${btnPrimary}`}>Crear</button>
            <button type="button" onClick={() => fileRef.current?.click()} className={`flex-1 ${btnPrimary}`}>Subir archivo</button>
            <button type="button" disabled={scanning} onClick={() => cameraRef.current?.click()} className={`flex-1 ${btnPrimary} ${scanning ? 'opacity-50' : ''}`}>
              {scanning ? 'Escaneando...' : 'Escanear texto'}
            </button>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleOCR} />
          </div>
        </div>
      )}

      {docs.length === 0 && <p className="text-xs text-gray-400">Sin {label.toLowerCase()} aún</p>}
      <div className="max-h-[200px] overflow-y-auto space-y-1">
        {docs.map(doc => (
          <DocItem key={doc.id} doc={doc} onDelete={() => onDelete(doc.id)} />
        ))}
      </div>
    </div>
  )
}

function DocItem({ doc, onDelete }: { doc: DocumentItem; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const fecha = new Date(doc.fecha).toLocaleDateString()

  return (
    <div className="bg-katt-50 dark:bg-katt-800/40 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 text-left">
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{doc.nombre}</span>
          <span className="text-[10px] text-gray-400">{fecha} · {doc.origen === 'creado' ? 'Creado' : 'Subido'}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {doc.origen === 'creado' && <p className="text-sm whitespace-pre-wrap">{doc.contenido}</p>}
          {doc.origen === 'subido' && doc.mimeType?.startsWith('image/') && (
            <img src={doc.contenido} alt={doc.nombre} className="max-w-full rounded" />
          )}
          {doc.origen === 'subido' && !doc.mimeType?.startsWith('image/') && (
            <a href={doc.contenido} download={doc.nombre} className="text-sm text-katt-500 underline">Descargar archivo</a>
          )}
          <button onClick={onDelete} className="text-xs text-red-400 hover:text-red-500 transition-colors">Eliminar</button>
        </div>
      )}
    </div>
  )
}
