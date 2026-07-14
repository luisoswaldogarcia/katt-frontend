# Katt - Technology Stack

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
| vite-plugin-pwa | PWA support (installable, offline) |
| workbox-window | Service worker management |
| tesseract.js 7 | OCR text recognition from images |
| barcode-detector | Barcode/QR scanning |
| @hello-pangea/dnd | Drag-and-drop (Kanban board) |

## Dev Dependencies
| Package | Purpose |
|---|---|
| @tailwindcss/vite | Tailwind CSS Vite plugin |
| @vitejs/plugin-react | React Fast Refresh via Oxc |
| @vitejs/plugin-basic-ssl | Local HTTPS for camera/PWA testing |
| oxlint | Fast linter (replaces ESLint) |

## Build & Development Commands
```bash
npm run dev      # Start dev server with --host (network access)
npm run build    # TypeScript check + Vite production build
npm run lint     # Run oxlint
npm run preview  # Preview production build
```

## Configuration Files
- `vite.config.ts` - Vite plugins: React, Tailwind, PWA manifest
- `tsconfig.json` - Project references (app + node configs)
- `tsconfig.app.json` - App-specific TS config
- `.oxlintrc.json` - Linter rules (react, typescript, oxc plugins)

## PWA Configuration
- Register type: autoUpdate
- Display: fullscreen
- Theme: #7c3aed (purple)
- Background: #0f0a1a (dark)

## Data Persistence
- All data stored in localStorage (no backend)
- Pattern: `katt-{entity}` keys
- JSON serialization for complex data

## Platform
- Mobile-first PWA
- Camera access for OCR/barcode scanning
- HTTPS required for camera APIs (basic-ssl plugin for dev)
