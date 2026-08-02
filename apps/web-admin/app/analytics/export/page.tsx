'use client';

import { useState } from 'react';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, downloadExportCsv } from '@/lib/api';

export default function ExportPage() {
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from.slice(0, 10));
  const [to, setTo] = useState(initial.to.slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onExport() {
    setLoading(true);
    setError(null);
    try {
      const fromIso = new Date(`${from}T00:00:00.000Z`).toISOString();
      const toIso = new Date(`${to}T23:59:59.999Z`).toISOString();
      await downloadExportCsv(fromIso, toIso);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Exportar CSV" subtitle="Descarga visit_logs sin columna ip_address." />
      {error ? <ErrorBox message={error} /> : null}

      <Card title="Rango de fechas">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-[var(--fg-muted)]">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-white"
            />
          </label>
          <label className="block text-sm text-[var(--fg-muted)]">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-white"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={loading}
          className="mt-6 min-h-12 rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-[#1a1406] disabled:opacity-60"
        >
          {loading ? 'Generando…' : 'Descargar CSV'}
        </button>
        <p className="mt-3 text-xs text-[var(--fg-muted)]">
          Columnas incluidas: fecha, sesión, path, país, ciudad, dispositivo, browser, OS, idioma…
          Nunca IP.
        </p>
      </Card>
    </div>
  );
}
