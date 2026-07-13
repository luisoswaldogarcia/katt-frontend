# Katt - Development Guidelines

## Code Style & Formatting

### Component Declaration
- **Named exports** for shared components: `export function ComponentName()`
- **Default exports** for page components: `export default function PageName()`
- Functional components only — no class components
- Props defined via TypeScript `interface Props {}` directly above the component

### CSS Class Constants
Reusable Tailwind class strings are defined as `const` at module top level:
```tsx
const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
```
These are NOT extracted to a shared file — each component defines its own class constants locally.

### Naming Conventions
- Components: PascalCase (`DataTable`, `DynamicFields`)
- Files: PascalCase for components/pages (`DataTable.tsx`, `Settings.tsx`)
- Lib files: camelCase (`demoStore.ts`, `customFields.ts`)
- Hooks: camelCase with `use` prefix (`useTheme.ts`)
- State variables: camelCase, Spanish for domain terms (`categorias`, `nombre`, `tipoId`)
- Handler functions: `handle` prefix (`handleCreate`, `handleUpload`, `handleDelete`)

### TypeScript Patterns
- Use `type` imports: `import type { Module } from '../lib/customFields'`
- Interfaces for component props, types for data models
- `Record<string, unknown>` for generic data rows
- Type assertions used sparingly: `row.id as number`
- Union types for tabs/modes: `type Tab = 'usuario' | 'sistema' | 'operativo'`

## Architectural Patterns

### State Management
- **No external state library** — React `useState` + localStorage
- State initialized with lazy initializers: `useState(() => getDocuments(module, entityId))`
- Lib functions handle persistence, components handle UI state
- Pattern: mutate via lib function → set local state with returned value:
```tsx
const updated = saveDocument(module, entityId, payload)
setDocs(updated)
```

### Data Layer Pattern
- `lib/` files export pure CRUD functions that read/write localStorage
- Functions return updated data after mutations (for state sync)
- `demoStore.ts` provides generic store with pagination (`PageResult<T>`)
- No async API calls — all data is synchronous localStorage

### Component Composition
- Pages compose shared components (`DataTable`, `DataForm`, `Documents`, `DynamicFields`)
- Sub-components defined in same file when tightly coupled (e.g., `DocItem` inside `Documents.tsx`)
- Props drilling preferred over context for component communication

### Routing Pattern
- Flat route structure in `App.tsx`
- Module routes follow: `/{module}` (list), `/{module}/alta` (create), `/{module}/editar/:id` (edit), `/{module}/:id` (detail)
- Same component handles create/edit via presence of `:id` param

### Modal Pattern
- Inline modals with overlay: `fixed inset-0 bg-black/40 z-50`
- Stop propagation on modal content: `onClick={e => e.stopPropagation()}`
- Toggle via boolean state: `showCreate`, `showFieldForm`

## UI Patterns

### Tailwind Usage
- Dark mode via `dark:` variant (class-based)
- Custom `katt-*` color palette (purple tones: 50-950)
- Responsive: mobile-first, `md:` breakpoint for desktop layouts
- Glassmorphism: `bg-white/40 dark:bg-katt-900/40 backdrop-blur-xl`
- Transitions: `transition-colors` on interactive elements
- Inline SVG icons (no icon library)

### Form Patterns
- Controlled inputs with `useState`
- Validation via early return: `if (!tipoId || !nombre.trim()) return`
- `onKeyDown` Enter handling for quick-add inputs
- Select elements with empty-value placeholder: `<option value="">Seleccionar...</option>`

### List/Table Patterns
- Infinite scroll via `onScroll` + threshold detection
- Client-side filtering and sorting
- FAB (Floating Action Button) for primary action
- Empty states: `<p className="text-xs text-gray-400">Sin documentos aún</p>`

### Responsive Design
- `h-dvh` for full viewport height
- `overflow-hidden` on parent, `overflow-y-auto` on scrollable children
- Hidden columns on mobile: `hidden md:table-cell`
- Sidebar: off-canvas on mobile, collapsible on desktop

## Language & Localization
- UI text in Spanish throughout
- Domain terms use Spanish: `paciente`, `empresa`, `inventario`, `citas`
- Labels are configurable via `lib/labels.ts` (user can rename modules)
- No i18n library — hardcoded Spanish strings

## File Organization Rules
- One exported component per file in `components/`
- Pages are self-contained single-file components
- Lib files group related CRUD operations (one file per domain)
- No barrel files (`index.ts`) — direct imports only
- Relative imports with `../` paths (no path aliases)
