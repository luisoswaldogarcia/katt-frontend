# Project Structure - Katt Frontend

## Directory Layout
```
frontend/
├── public/                  # Static assets (favicons, icons, SVGs)
├── src/
│   ├── assets/              # Bundled assets
│   ├── components/          # Shared reusable components
│   │   ├── ConfirmModal.tsx
│   │   ├── DataDetail.tsx   # Generic entity detail view
│   │   ├── DataForm.tsx     # Generic entity form (create/edit)
│   │   ├── DataTable.tsx    # Generic paginated data table
│   │   ├── Documents.tsx    # Document management component
│   │   ├── DynamicFields.tsx # Runtime-configurable fields
│   │   ├── EntityAlta.tsx   # Generic entity creation page
│   │   ├── FilterBar.tsx    # Table filtering UI
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── ThemeToggle.tsx  # Dark/light mode switch
│   ├── hooks/
│   │   └── useTheme.ts     # Theme management hook
│   ├── lib/                 # Business logic, stores, utilities
│   │   ├── auth.ts          # Authentication logic
│   │   ├── categorias.ts    # Category management
│   │   ├── compras.ts       # Purchase logic
│   │   ├── customFields.ts  # Dynamic field definitions
│   │   ├── demoStore.ts     # In-memory demo data stores
│   │   ├── documents.ts     # Document handling
│   │   ├── entityConfig.ts  # Entity column/field/store config
│   │   ├── kanban.ts        # Kanban board logic
│   │   ├── labels.ts        # UI label configuration
│   │   ├── moduleCatalog.ts # Available module definitions
│   │   ├── modules.ts       # Module enable/disable per empresa
│   │   ├── pos.ts           # Point of sale logic
│   │   └── unreadMessages.ts # Unread message tracking
│   ├── pages/               # Route-level page components (single-file)
│   │   ├── Home.tsx, Login.tsx, Settings.tsx
│   │   ├── Cliente*.tsx     # Client CRUD pages
│   │   ├── Empresa*.tsx     # Company CRUD pages
│   │   ├── Inventario*.tsx  # Inventory CRUD pages
│   │   ├── Usuario*.tsx     # User CRUD pages
│   │   ├── PuntoVenta.tsx   # POS page
│   │   ├── Compras.tsx      # Purchases page
│   │   ├── Agenda.tsx, Chat.tsx, Agente.tsx
│   │   ├── Tablero.tsx, TareasLista.tsx
│   │   └── Modulos.tsx, TiposDocumento.tsx
│   ├── App.tsx              # Router and layout
│   ├── index.css            # Global styles (Tailwind)
│   └── main.tsx             # Entry point
├── package.json
├── vite.config.ts           # Vite + React + Tailwind + PWA + SSL
├── tsconfig.json            # TypeScript project references
└── .oxlintrc.json           # Linter configuration
```

## Architectural Patterns

### Single-File Page Philosophy (Vue-style)
Each page in `/src/pages/` is self-contained with its own state, logic, and markup in a single `.tsx` file. No separate style files or logic modules per page.

### Generic Entity System
The app uses a configuration-driven entity system:
- `entityConfig.ts` defines columns, form fields, and store references per entity
- `DataTable`, `DataForm`, `DataDetail`, `EntityAlta` are generic components that render based on config
- This allows adding new entities with minimal code

### Demo Store Pattern
All data is managed via in-memory stores in `demoStore.ts` with a consistent API:
- `getPage(page)` → paginated data
- `getById(id)` → single record
- `create(data)`, `update(id, data)`, `remove(id)`

### Module System
Empresas can enable/disable modules. The sidebar and routing respect module visibility via `getModules()`.

### Component Relationships
```
App.tsx (Router)
├── Sidebar (navigation, module-aware)
├── Pages (self-contained, use lib/ stores)
│   └── Use shared components (DataTable, DataForm, etc.)
└── lib/ (stores, configs, utilities)
```
