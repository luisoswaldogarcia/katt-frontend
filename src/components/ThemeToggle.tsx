import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full bg-katt-100 dark:bg-katt-800 hover:bg-katt-200 dark:hover:bg-katt-700 transition-colors"
      aria-label="Cambiar tema"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
