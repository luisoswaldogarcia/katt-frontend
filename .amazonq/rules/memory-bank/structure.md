# Project Structure - Katt Frontend

## Directory Layout
```
frontend/
├── public/                  # Static assets (favicons, icons, avatar)
├── src/
│   ├── assets/              # Bundled assets
│   ├── components/          # Shared reusable components
│   │   ├── ConfirmModal.tsx # Confirmation dialog (delete actions)
│   │   ├── DataDetail.tsx   # Generic entity detail view
│   │   ├── DataForm.tsx     # Generic entity form (create/edit)
│   │   ├── DataTable.tsx    # Generic entity table/list
│   │   ├── DynamicFields.tsx# Renders custom fields dynamically
│   │   ├── FilterBar.tsx    # Search/filter bar for lists
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── ThemeToggle.tsx  # Dark/light mode switch
│   ├── hooks/
│   │   └── useTheme.ts     # Theme state management hook
│   ├── lib/
│   │   ├── categorias.ts   # Inventory categories CRUD (localStorage)
│   │   ├── customFields.ts # Custom fields CRUD + types (localStorage)
│   │   ├── demoStore.ts    # In-memory data store for demo mode
│   │   ├── kanban.ts       # Kanban columns, task types, table config (localStorage)
│   │   ├── labels.ts       # Configurable label presets (salud/negocio)
│   │   ├── modules.ts      # Module visibility toggle config (localStorage)
│   │   └── unreadMessages.ts # Unread message count (localStorage)
│   ├── pages/
│   │   ├── Agenda.tsx      # Calendar/scheduling page
│   │   ├── Agente.tsx      # AI agent page
│   │   ├── Chat.tsx        # Chat interface page
│   │   ├── Doctor.tsx      # Doctor/company list page
│   │   ├── DoctorAlta.tsx  # Doctor create/edit page
│   │   ├── DoctorDetalle.tsx # Doctor detail page
│   │   ├── Home.tsx        # Dashboard/home page
│   │   ├── Inventario.tsx  # Inventory list page
│   │   ├── InventarioAlta.tsx # Inventory create/edit page
│   │   ├── InventarioDetalle.tsx # Inventory detail page
│   │   ├── InventarioMovimiento.tsx # Inventory stock movement page
│   │   ├── Paciente.tsx    # Patient/client list page
│   │   ├── PacienteAlta.tsx# Patient create/edit page
│   │   ├── PacienteCitas.tsx # Patient appointment scheduling page
│   │   ├── PacienteDetalle.tsx # Patient detail page
│   │   ├── Settings.tsx    # App settings page
│   │   ├── Tablero.tsx     # Kanban board page (drag & drop)
│   │   └── TareasLista.tsx # Tasks list/table view page
│   ├── App.tsx             # Router + Layout (sidebar + header + routes)
│   ├── index.css           # Global styles (Tailwind imports)
│   └── main.tsx            # Entry point (React DOM render)
├── .oxlintrc.json          # Oxlint configuration
├── index.html              # HTML shell
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript base config
├── tsconfig.app.json       # App-specific TS config
├── tsconfig.node.json      # Node/Vite TS config
└── vite.config.ts          # Vite + plugins configuration
```

## Architectural Patterns

### Single-File Page Components (Vue-style)
Each page in `/src/pages/` is self-contained with its own logic, markup, and inline styles via Tailwind classes.

### Generic Data Components
`DataTable`, `DataForm`, `DataDetail` are generic components that receive configuration props to render CRUD views for any entity (patient, doctor, inventory), avoiding duplication.

### Routing
React Router v7 with flat route structure in `App.tsx`. Layout component wraps all routes with sidebar + header + notification bell.

### State Management
- No external state library — local component state with `useState`
- Demo data in module-level variables (`demoStore.ts`)
- Settings persisted in `localStorage`

### Label Abstraction
The `labels.ts` module provides configurable terminology so the same UI works for healthcare ("Paciente"/"Doctor") or business ("Cliente"/"Empresa") contexts. Also includes labels for `inventario`, `tablero`, and `tareas`.

### Module Visibility
The `modules.ts` lib allows toggling which modules are visible in the sidebar via Settings, persisted in localStorage.
