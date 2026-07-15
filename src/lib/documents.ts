import { getConfig, saveConfig, getCached } from './configApi'
import { api } from './api'
import type { Module } from './customFields'

export interface DocType {
  id: string
  label: string
}

export interface DocumentItem {
  id: string
  tipoId: string
  nombre: string
  origen: 'creado' | 'subido'
  contenido: string
  fecha: string
  mimeType?: string
  s3Key?: string
}

const defaultCatalog: DocType[] = [
  { id: 'receta', label: 'Receta' },
]

const defaultAssignments: Record<string, string[]> = {
  paciente: ['receta'],
}

// --- Doc type catalog (stored in backend config) ---

export async function fetchDocTypeCatalog(): Promise<DocType[]> {
  return getConfig<DocType[]>('doc-type-catalog', defaultCatalog)
}

export function getDocTypeCatalog(): DocType[] {
  return getCached<DocType[]>('doc-type-catalog', defaultCatalog)
}

export async function saveDocTypeCatalog(types: DocType[]) {
  await saveConfig('doc-type-catalog', types)
}

// --- Assignments per module ---

export async function fetchDocTypeAssignments(): Promise<Record<string, string[]>> {
  return getConfig<Record<string, string[]>>('doc-type-assignments', defaultAssignments)
}

function getAssignments(): Record<string, string[]> {
  return getCached<Record<string, string[]>>('doc-type-assignments', defaultAssignments)
}

export function getModuleDocTypes(module: Module): DocType[] {
  const ids = getAssignments()[module] || []
  return getDocTypeCatalog().filter(t => ids.includes(t.id))
}

export function getModuleDocTypeIds(module: string): string[] {
  return getAssignments()[module] || []
}

export async function saveModuleDocTypeIds(module: string, ids: string[]) {
  const assignments = getAssignments()
  assignments[module] = ids
  await saveConfig('doc-type-assignments', assignments)
}

// --- Documents per entity (stored as entity items via CRUD) ---

export async function getDocuments(module: Module, entityId: string): Promise<DocumentItem[]> {
  try {
    const res = await api.list<DocumentItem>(`documentos?parentModule=${module}&parentId=${entityId}`)
    return res.items || []
  } catch {
    return []
  }
}

export async function saveDocument(module: Module, entityId: string, doc: Omit<DocumentItem, 'id' | 'fecha'>): Promise<DocumentItem> {
  return api.create<DocumentItem>('documentos', { ...doc, parentModule: module, parentId: entityId })
}

export async function removeDocument(_module: Module, _entityId: string, docId: string): Promise<void> {
  await api.remove('documentos', docId)
}

// --- Presigned URL helpers ---

export async function getUploadPresignedUrl(filename: string, contentType: string): Promise<{ url: string; key: string }> {
  return api.create<{ url: string; key: string }>('documentos/presign', { filename, contentType, type: 'upload' })
}

export async function getDownloadPresignedUrl(key: string): Promise<{ url: string }> {
  return api.create<{ url: string }>('documentos/presign', { filename: key, type: 'download' })
}
