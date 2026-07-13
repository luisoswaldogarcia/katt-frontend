# Project Structure - Katt Frontend

## Directory Layout
```
frontend/
├── public/                  # Static assets (favicons, icons, avatar)
├── src/
│   ├── assets/              # Bundled assets
│   ├── components/          # Shared reusable components
│   │   ├── ConfirmModal.tsx
│   │   ├── DataDetail.tsx
│   │   ├── DataForm.tsx
│   │   ├── DataTable.tsx
│   │   ├── DynamicFields.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Sidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── useTheme.ts
│   ├── lib/                 # Utilities, configs, data stores
│   │   ├── categorias.ts
│   │   ├── customFields.ts
│   │   ├── demoStore.ts
│   │   ├── kanban.ts
│   │   ├── labels.ts
│   │   ├── modules.ts
│   │   └── unreadMessages.ts
│   ├── pages/               # Page-level components (single-file philosophy)
│   │   ├── Agenda.tsx
│   │   ├── Agente.tsx
│   │   ├── Chat.tsx
│   │   ├── Doctor.tsx / DoctorAlta.tsx / DoctorDetalle.tsx
│   │   ├── Home.tsx
│   │   ├── Inventario.tsx / InventarioAlta.tsx / InventarioDetalle.tsx / InventarioMovimiento.tsx
│   │   ├── Paciente.tsx / PacienteAlta.tsx / PacienteCitas.tsx / PacienteDetalle.tsx
│   │   ├── Settings.tsx
│   │   ├── Tablero.tsx
│   │   └── TareasLista.tsx
│   ├── App.tsx              # Main router and layout
│   ├── index.css            # Global styles (Tailwind)
│   └── main.tsx             # Entry point
├── index.html               # HTML shell
├── package.json
├── vite.config.ts           # Vite + PWA + Tailwind config
├── tsconfig.json            # TypeScript config
└── .oxlintrc.json           # Linter config
```

## Architectural Patterns
- **Single-file page components**: Each page contains its own state, logic, and markup (Vue-like philosophy)
- **Shared components**: Generic reusable UI components in `/src/components/`
- **localStorage-based persistence**: Data stored via `demoStore.ts` and module configs
- **Module system**: Features toggled on/off via `lib/modules.ts` with localStorage
- **Client-side routing**: React Router DOM v7 with route-based code organization
- **No backend**: Currently a frontend-only demo app with local storage

## Core Relationships
- `App.tsx` → defines all routes, renders `Sidebar` + page components
- `Sidebar.tsx` → navigation, reads module config to show/hide links
- Pages use shared components (`DataTable`, `DataForm`, `DataDetail`, `DynamicFields`)
- `lib/demoStore.ts` → central localStorage CRUD for entities
- `lib/modules.ts` → module enable/disable config
