# Katt — Frontend (guía de trabajo)

SPA React + Vite + tokens tipo Tailwind. Desplegada en CloudFront (`https://d1fn2u7xetgmq1.cloudfront.net`).
Backend: `../backend` (repo aparte, SAM/Lambda). Todo lo de aquí se aprendió produciendo este proyecto; si algo cambia, actualizarlo en el mismo commit que lo cambia.

## Comandos

```bash
npm run dev                 # dev server (https://localhost:5173 — es https por basicSsl)
npm run build               # build de producción
npm run lint                # oxlint (comparar contra la línea base de warnings, no contra cero)
npm run deploy              # build + s3 sync --delete + invalidación CloudFront
E2E_BASE_URL=https://localhost:5173 npx playwright test e2e/agenda.spec.ts   # E2E contra local
npx playwright test         # E2E contra PRODUCCIÓN (baseURL por defecto del playwright.config)
```

## Mapa rápido

- `src/App.tsx` — Layout (raíz con altura = `visualViewport.height`, ver "Teclado"), rutas.
- `src/pages/Agenda.tsx` — calendario vertical con scroll infinito, filtro por doctor, formulario de citas (Autocomplete sobre la base).
- `src/lib/` — `api.ts` (fetch + auth + x-empresa-id), `auth.ts` (Amplify + sesión de huella con auto-refresh), `demoStore.ts` (stores con caché + API), `configApi.ts` (config por empresa en caché), `roles.ts` (catálogo de roles/permisos), `modules.ts`, `labels.ts`.
- `src/hooks/useKeyboardOffset.ts` — `useViewportHeight()` y `useKeyboardOffset()` para teclado móvil.
- `e2e/` — specs Playwright; `helpers.ts` tiene login y utilidades.

## Convenciones

- **Verificar en navegador antes de desplegar**: dev server + `E2E_BASE_URL=<dev>`; después re-corre el MISMO spec contra producción. La suite por defecto apunta al deploy: un verde antes del deploy solo prueba el código viejo.
- **Poner `data-testid`** en contenedores cuyo orden/comportamiento haya que probar (selectores de texto no prueban orden ni conteos).
- **Tests E2E con datos únicos por corrida** (`${ts}` de `helpers.ts`): cada corrida crea registros reales; nombres únicos evitan que flujos con "coincidencias" se ensucien entre corridas. Un test no debe depender de datos creados por otro test.
- **Orden de deploys**: si cambió el contrato API, backend primero (`../backend`), frontend después.
- **El teclado móvil**: el Layout se dimensiona a `visualViewport.height`; el meta `interactive-widget=resizes-content` y `display: standalone` son parte del fix, no quitarlos. Un padding por offset solo no basta cuando el teclado se superpone.
- **Playwright**: `count()` antes que `isEnabled()`/`isVisible()` en bucles de pasos (los boolean queries esperan elementos ausentes y se comen el timeout). Tras un clic, esperar a que el sistema quede en reposo antes del siguiente clic.
- **Nada de secretos en git**: las claves llegan por entorno/parámetros de stack (ver `../backend/docs/guia.md`).

- **Google Calendar** (`Settings` → pestaña "Google Calendar"): genera el enlace ICS por empresa (`GET /calendar/ics` del backend) y muestra los pasos para suscribirse "desde URL" en Google. La URL se arma con `BASE_URL` + `/ics/<empresaId>/<token>.ics` (BASE_URL ya incluye /api/v1).

- **WhatsApp** (`Settings` → pestaña "WhatsApp")  - "¿Cuándo se mandan?": lista de recordatorios (varios), cada uno con días/horas de anticipación, ventana horaria y mensaje propio; se agregan/quitan desde la misma tarjeta.
  - "Mi número": cada usuario conecta su propio número (`GET/POST /whatsapp/mi-cuenta`); los recordatorios de sus citas salen desde ahí.
: conexión de WhatsApp Business (Phone Number ID + token de Meta + plantilla aprobada), plantilla del recordatorio con variables y vista previa, y horario de envíos (días antes + ventana horaria). Guarda en `CFG#whatsapp`; el envío de prueba va a `POST /whatsapp/test`.

- **Módulo Usuarios** (antes "Doctor"): rutas `/usuarios` (`/doctor` redirige), entidad `usuarios` (USR#). El doctor de la cita es un **usuario con rol doctor/médico** (`usuariosQueAtienden()` en `lib/demoStore.ts`); los campos personalizados migran de la config `custom-fields-doctor` a `custom-fields-usuarios`.
- **Agenda**: color sutil y estable por doctor (`lib/doctorColor.ts`, hash del nombre); formulario con duración (15-120 min) y ubicación del catálogo `CFG#ubicaciones` (admin en Configuración > Operativo); aviso en vivo de choque de horario/día bloqueado (lectura de FormData en `onInput`, sin inputs controlados); "Bloquear día" crea `bloqueos` (BLOQ#) y las vistas marcan el día.

- **Tablas** (`DataTable`): barra de filtros campo+valor+botón (datalist de columnas filtrables; input date si el campo es fecha) y menú "Acciones" con Descargar seleccionados (CSV) y Eliminar seleccionados; selección activa en todas las tablas (`selectable` por defecto). La agenda acepta deep-link `?view=dia&fecha=YYYY-MM-DD` (las push del admin abren el día de la cita).

## Decisiones (por qué está así)

- **Altura de Layout = visualViewport.height** (`App.tsx`): el teclado en la app instalada se superponía y tapaba el input; dimensionar el layout al área visible lo resuelve en todos los modos (resizes-visual, resizes-content). Hay E2E que simulan el teclado encogiendo el viewport visual.
- **PWA instalable**: el manifest DEBE apuntar a PNGs reales (`public/icon-192.png`, `icon-512.png`); si los iconos devuelven HTML (fallback SPA) Chrome no ofrece instalar. `Page.getInstallabilityErrors` (CDP) es la verificación.
- **`roles.ts` tolera config corrupto** (`coerce`): un `CFG#roles` guardado como string JSON rompió el Sidebar en producción (pantalla negra al cambiar de empresa). Regla: todo lo que lea config debe degradar a defaults, nunca a crash.
- **Sesión de huella con auto-refresh** (`auth.ts`): guarda id/access/refresh token y se refresca antes de expirar. Antes guardaba un idToken estático que expiraba en 1h y TODO la app empezaba a dar 401 (calendario vacío, "No pude contactar al agente").
- **Cita sin paciente existente**: el formulario crea el paciente automáticamente marcado `pendienteCompletar`; en Pacientes aparece como "Paciente nuevo" y los incompletos se ordenan arriba (`Cliente.tsx`).
- **Vista semanal vertical tipo Outlook** con scroll infinito en ambos sentidos; al insertar días arriba se compensa `scrollTop` con `useLayoutEffect` + busy ref (`Agenda.tsx`).

## Deploy

`npm run deploy` → build, `aws s3 sync dist/ s3://katt-frontend-dev-179241536654 --delete`, invalidación de CloudFront `E3M6J4KO6U7D8G`. Los E2E contra producción son la verificación final.

## Pendiente conocido

- Los E2E crean datos de prueba en la base (pacientes/citas con nombres únicos por corrida); limpiarlos con `../backend/scripts/fix-*-data.py` cuando ensucien.
