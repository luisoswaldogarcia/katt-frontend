# Katt - Project Structure

## Directory Layout
```
frontend/
├── .amazonq/rules/memory-bank/  # Project documentation
├── .katt/                       # Project context & branding assets
├── public/                      # Static assets (favicon, icons, avatar)
├── src/
│   ├── assets/                  # Bundled assets
│   ├── components/              # Shared reusable components
│   │   ├── ConfirmModal.tsx     # Confirmation dialog
│   │   ├── DataDetail.tsx       # Generic entity detail view
│   │   ├── DataForm.tsx         # Generic entity form
│   │   ├── DataTable.tsx        # Generic data table with filtering
│   │   ├── Documents.tsx        # Document management with OCR
│   │   ├── DynamicFields.tsx    # Custom field renderer
│   │   ├── EntityAlta.tsx       # Generic create/edit page (uses entityConfig)
│   │   ├── FilterBar.tsx        # Search/filter controls
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── ThemeToggle.tsx      # Dark/light mode switch
│   ├── hooks/
│   │   └── useTheme.ts          # Theme management hook
│   ├── lib/                     # Business logic & data layer
│   │   ├── categorias.ts        # Category management
│   │   ├── customFields.ts      # Dynamic field definitions
│   │   ├── demoStore.ts         # In-memory data store with generated seed data
│   │   ├── documents.ts         # Document CRUD operations
│   │   ├── entityConfig.ts      # Centralized entity config (columns, fields, store, paths)
│   │   ├── kanban.ts            # Kanban board logic
│   │   ├── labels.ts            # Label/tag management
│   │   ├── moduleCatalog.ts     # Module pricing catalog
│   │   ├── modules.ts           # Module enable/disable config + moduleLabels
│   │   ├── pos.ts               # Point of sale logic
│   │   └── unreadMessages.ts    # Chat unread tracking
│   ├── pages/                   # Route-level page components
│   │   ├── Agenda.tsx
│   │   ├── Agente.tsx
│   │   ├── Chat.tsx
│   │   ├── Empresa.tsx / EmpresaAlta.tsx / EmpresaDetalle.tsx
│   │   ├── Home.tsx
│   │   ├── Inventario.tsx / InventarioAlta.tsx / InventarioCarga.tsx / InventarioDetalle.tsx / InventarioImagenes.tsx / InventarioMovimiento.tsx
│   │   ├── Modulos.tsx
│   │   ├── Paciente.tsx / PacienteAlta.tsx / PacienteCitas.tsx / PacienteDetalle.tsx
│   │   ├── PuntoVenta.tsx
│   │   ├── Settings.tsx
│   │   ├── Tablero.tsx
│   │   ├── TareasLista.tsx
│   │   ├── TiposDocumento.tsx
│   │   ├── Usuario.tsx / UsuarioAlta.tsx / UsuarioDetalle.tsx
│   │   └── ...
│   ├── App.tsx                  # Router & layout shell
│   ├── index.css                # Global styles (Tailwind)
│   └── main.tsx                 # Entry point
├── package.json
├── vite.config.ts               # Vite + React + Tailwind + PWA config
├── tsconfig.json                # TypeScript project references
└── .oxlintrc.json               # Linter configuration
```

## Architectural Patterns

### Entity Config System (`lib/entityConfig.ts`)
Centralized configuration for CRUD entities. Each entity defines:
- `columns` — DataTable column definitions
- `fields` — DataForm field definitions
- `store` — reference to the demoStore CRUD methods
- `basePath` / `altaPath` — routing paths
- `module` — module key for custom fields

Adding a new CRUD entity requires only:
1. Add entry to `entityConfigs` in `lib/entityConfig.ts`
2. Create a ~5-line page file using `<EntityAlta entity="key" />`
3. Create a list page using the config's columns/store

### Generic CRUD Components
- `EntityAlta` — generic create/edit wrapper that reads entityConfig and renders DataForm
- `DataTable` — paginated table with filtering, sorting, selection, FAB menu
- `DataForm` — form with photo upload, custom fields, cancel/submit
- `DataDetail` — detail view with custom fields and edit/delete actions

### Single-File Page Components (Vue-style)
Each page in `/src/pages/` is self-contained with its own logic, markup, and local state. Pages follow CRUD patterns: List → Alta (create) → Detalle (detail/edit).

### Seed Data Generation (`demoStore.ts`)
Demo data is generated programmatically using loops and arrays of names/apellidos rather than hardcoded entries. This keeps the file compact while providing 100+ realistic records.

### Shared Constants (`lib/modules.ts`)
`moduleLabels` is exported from `lib/modules.ts` and shared across pages that need module display names (EmpresaDetalle, UsuarioDetalle, Sidebar, etc.).

### localStorage Data Layer
All data persistence uses localStorage via utility functions in `/src/lib/`. The `demoStore.ts` provides a generic store pattern. No backend API — fully client-side.

### Module System
Companies can enable/disable modules. The module configuration drives sidebar navigation and feature availability.

### Routing
React Router DOM v7 with route-based code organization. Routes map directly to page components.
