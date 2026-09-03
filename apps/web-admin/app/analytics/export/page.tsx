'use client';

import { useState } from 'react';
import type { TrafficAudience } from '@repo/shared-types';
import { useTrafficFilter } from '@/components/TrafficFilter';
import { Card, ErrorBox, PageHeader } from '@/components/ui';
import { defaultRange, downloadExportCsv } from '@/lib/api';

export default function ExportPage() {
  const { audience, setAudience } = useTrafficFilter();
  const initial = defaultRange();
  const [from, setFrom] = useState(initial.from.slice(0, 10));
  const [to, setTo] = useState(initial.to.slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  async function onExport() {
    setLoading(true);
    setError(null);
    try {
      const fromIso = new Date(`${from}T00:00:00.000Z`).toISOString();
      const toIso = new Date(`${to}T23:59:59.999Z`).toISOString();
      await downloadExportCsv(fromIso, toIso, audience, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  const filters: Array<{ id: TrafficAudience; label: string }> = [
    { id: 'human', label: 'Solo humanos' },
    { id: 'bot', label: 'Solo bots' },
    { id: 'unknown', label: 'Solo desconocidos' },
    { id: 'all', label: 'Todo el tráfico' },
  ];

  return (
    <div>
      <PageHeader
        title="Exportar"
        subtitle="CSV/JSON sin ip_address. El rango de fechas es UTC (00:00–23:59). El filtro coincide con el selector del dashboard."
      />
      {error ? <ErrorBox message={error} /> : null}

      <Card title="Rango de fechas (UTC)">
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
        <p className="hud-label mt-4">Audiencia</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAudience(opt.id)}
              className={`border px-2 py-1 text-[10px] tracking-[0.1em] uppercase ${
                audience === opt.id
                  ? 'border-[var(--accent)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] text-[var(--fg-muted)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="hud-label mt-4">Formato</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => setFormat('csv')}
            className={`border px-2 py-1 text-[10px] uppercase ${format === 'csv' ? 'border-[var(--accent)] text-[var(--accent-strong)]' : 'border-[var(--border)] text-[var(--fg-muted)]'}`}
          >
            CSV
          </button>
          <button
            type="button"
            onClick={() => setFormat('json')}
            className={`border px-2 py-1 text-[10px] uppercase ${format === 'json' ? 'border-[var(--accent)] text-[var(--accent-strong)]' : 'border-[var(--border)] text-[var(--fg-muted)]'}`}
          >
            JSON
          </button>
        </div>
        <button type="button" onClick={onExport} disabled={loading} className="hud-btn mt-6 px-5 text-sm">
          {loading ? 'Generando…' : `Descargar ${format.toUpperCase()}`}
        </button>
        <p className="mt-3 text-xs text-[var(--fg-muted)]">
          Incluye traffic_class, bot_id, motivo, ip_hash, ip_network y event_source. Nunca IP completa.
        </p>
      </Card>
    </div>
  );
}
