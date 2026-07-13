# Katt - Technology Stack

## Languages & Versions
- **TypeScript** ~6.0.2 (target: ES2023)
- **React** ^19.2.7
- **JSX**: react-jsx transform

## Build System
- **Vite** ^8.1.1 (ESM-based, module bundler)
- **@vitejs/plugin-react** ^6.0.3 (Oxc-based)
- **TypeScript** compilation via `tsc -b`

## Styling
- **Tailwind CSS** ^4.3.2 (via `@tailwindcss/vite` plugin)
- Custom color palette: `katt-*` tokens (purple-based)
- Dark mode support with `dark:` variants

## Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react-router-dom | ^7.18.1 | Client-side routing |
| @hello-pangea/dnd | ^18.0.1 | Drag-and-drop (Kanban) |
| vite-plugin-pwa | ^1.3.0 | PWA manifest & service worker |
| workbox-window | ^7.4.1 | Service worker registration |

## Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| oxlint | ^1.71.0 | Linting (replaces ESLint) |
| tailwindcss | ^4.3.2 | Utility-first CSS |
| @types/react | ^19.2.17 | React type definitions |
| @types/node | ^24.13.2 | Node.js types |

## Development Commands
```bash
npm run dev       # Start dev server with --host flag
npm run build     # TypeScript check + Vite production build
npm run lint      # Run oxlint
npm run preview   # Preview production build
```

## Configuration
- **TypeScript**: Strict mode with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`
- **Module resolution**: Bundler mode
- **PWA**: Auto-update registration, standalone display mode
- **Theme color**: #7c3aed (purple)
- **Background**: #0f0a1a (dark)

## Browser Targets
- ES2023 compatible browsers
- DOM + ES2023 lib
- Standalone PWA display mode
