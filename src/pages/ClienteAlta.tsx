import { EntityAlta } from '../components/EntityAlta'

// Los pacientes ya no tienen acceso a la aplicación: solo son registros de la
// clínica (el acceso con QR vive ahora en la alta de usuarios).
export default function ClienteAlta() {
  return <EntityAlta entity="paciente" />
}
