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
│   │   ├── FilterBar.tsx        # Search/filter controls
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── ThemeToggle.tsx      # Dark/light mode switch
│   ├── hooks/
│   │   └── useTheme.ts          # Theme management hook
│   ├── lib/                     # Business logic & data layer
│   │   ├── categorias.ts        # Category management
│   │   ├── customFields.ts      # Dynamic field definitions
│   │   ├── demoStore.ts         # localStorage-based data store
│   │   ├── documents.ts         # Document CRUD operations
│   │   ├── kanban.ts            # Kanban board logic
│   │   ├── labels.ts            # Label/tag management
│   │   ├── moduleCatalog.ts     # Module pricing catalog
│   │   ├── modules.ts           # Module enable/disable config
│   │   ├── pos.ts               # Point of sale logic
│   │   └── unreadMessages.ts    # Chat unread tracking
│   ├── pages/                   # Route-level page components
│   │   ├── Agenda.tsx
│   │   ├── Agente.tsx
│   │   ├── Chat.tsx
│   │   ├── Empresa.tsx / EmpresaAlta.tsx / EmpresaDetalle.tsx
│   │   ├── Home.tsx
│   │   ├── Inventario.tsx / InventarioAlta.tsx / InventarioCarga.tsx / InventarioDetalle.tsx / InventarioMovimiento.tsx
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

### Single-File Page Components (Vue-style)
Each page in `/src/pages/` is self-contained with its own logic, markup, and local state. Pages follow CRUD patterns: List → Alta (create) → Detalle (detail/edit).

### Generic Data Components
Shared components like `DataTable`, `DataForm`, `DataDetail` provide reusable CRUD UI that pages configure via props.

### localStorage Data Layer
All data persistence uses localStorage via utility functions in `/src/lib/`. The `demoStore.ts` provides a generic store pattern. No backend API — fully client-side.

### Module System
Companies can enable/disable modules. The module configuration drives sidebar navigation and feature availability.

### Routing
React Router DOM v7 with route-based code organization. Routes map directly to page components.
