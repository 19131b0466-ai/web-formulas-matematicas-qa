/** Keep this sync and free of next-intl — loading boundaries can render
 *  before `setRequestLocale`, which throws under static/ISR generation. */
export default function Loading() {
  return <p className="text-sm text-[var(--fg-muted)]">Cargando sección…</p>;
}
