# Katt - Asistente Virtual 🐱

## Descripción
Katt es una aplicación web de asistente virtual con temática de gato. Diseñada mobile-first con soporte responsive para desktop.

## Stack Técnico
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Estilos:** Tailwind CSS 4
- **UI Components:** shadcn/ui (pendiente de configurar)
- **PWA:** vite-plugin-pwa (instalable en móvil)
- **Tema:** Dark/Light mode con toggle

## Arquitectura
- **Filosofía Vue (Single File):** Cada página contiene su lógica, markup y estilos en un solo archivo `.tsx`
- **Componentes compartidos:** En `/src/components/` — archivos separados reutilizables
- **Páginas:** En `/src/pages/` — single file components
- **Hooks:** En `/src/hooks/` — lógica reutilizable
- **Lib:** En `/src/lib/` — utilidades y configuraciones

## Diseño
- Mobile-first responsive
- Paleta: tonos púrpura oscuros con acentos suaves
- Dark mode por defecto, toggle a light mode
- UI moderna, limpia, tipo chat/asistente

## Estructura
```
src/
├── components/    # Componentes compartidos (ThemeToggle, ChatBubble, etc.)
├── pages/         # Páginas (single file, filosofía Vue)
├── hooks/         # Custom hooks (useTheme, etc.)
├── lib/           # Utilidades
├── App.tsx        # Router principal
└── main.tsx       # Entry point
```
