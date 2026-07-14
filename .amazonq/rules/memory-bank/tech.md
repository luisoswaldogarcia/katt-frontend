# Technology Stack - Katt Frontend

## Core Technologies
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.7 | UI framework |
| TypeScript | ~6.0.2 | Type safety |
| Vite | 8.1.1 | Build tool & dev server |
| Tailwind CSS | 4.3.2 | Utility-first styling |
| React Router DOM | 7.18.1 | Client-side routing |

## Key Dependencies
| Package | Purpose |
|---|---|
| `vite-plugin-pwa` + `workbox-window` | PWA support (installable, offline) |
| `@hello-pangea/dnd` | Drag-and-drop (Kanban board) |
| `barcode-detector` | Barcode scanning for POS/inventory |
| `tesseract.js` | OCR text recognition |
| `@vitejs/plugin-basic-ssl` | Local HTTPS for dev (required for camera/PWA) |

## Dev Dependencies
| Package | Purpose |
|---|---|
| `@tailwindcss/vite` | Tailwind CSS Vite integration |
| `@vitejs/plugin-react` | React Fast Refresh (uses Oxc) |
| `oxlint` | Fast linter (replaces ESLint) |

## Build & Dev Commands
```bash
npm run dev      # Start dev server with HTTPS (--host for network access)
npm run build    # TypeScript check + Vite production build
npm run lint     # Run oxlint
npm run preview  # Preview production build
```

## Configuration Files
- `vite.config.ts` — Plugins: react, tailwindcss, basicSsl, VitePWA
- `tsconfig.json` — Project references (app + node configs)
- `tsconfig.app.json` — App-specific TS config
- `.oxlintrc.json` — Linter rules

## PWA Configuration
- Register type: autoUpdate
- Display: fullscreen
- Theme: purple (#7c3aed) with dark background (#0f0a1a)
- Icons: 192px and 512px PNG

## Architecture Decisions
- **No backend yet** — uses in-memory demo stores (demoStore.ts)
- **No state management library** — React state + localStorage
- **No CSS-in-JS** — pure Tailwind utility classes
- **No ESLint** — uses oxlint for faster linting
- **Module system** — ES modules (`"type": "module"` in package.json)
