# Development Guidelines - Katt Frontend

## Code Quality Standards

### File Organization
- Pages are default exports: `export default function PageName()`
- Shared components are named exports: `export function ComponentName()`
- Hooks are named exports: `export function useHookName()`
- Lib modules export types, constants, and functions individually

### Naming Conventions
- Components/Pages: PascalCase (`DataTable`, `PacienteAlta`)
- Hooks: camelCase with `use` prefix (`useTheme`)
- Files: match their primary export name
- CSS class variables: camelCase (`inputClass`)
- Interfaces: PascalCase, no `I` prefix (`Props`, `Column`, `CustomField`)
- Type aliases: PascalCase (`FieldType`, `Theme`, `Module`)

### TypeScript Patterns
- Use `interface` for component props (always named `Props`)
- Use `type` for unions and aliases
- Import types with `import type` syntax
- Use `Record<string, unknown>` for dynamic key-value objects
- Prefer explicit return types only on lib functions, not components

## Styling Patterns

### Tailwind CSS Conventions
- Reusable class strings extracted to `const` variables:
```tsx
const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-katt-950 border border-katt-200 dark:border-katt-700 text-sm focus:outline-none focus:ring-2 focus:ring-katt-500"
```
- Always include both light and dark variants using `dark:` prefix
- Use `katt-*` custom color scale (not raw purple values)
- Standard button styles: `px-4 py-2 rounded-lg bg-katt-500 hover:bg-katt-600 text-white text-sm font-medium transition-colors`
- Always add `transition-colors` on interactive elements
- Use `space-y-*` for vertical spacing between siblings
- Page containers: `p-4 space-y-* h-full overflow-y-auto`

### Responsive Design
- Mobile-first approach
- Use `md:` breakpoint for desktop adaptations
- Sidebar: overlay on mobile, collapsible on desktop
- Tables: hide columns with `hidden md:table-cell`

## Component Patterns

### Generic Data Components (CRUD Pattern)
The app uses generic components that receive configuration to render entity views:

```tsx
// DataTable usage
<DataTable
  columns={[{ key: 'nombre', label: 'Nombre', filterable: true }]}
  data={store.getAll()}
  basePath="/paciente"
  altaPath="/paciente/alta"
/>

// DataForm usage
<DataForm
  fields={[{ key: 'nombre', label: 'Nombre', required: true }]}
  module="paciente"
  basePath="/paciente"
  onSubmit={(data, custom) => { /* save */ }}
/>
```

### State Management
- `useState` with lazy initializer for localStorage reads:
```tsx
const [theme, setTheme] = useState<Theme>(() =>
  (localStorage.getItem('katt-theme') as Theme) || 'dark'
)
```
- `useEffect` for side effects (DOM manipulation, localStorage writes)
- No external state libraries — component-local state only
- Demo store uses module-level mutable arrays with functional CRUD methods

### Modal Pattern
- Fixed overlay with `bg-black/40 z-50`
- Click overlay to close, `stopPropagation` on modal content
- Centered with `flex items-center justify-center p-4`

### Navigation
- `useNavigate()` for programmatic navigation
- `NavLink` with `isActive` render prop for active styling in sidebar
- Route params via `useParams()` for detail/edit pages

## Architectural Practices

### Label Abstraction
Always use `labels.paciente` / `labels.doctor` instead of hardcoded strings to support preset switching:
```tsx
import { labels } from '../lib/labels'
// ✓ labels.paciente
// ✗ 'Paciente'
```

### Custom Fields Integration
Forms must integrate `DynamicFields` component and pass custom values alongside standard form data:
```tsx
onSubmit: (data: Record<string, string>, custom: Record<string, unknown>) => void
```

### localStorage Keys
All localStorage keys use `katt-` prefix:
- `katt-theme` — dark/light
- `katt-preset` — salud/negocio
- `katt-custom-fields-{module}` — custom field definitions

### Icons
- Inline SVG (no icon library)
- Standard attributes: `xmlns`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth="2"`
- Size via Tailwind: `className="w-4 h-4"` or `"w-5 h-5"`

## Anti-Patterns to Avoid
- Do not use external state management libraries
- Do not import icon libraries — use inline SVGs
- Do not hardcode entity labels — always use `labels.*`
- Do not create separate CSS files — use Tailwind utility classes inline
- Do not use `useContext` for global state — keep state local or in lib modules
