'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations('theme');
  const label = theme === 'dark' ? t('toLight') : t('toDark');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
    >
      {theme === 'dark' ? t('light') : t('dark')}
    </button>
  );
}
