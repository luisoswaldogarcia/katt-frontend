# Technology Stack - Katt Frontend

## Core Technologies
| Technology | Version | Purpose |
|---|---|---|
| React | ^19.2.7 | UI framework |
| TypeScript | ~6.0.2 | Type safety |
| Vite | ^8.1.1 | Build tool + dev server |
| Tailwind CSS | ^4.3.2 | Utility-first styling |
| React Router DOM | ^7.18.1 | Client-side routing |
| @hello-pangea/dnd | ^18.0.1 | Drag and drop (Kanban board) |
| vite-plugin-pwa | ^1.3.0 | PWA support (service worker, manifest) |
| workbox-window | ^7.4.1 | Service worker registration |

## Dev Dependencies
| Tool | Version | Purpose |
|---|---|---|
| @vitejs/plugin-react | ^6.0.3 | React Fast Refresh (Oxc-based) |
| @tailwindcss/vite | ^4.3.2 | Tailwind CSS Vite integration |
| oxlint | ^1.71.0 | Linting (replaces ESLint) |
| @types/node | ^24.13.2 | Node.js type definitions |

## Development Commands
```bash
npm run dev      # Start dev server with --host (network accessible)
npm run build    # TypeScript check + Vite production build
npm run lint     # Run oxlint
npm run preview  # Preview production build locally
```

## Build Configuration
- **Vite plugins**: react (Oxc), tailwindcss, VitePWA (autoUpdate)
- **PWA manifest**: name "Katt - Asistente Virtual", purple theme (#7c3aed), dark background (#0f0a1a), standalone display
- **TypeScript**: Strict mode, ES modules, project references (app + node configs)
- **Linting**: Oxlint with react + typescript + oxc plugins

## Design System
- **Color palette**: Custom `katt-*` color scale (purple-based) used via Tailwind classes
- **Theme**: Dark mode default, light mode toggle, uses `dark:` Tailwind variants
- **Layout**: `h-dvh` full viewport, flex-based sidebar + main content
- **Responsive**: Mobile-first, sidebar overlay on mobile

## Data Persistence (Current)
- `localStorage` for: theme preference, label preset, custom field definitions, module visibility, kanban config, inventory categories, unread messages
- In-memory arrays for demo entity data (patients, doctors, inventory)
- No backend API integration yet

### localStorage Keys
All localStorage keys use `katt-` prefix:
- `katt-theme` — dark/light
- `katt-preset` — salud/negocio
- `katt-modules` — module visibility toggles
- `katt-custom-fields-{module}` — custom field definitions
- `katt-kanban-columnas` — kanban board column names
- `katt-kanban-tipos` — task type definitions with custom fields
- `katt-tareas-tabla-columnas` — visible columns in tasks table view
- `katt-inventario-categorias` — inventory category list
- `katt-unread-count` — unread notification count
