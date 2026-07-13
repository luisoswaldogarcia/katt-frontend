import type { Module } from './customFields'

export interface DocType {
  id: string
  label: string
}

export interface DocumentItem {
  id: number
  tipoId: string
  nombre: string
  origen: 'creado' | 'subido'
  contenido: string
  fecha: string
  mimeType?: string
}

const CATALOG_KEY = 'katt-doc-type-catalog'
const ASSIGN_KEY = 'katt-doc-type-assign'
const DOCS_PREFIX = 'katt-docs'

// --- Global catalog of document types ---

const defaultCatalog: DocType[] = [
  { id: 'receta', label: 'Receta' },
]

const defaultAssignments: Record<string, string[]> = {
  paciente: ['receta'],
}

export function getDocTypeCatalog(): DocType[] {
  const stored = localStorage.getItem(CATALOG_KEY)
  return stored ? JSON.parse(stored) : defaultCatalog
}

export function saveDocTypeCatalog(types: DocType[]) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(types))
}

// --- Assignment: which doc types are enabled per module ---

function getAssignments(): Record<string, string[]> {
  const stored = localStorage.getItem(ASSIGN_KEY)
  return stored ? JSON.parse(stored) : defaultAssignments
}

export function getModuleDocTypes(module: Module): DocType[] {
  const assignments = getAssignments()
  const ids = assignments[module] || []
  const catalog = getDocTypeCatalog()
  return catalog.filter(t => ids.includes(t.id))
}

export function getModuleDocTypeIds(module: string): string[] {
  const assignments = getAssignments()
  return assignments[module] || []
}

export function saveModuleDocTypeIds(module: string, ids: string[]) {
  const assignments = getAssignments()
  assignments[module] = ids
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(assignments))
}

// --- Documents per entity record ---

function docsKey(module: Module, entityId: number) {
  return `${DOCS_PREFIX}-${module}-${entityId}`
}

export function getDocuments(module: Module, entityId: number): DocumentItem[] {
  const stored = localStorage.getItem(docsKey(module, entityId))
  return stored ? JSON.parse(stored) : []
}

export function saveDocument(module: Module, entityId: number, doc: Omit<DocumentItem, 'id' | 'fecha'>) {
  const docs = getDocuments(module, entityId)
  const newDoc: DocumentItem = { ...doc, id: Date.now(), fecha: new Date().toISOString() }
  const updated = [newDoc, ...docs]
  localStorage.setItem(docsKey(module, entityId), JSON.stringify(updated))
  return updated
}

export function removeDocument(module: Module, entityId: number, docId: number) {
  const docs = getDocuments(module, entityId).filter(d => d.id !== docId)
  localStorage.setItem(docsKey(module, entityId), JSON.stringify(docs))
  return docs
}
