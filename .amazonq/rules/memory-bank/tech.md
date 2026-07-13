# Technology Stack - Katt Frontend

## Languages & Versions
- **TypeScript** ~6.0.2
- **React** ^19.2.7
- **React DOM** ^19.2.7

## Build System
- **Vite** ^8.1.1 (ESM, HMR)
- **@vitejs/plugin-react** ^6.0.3 (uses Oxc)
- **TypeScript** compilation via `tsc -b`

## Styling
- **Tailwind CSS** ^4.3.2 (via `@tailwindcss/vite` plugin)
- Utility-first approach, no separate CSS modules

## Key Dependencies
- **react-router-dom** ^7.18.1 — client-side routing
- **@hello-pangea/dnd** ^18.0.1 — drag-and-drop (Kanban board)
- **vite-plugin-pwa** ^1.3.0 — PWA manifest, service worker
- **workbox-window** ^7.4.1 — service worker management

## Dev Dependencies
- **oxlint** ^1.71.0 — linting (replaces ESLint)
- **@types/node** ^24.13.2
- **@types/react** ^19.2.17
- **@types/react-dom** ^19.2.3

## Development Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with `--host` flag |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | Run oxlint |
| `npm run preview` | Preview production build |

## PWA Configuration
- Register type: `autoUpdate`
- Theme color: `#7c3aed` (purple)
- Background: `#0f0a1a` (dark)
- Display: `standalone`

## Project Configuration
- Module type: ESM (`"type": "module"`)
- Private package (not published)
- Linter: Oxlint with React + TypeScript + Oxc plugins
