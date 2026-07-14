import { entityConfigs } from '../lib/entityConfig'
import { DataTable } from '../components/DataTable'

const { columns, basePath, altaPath, store } = entityConfigs.doctor

export default function Usuario() {
  return <DataTable columns={columns} fetchPage={(p) => store.getPage(p)} basePath={basePath} altaPath={altaPath} />
}
