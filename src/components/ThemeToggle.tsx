import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('ssgen-theme') as Theme | null
  if (saved === 'light' || saved === 'dark') return saved
  return 'light'
}

/** Botão claro/escuro. Aplica a classe `dark` em <html> e persiste em localStorage. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitial)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('ssgen-theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      className="flex h-8 items-center gap-2 rounded-[8px] border border-[var(--ss-border)] bg-[var(--ss-card)] px-3 text-[12px] font-semibold text-[var(--ss-text)] transition hover:bg-[var(--ss-wash)]"
    >
      {theme === 'dark'
        ? <Sun className="h-[14px] w-[14px]" strokeWidth={1.8} />
        : <Moon className="h-[14px] w-[14px]" strokeWidth={1.8} />}
      <span className="hidden sm:inline">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
    </button>
  )
}
