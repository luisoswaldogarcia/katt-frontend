# Katt - Project Structure

## Directory Layout
```
frontend/
├── public/              # Static assets (favicon, icons, avatar)
├── src/
│   ├── assets/          # Bundled assets
│   ├── components/      # Shared reusable components
│   │   ├── ConfirmModal.tsx    # Confirmation dialog
│   │   ├── DataDetail.tsx      # Generic entity detail view
│   │   ├── DataForm.tsx        # Generic entity form
│   │   ├── DataTable.tsx       # Generic data table with filtering
│   │   ├── Documents.tsx       # Document management per entity
│   │   ├── DynamicFields.tsx   # Custom field renderer
│   │   ├── FilterBar.tsx       # Table filter controls
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   └── ThemeToggle.tsx     # Dark/light mode switch
│   ├── hooks/
│   │   └── useTheme.ts         # Theme management hook
│   ├── lib/                    # Business logic & utilities
│   │   ├── categorias.ts       # Category management
│   │   ├── customFields.ts     # Custom field definitions
│   │   ├── demoStore.ts        # localStorage-based data store
│   │   ├── documents.ts        # Document CRUD operations
│   │   ├── kanban.ts           # Kanban board logic
│   │   ├── labels.ts           # Label/tag management
│   │   ├── moduleCatalog.ts    # Available modules catalog
│   │   ├── modules.ts          # Module enable/disable logic
│   │   └── unreadMessages.ts   # Chat unread count
│   ├── pages/                  # Page-level components (single-file philosophy)
│   │   ├── Home.tsx            # Landing/dashboard
│   │   ├── Chat.tsx            # AI chat interface
│   │   ├── Agente.tsx          # Agent configuration
│   │   ├── Settings.tsx        # App settings
│   │   ├── Modulos.tsx         # Module management
│   │   ├── Tablero.tsx         # Kanban board
│   │   ├── TareasLista.tsx     # Task list view
│   │   ├── Agenda.tsx          # Calendar/scheduling
│   │   ├── Paciente*.tsx       # Patient module pages
│   │   ├── Inventario*.tsx     # Inventory module pages
│   │   ├── Usuario*.tsx        # User module pages
│   │   └── Empresa*.tsx        # Company module pages
│   ├── App.tsx                 # Router configuration
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles (Tailwind)
├── .katt/                      # Project context docs
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Architectural Patterns

### Single-File Page Philosophy
Pages follow a Vue-inspired pattern: each page file contains its own logic, markup, and local state in a single `.tsx` file.

### Generic CRUD Components
- DataTable → DataForm (create) / DataDetail (view) pattern
- Each module (Paciente, Inventario, Usuario, Empresa) follows: List → Alta (create) → Detalle (detail)

### Data Layer
- localStorage-based demo store (`lib/demoStore.ts`)
- Module-specific logic in `lib/` files
- No backend API — fully client-side prototype

### Module System
- Modules are toggled on/off via Settings
- `lib/moduleCatalog.ts` defines available modules
- `lib/modules.ts` manages enabled state
- Sidebar dynamically shows enabled modules

### Component Relationships
```
App.tsx (Router)
├── Sidebar (navigation)
├── Pages (route-based)
│   ├── Use DataTable for lists
│   ├── Use DataForm for creation
│   ├── Use DataDetail for viewing
│   └── Use Documents, DynamicFields as sub-components
└── ThemeToggle (global)
```
