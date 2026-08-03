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
          <label className="hud-label block">
            Desde
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="hud-input mt-2"
            />
          </label>
          <label className="hud-label block">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="hud-input mt-2"
            />
          </label>
        </div>
        <button type="button" onClick={onExport} disabled={loading} className="hud-btn mt-6 px-5 text-sm">
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
