# Development Guidelines - Katt Frontend

## Code Quality Standards

### File Organization
- Pages are self-contained single-file components (Vue-style philosophy) — all state, handlers, sub-components, and markup in one `.tsx` file
- Shared components go in `src/components/` as named exports
- Pages use default exports: `export default function PageName()`
- Helper functions (beep, utility sub-components) are defined at the bottom of the same file they're used in

### Naming Conventions
- **Files**: PascalCase for components/pages (`PuntoVenta.tsx`, `DynamicFields.tsx`)
- **Functions/Components**: PascalCase for components, camelCase for handlers and utilities
- **Handlers**: Prefixed with `handle` — `handleAgregar`, `handleCobrar`, `handleCantidad`
- **State variables**: camelCase, descriptive Spanish names — `busqueda`, `carrito`, `ventaExitosa`
- **CSS class constants**: camelCase at file top — `cardClass`, `inputClass`, `btnPrimary`
- **Interfaces**: PascalCase, no `I` prefix — `Props`, `SidebarProps`, `EntityConfig`
- **Types**: Use `type` keyword for unions/aliases, `interface` for object shapes

### Language
- All UI text, labels, variable names, and comments are in **Spanish**
- Type definitions and technical terms remain in English

## Structural Patterns

### Reusable CSS Class Constants (5/5 files)
Define Tailwind class strings as constants at the top of each file:
```tsx
const cardClass = "rounded-xl border border-katt-200 dark:border-katt-800 bg-white dark:bg-katt-900/50 p-4 space-y-3"
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
const btnPrimary = "px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors"
```

### Custom Color Palette (5/5 files)
Uses `katt-*` custom Tailwind colors throughout (katt-50 through katt-950). Always provide dark mode variants:
```tsx
className="bg-katt-100 dark:bg-katt-800 text-katt-600 dark:text-katt-300"
```

### Modal Pattern (3/5 files)
Modals use a consistent structure:
```tsx
<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
  <div onClick={e => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-katt-900 rounded-xl p-5 space-y-4 border border-katt-200 dark:border-katt-800">
    {/* content */}
  </div>
</div>
```

### Inline SVG Icons (5/5 files)
All icons are inline SVGs (no icon library). Standard pattern:
```tsx
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
  <path d="..." />
</svg>
```

### State Management (5/5 files)
- React `useState` for all local state — no external state library
- `localStorage` for persistence via lib/ helper functions (get/save pattern)
- Demo stores in `demoStore.ts` with consistent CRUD API

### Navigation Pattern
- `react-router-dom` NavLink with active state styling via render prop:
```tsx
<NavLink to="/path" className={({ isActive }) =>
  `base-classes ${isActive ? 'active-classes' : 'inactive-classes'}`
}>
```

### Conditional Module Rendering (Sidebar)
Modules are conditionally rendered based on `getModules()` config:
```tsx
{modules.agente && <NavLink to="/agente">...</NavLink>}
```

### Form Handling
- Controlled inputs with `useState`
- `onKeyDown` with `e.key === 'Enter'` for keyboard submission
- `e.preventDefault()` to prevent form submission on Enter

### Tab Pattern
Tabs use a type union and conditional rendering:
```tsx
type Tab = 'usuario' | 'sistema' | 'operativo'
const [tab, setTab] = useState<Tab>('usuario')
// ...
{tab === 'usuario' && (<div>...</div>)}
```

## Component API Patterns

### Props Interface
Components define a `Props` or descriptive interface:
```tsx
interface Props {
  fields: CustomField[]
  values: Record<string, unknown>
  onChange: (id: string, value: unknown) => void
}
```

### Callback Props
- `onClose`, `onChange`, `onLogin`, `onLogout`, `onDetected`, `onCobrar`, `onAsignar`
- Always prefixed with `on`

### Layout Pattern
- Root: `flex h-dvh overflow-hidden`
- Content area: `flex-1 overflow-hidden` with inner scroll
- Pages: `h-full overflow-y-auto p-4 space-y-4`

## Responsive Design

### Mobile-First with Breakpoints
- Default styles target mobile
- `md:` prefix for tablet/desktop overrides
- `hiddenOn` property in DataTable columns for responsive column hiding

### Sidebar Behavior
- Mobile: overlay with backdrop, slide-in animation
- Desktop: relative positioned, togglable via translate

## Anti-Patterns to Avoid
- Do NOT create separate CSS/style files — use Tailwind utilities inline or as constants
- Do NOT use external state management (Redux, Zustand, etc.)
- Do NOT use icon libraries — use inline SVGs
- Do NOT split page logic into multiple files — keep pages self-contained
- Do NOT use English for UI-facing text
