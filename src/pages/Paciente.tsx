import { useNavigate } from 'react-router-dom'
import { entityConfigs } from '../lib/entityConfig'
import { DataTable } from '../components/DataTable'

const { columns, basePath, altaPath, store } = entityConfigs.paciente
const calendarIcon = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>

export default function Paciente() {
  const navigate = useNavigate()
  return <DataTable columns={columns} fetchPage={(p) => store.getPage(p)} basePath={basePath} altaPath={altaPath} selectable onSelectionAction={(ids) => navigate('/paciente/citas', { state: { ids } })} selectionIcon={calendarIcon} />
}
