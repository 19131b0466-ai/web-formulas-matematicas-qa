import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
        404
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold">Página no encontrada</h1>
      <p className="mt-3 text-[var(--fg-muted)]">
        Esa sección no existe o aún no fue importada en la API.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
