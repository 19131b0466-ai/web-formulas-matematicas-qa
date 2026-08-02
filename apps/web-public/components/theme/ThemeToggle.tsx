'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
    >
      {theme === 'dark' ? 'Claro' : 'Oscuro'}
    </button>
  );
}
