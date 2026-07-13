import { useState, useRef } from 'react'
import type { Module } from '../lib/customFields'
import { getModuleDocTypes, getDocuments, saveDocument, removeDocument } from '../lib/documents'
import type { DocumentItem } from '../lib/documents'

interface Props {
  module: Module
  entityId: number
}

const cardClass = "rounded-lg border border-katt-200 dark:border-katt-800 p-4 space-y-3"
const btnPrimary = "px-3 py-1.5 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-xs font-medium transition-colors"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"

export function Documents({ module, entityId }: Props) {
  const docTypes = getModuleDocTypes(module)
  const [docs, setDocs] = useState(() => getDocuments(module, entityId))
  const [showCreate, setShowCreate] = useState(false)
  const [tipoId, setTipoId] = useState('')
  const [nombre, setNombre] = useState('')
  const [contenido, setContenido] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  if (docTypes.length === 0) return null

  function handleCreate() {
    if (!tipoId || !nombre.trim() || !contenido.trim()) return
    const updated = saveDocument(module, entityId, { tipoId, nombre: nombre.trim(), origen: 'creado', contenido: contenido.trim() })
    setDocs(updated)
    setNombre('')
    setContenido('')
    setTipoId('')
    setShowCreate(false)
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!tipoId) return
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const updated = saveDocument(module, entityId, {
        tipoId,
        nombre: file.name,
        origen: 'subido',
        contenido: reader.result as string,
        mimeType: file.type,
      })
      setDocs(updated)
      setTipoId('')
    }
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDelete(docId: number) {
    const updated = removeDocument(module, entityId, docId)
    setDocs(updated)
  }

  function getTypeName(id: string) {
    return docTypes.find(t => t.id === id)?.label || 'Documento'
  }

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold">Documentos</h3>
        <button type="button" onClick={() => setShowCreate(!showCreate)} className={btnPrimary}>
          {showCreate ? 'Cancelar' : '+ Documento'}
        </button>
      </div>

      {showCreate && (
        <div className="space-y-2 border-t border-katt-200 dark:border-katt-800 pt-3">
          <select value={tipoId} onChange={e => setTipoId(e.target.value)} className={inputClass}>
            <option value="">Seleccionar tipo...</option>
            {docTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          {tipoId && (
            <>
              <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre del documento" className={inputClass} />
              <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Contenido..." rows={3} className={`${inputClass} resize-none`} />
              <div className="flex gap-2">
                <button type="button" onClick={handleCreate} className={`flex-1 ${btnPrimary}`}>Crear</button>
                <button type="button" onClick={() => fileRef.current?.click()} className={`flex-1 ${btnPrimary}`}>Subir archivo</button>
                <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
              </div>
            </>
          )}
        </div>
      )}

      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {docs.length === 0 && <p className="text-xs text-gray-400">Sin documentos aún</p>}
        {docs.map(doc => (
          <DocItem key={doc.id} doc={doc} typeName={getTypeName(doc.tipoId)} onDelete={() => handleDelete(doc.id)} />
        ))}
      </div>
    </div>
  )
}

function DocItem({ doc, typeName, onDelete }: { doc: DocumentItem; typeName: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const fecha = new Date(doc.fecha).toLocaleDateString()

  return (
    <div className="bg-katt-50 dark:bg-katt-800/40 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-3 py-2 text-left">
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate block">{doc.nombre}</span>
          <span className="text-[10px] text-gray-400">{typeName} · {fecha} · {doc.origen === 'creado' ? 'Creado' : 'Subido'}</span>
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
