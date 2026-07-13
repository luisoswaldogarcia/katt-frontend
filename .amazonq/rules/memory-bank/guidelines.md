# Development Guidelines - Katt Frontend

## Code Quality Standards

### Naming Conventions
- **Components**: PascalCase, default export for pages (`export default function Agenda()`), named export for shared components (`export function Sidebar()`)
- **Files**: PascalCase for components/pages (e.g., `DynamicFields.tsx`, `PacienteAlta.tsx`), camelCase for utilities (e.g., `demoStore.ts`, `customFields.ts`)
- **Variables/functions**: camelCase (`handleCreate`, `formatDate`, `getModules`)
- **Types/Interfaces**: PascalCase (`ModuleConfig`, `CitaData`, `CustomField`)
- **Constants**: camelCase for objects/arrays (`inputClass`, `moduleOptions`), UPPER_SNAKE_CASE for primitive constants (`DAY_NAMES`, `STORAGE_KEY`)
- **CSS class variables**: camelCase strings stored as `const` at module level (`cardClass`, `btnPrimary`, `inputClass`)

### TypeScript Patterns
- Use `type` imports: `import type { CustomField } from '../lib/customFields'`
- Prefer union types for state variants: `type View = 'dia' | 'semana' | 'mes'`
- Use `Record<string, T>` for dynamic key maps
- Interface for component props with explicit typing:
```tsx
interface Props {
  fields: CustomField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
}
```

## Structural Conventions

### Page Components (Single-File Philosophy)
Each page is self-contained with all logic, sub-components, and markup in one file:
```tsx
// Helper functions at top
function formatDate(d: Date): string { ... }

// Sub-components defined in same file
function DayView({ date, today, onSelect }: { ... }) { ... }

// Main page component as default export
export default function Agenda() { ... }
```

### Shared Components
- Named exports from `/src/components/`
- Props defined via interface
- Reusable CSS class constants at module level

### State Management Pattern
- `useState` for all local state (no external state library)
- `useMemo` for derived/computed data
- `forceUpdate` pattern for triggering re-renders after localStorage changes:
```tsx
const [, forceUpdate] = useState(0)
// After mutation:
forceUpdate(n => n + 1)
```

### Data Persistence Pattern
- All data stored in localStorage via utility modules in `/src/lib/`
- Pattern: `getX()` reads + parses, `saveX()` serializes + writes
```tsx
export function getModules(): ModuleConfig {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? { ...defaults, ...JSON.parse(stored) } : defaults
}
export function saveModules(modules: ModuleConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(modules))
}
```

## UI/Styling Patterns

### Tailwind CSS Classes
- Reusable class strings defined as constants at module top:
```tsx
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-3 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
```

### Custom Color Palette
- Uses `katt-*` custom color scale (purple-based): `katt-50` through `katt-950`
- Always provide dark mode variants: `bg-white dark:bg-katt-900`
- Accent color: `katt-500` / `katt-600` for interactive elements

### Dark/Light Mode
- Every element has both light and dark variants using Tailwind's `dark:` prefix
- Dark mode is the default visual design

### Modal Pattern
- Fixed overlay with `bg-black/40` backdrop
- Click overlay to close, `stopPropagation` on modal content
- Consistent structure:
```tsx
<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
  <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
    {/* content */}
  </div>
</div>
```

### Icons
- Inline SVG icons (no icon library)
- Standard attributes: `xmlns`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`
- Size via Tailwind: `className="w-4 h-4"` or `"w-5 h-5"`

## Routing Patterns
- React Router DOM v7 with `BrowserRouter` > `Routes` > `Route`
- CRUD routes follow: `/entity`, `/entity/alta`, `/entity/editar/:id`, `/entity/:id`
- Dynamic title resolution based on `pathname` in Layout component

## Form Patterns
- Uncontrolled forms with `FormData` for simple create/edit:
```tsx
function handleCreate(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  const fd = new FormData(e.currentTarget)
  store.create({
    nombre: fd.get('nombre') as string,
    // ...
  })
}
```
- Controlled inputs for complex/dynamic forms (Settings, filters)

## Conditional Rendering for Modules
- Navigation links conditionally rendered based on module config:
```tsx
{modules.agenda && <NavLink to="/agenda" ...>Agenda</NavLink>}
```

## Language
- All UI text in Spanish
- Variable names and code in English
- Comments minimal, code is self-documenting
