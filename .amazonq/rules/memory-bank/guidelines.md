# Katt - Development Guidelines

## Code Style & Formatting

### Component Declaration
- Pages: `export default function ComponentName()` (default exports)
- Shared components: `export function ComponentName()` (named exports)
- Sub-components: plain `function Name()` declared in same file (no export)
- Interfaces for props: inline `{ prop: Type }` for sub-components, named `interface Props` for main components

### CSS Class Constants
Define reusable Tailwind class strings as `const` at module top level:
```tsx
const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
```

### Naming Conventions
- Components: PascalCase (`PuntoVenta`, `DocTypeSection`)
- Functions/handlers: camelCase with `handle` prefix (`handleSave`, `handleCobrar`)
- State variables: camelCase, Spanish names for domain concepts (`carrito`, `busqueda`, `categorias`)
- Constants: camelCase for class strings (`cardClass`, `btnPrimary`)
- Storage keys: kebab-case with `katt-` prefix (`katt-active-empresa`, `katt-module-catalog`)

## Architectural Patterns

### Single-File Page Pattern (5/5 files)
Each page is self-contained. Sub-components (modals, sections) are declared in the same file below the main export. No separate files for page-specific components.

```tsx
export default function PageName() {
  // state, handlers, render
}

function SubComponent({ prop }: { prop: Type }) {
  // local sub-component
}
```

### State Management (5/5 files)
- All state via `useState` hooks — no external state libraries
- Lazy initialization with function: `useState(() => getDocuments(module, entityId))`
- Multiple related states declared sequentially, not combined into objects
- No useReducer usage — simple setState patterns preferred

### Data Layer Pattern (5/5 files)
- Business logic in `/src/lib/` as pure functions
- Functions return updated data after mutations: `const updated = saveDocument(...); setDocs(updated)`
- localStorage as persistence layer with JSON serialization
- Store pattern: `entityStore.getAll()`, `entityStore.getById(id)`, `entityStore.update(id, data)`

### Modal Pattern (3/5 files)
```tsx
{showModal && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
      {/* content */}
    </div>
  </div>
)}
```

### Conditional Rendering for Modules (2/5 files)
```tsx
{modules.agente && <NavLink to="/agente">...</NavLink>}
```

## UI Patterns

### Dark/Light Mode (5/5 files)
Every color class includes dark variant: `text-gray-500 dark:text-gray-400`, `bg-white dark:bg-katt-900`

### Custom Color Palette
Uses `katt-` prefix for brand colors: `katt-50` through `katt-950`, `katt-500` as primary accent.

### Responsive Layout (3/5 files)
- Mobile-first with `md:` breakpoint for desktop adaptations
- `h-dvh` for full viewport height
- `overflow-y-auto` on scrollable containers
- `flex-1 min-w-0` for flexible content areas

### Inline SVG Icons (5/5 files)
All icons are inline SVG elements — no icon library. Standard pattern:
```tsx
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
  <path d="..." />
</svg>
```

### Form Patterns (4/5 files)
- Controlled inputs with `value` + `onChange`
- Enter key handling via `onKeyDown` for quick-add patterns
- `autoFocus` on primary inputs in modals/search
- Validation: simple guard clauses (`if (!nombre.trim()) return`)

## TypeScript Patterns

### Type Imports
```tsx
import type { Module } from '../lib/customFields'
import type { DocumentItem } from '../lib/documents'
```

### Omit for Partial Types
```tsx
function handleSave(doc: Omit<DocumentItem, 'id' | 'fecha'>) { ... }
```

### Inline Type Annotations for Sub-component Props
```tsx
function DocItem({ doc, onDelete }: { doc: DocumentItem; onDelete: () => void }) { ... }
```

## Anti-Patterns to Avoid
- Do NOT use external state management (Redux, Zustand, etc.)
- Do NOT create separate files for page-specific sub-components
- Do NOT use icon libraries — use inline SVGs
- Do NOT use CSS modules or styled-components — use Tailwind utility classes
- Do NOT use English for UI text — all user-facing text is in Spanish
- Do NOT use `useEffect` for derived state — compute inline or use lazy `useState`
