/** Sync loading — avoid next-intl before setRequestLocale. */
export default function Loading() {
  return <p className="text-sm text-[var(--fg-muted)]">Cargando fórmula…</p>;
}
