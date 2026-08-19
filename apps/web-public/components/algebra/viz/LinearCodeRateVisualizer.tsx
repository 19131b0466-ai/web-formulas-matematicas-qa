'use client';

import { useEffect, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, joinCaption } from './controls';
import { formatPercent, formatRate } from './codingMath';
import { ArrowDown, BitCell, BitRow, ProportionalBar, SectionCard, StatCard } from './codingVizShared';
import { Badge, CollapsibleEdit, GuideBlock } from './transformHelpers';

const PRESETS = [
  { n: 7, k: 4, label: '[7,4]' },
  { n: 3, k: 1, label: '[3,1]' },
  { n: 5, k: 4, label: '[5,4]' },
  { n: 8, k: 4, label: '[8,4]' },
  { n: 7, k: 7, label: '[7,7]' },
];

const IDEA =
  'Vas a ver qué fracción de una palabra codificada corresponde a información independiente.';
const TRY_IT =
  'Pruébalo — Cambia n y k: observa cómo se reparte la palabra entre k símbolos de información y n−k símbolos de redundancia.';

export function LinearCodeRateVisualizer() {
  const [n, setN] = useState(7);
  const [k, setK] = useState(4);
  const [showSystematic, setShowSystematic] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareN, setCompareN] = useState(7);
  const [compareK, setCompareK] = useState(3);
  const [tradeoffOpen, setTradeoffOpen] = useState(false);
  const [interpretOpen, setInterpretOpen] = useState(false);
  const [systematicOpen, setSystematicOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const prevK = useRef(k);

  useEffect(() => {
    if (k > n) setK(n);
  }, [n, k]);

  const redundancy = n - k;
  const rate = k / n;
  const showCells = n <= 16;
  const compactCells = n > 16 && n <= 40;

  useEffect(() => {
    prevK.current = k;
  }, [k]);

  const ariaDesc = `El código tiene longitud n igual a ${n} y dimensión k igual a ${k}. La redundancia es ${redundancy}. La tasa es ${k} dividido entre ${n}, aproximadamente ${formatRate(n, k)} o ${formatPercent(rate)}.`;

  return (
    <VizPanel caption={joinCaption(`[n,k]=[${n},${k}]`, `R≈${formatRate(n, k)}`)}>
      <GuideBlock idea={IDEA} tryIt={TRY_IT} />
      <div className="sr-only" aria-live="polite">
        {ariaDesc}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-semibold">[n,k] = [{n},{k}]</span>
          <Badge tone="neutral">
            R = {k}/{n} ≈ {formatRate(n, k)}
          </Badge>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Longitud" value={`n = ${n}`} subtitle="símbolos por palabra" />
        <StatCard label="Dimensión" value={`k = ${k}`} subtitle="símbolos independientes" />
        <StatCard label="Redundancia" value={`n−k = ${redundancy}`} subtitle="símbolos adicionales" />
        <StatCard label="Tasa" value={`≈ ${formatPercent(rate)}`} subtitle={`R = ${k}/${n}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <SectionCard title="Mensaje">
            <p className="mb-2 text-xs text-[var(--fg-muted)]">k = {k} símbolos independientes</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: k }, (_, i) => (
                <BitCell key={i} value={0} tone="info" label={`u${sub(i + 1)}`} />
              ))}
            </div>
          </SectionCard>
          <ArrowDown label="codificar" />
          <SectionCard title="Palabra de código">
            <p className="mb-2 text-xs text-[var(--fg-muted)]">n = {n} símbolos</p>
            {showCells || compactCells ? (
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: n }, (_, i) => (
                  <BitCell
                    key={i}
                    value={0}
                    tone={i < k ? 'info' : 'parity'}
                    label={`c${sub(i + 1)}`}
                    size={compactCells ? 'sm' : 'md'}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--fg-muted)]">
                {k} información · {redundancy} redundancia · {n} totales
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[var(--fg-muted)]">
              <span className="rounded bg-emerald-800/15 px-2 py-0.5">Información · k = {k}</span>
              <span className="rounded bg-teal-600/15 px-2 py-0.5">Redundancia · n−k = {redundancy}</span>
            </div>
            {redundancy > 0 ? (
              <div className="mt-2">
                <Badge tone="neutral">+{redundancy} símbolos de redundancia</Badge>
              </div>
            ) : (
              <div className="mt-2">
                <Badge tone="ok">Sin redundancia adicional</Badge>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="space-y-3">
          <SectionCard title="Tasa">
            <div className="space-y-1 font-mono text-sm">
              <p>R = k / n</p>
              <p>
                R = {k} / {n}
              </p>
              <p className="text-lg font-semibold text-[var(--accent-strong)]">R ≈ {formatRate(n, k)}</p>
              <p>≈ {formatPercent(rate)} información</p>
              <p>≈ {formatPercent(redundancy / n)} redundancia</p>
            </div>
          </SectionCard>
          <p className="text-xs text-[var(--fg-muted)]">
            Por cada {n} símbolos codificados, el código tiene dimensión {k}.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ProportionalBar
          infoFraction={rate}
          infoLabel={`Información ${k}/${n} · ${formatPercent(rate)}`}
          parityLabel={`Redundancia ${redundancy}/${n} · ${formatPercent(redundancy / n)}`}
        />
      </div>

      <div className="mt-4">
        <ControlsStack>
        <SliderRow label="Longitud total · n" value={n} min={1} max={40} step={1} onChange={setN} />
        <SliderRow
          label="Dimensión · k"
          value={k}
          min={1}
          max={n}
          step={1}
          onChange={(v) => setK(Math.min(v, n))}
        />
        <ButtonRow>
          {PRESETS.map((p) => (
            <VizButton
              key={p.label}
              onClick={() => {
                setN(p.n);
                setK(p.k);
              }}
            >
              {p.label}
            </VizButton>
          ))}
        </ButtonRow>
        </ControlsStack>
      </div>

      <CollapsibleEdit
        label="¿Qué implica cambiar la tasa?"
        open={tradeoffOpen}
        onToggle={() => setTradeoffOpen((o) => !o)}
      >
        <p className="text-sm text-[var(--fg-muted)]">
          R alta: más dimensión de información respecto de n, menos redundancia relativa. R baja: más
          redundancia relativa. La capacidad de detección/corrección también depende de la estructura y de la
          distancia mínima del código.
        </p>
      </CollapsibleEdit>

      <CollapsibleEdit
        label="¿Cómo interpretar la tasa?"
        open={interpretOpen}
        onToggle={() => setInterpretOpen((o) => !o)}
      >
        <p className="text-sm text-[var(--fg-muted)]">
          R cercano a 1: la dimensión k está cerca de la longitud n. R más pequeño: existe mayor redundancia
          relativa. La tasa no determina por sí sola la capacidad de corrección.
        </p>
      </CollapsibleEdit>

      <CollapsibleEdit
        label="Mostrar ejemplo sistemático"
        open={systematicOpen}
        onToggle={() => setSystematicOpen((o) => !o)}
      >
        <p className="mb-2 text-xs text-[var(--fg-muted)]">Ejemplo de codificación sistemática (conceptual).</p>
        {showSystematic ? (
          <div className="space-y-2">
            <BitRow word={Array(k).fill(0) as never} label="Mensaje u" />
            <ArrowDown />
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: k }, (_, i) => (
                <BitCell key={i} value={0} tone="info" label={`u${sub(i + 1)}`} />
              ))}
              {Array.from({ length: redundancy }, (_, i) => (
                <BitCell key={`p${i}`} value={0} tone="parity" label={`p${sub(i + 1)}`} />
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-sm text-[var(--accent-strong)] underline"
            onClick={() => setShowSystematic(true)}
          >
            Activar vista sistemática
          </button>
        )}
      </CollapsibleEdit>

      <CollapsibleEdit label="Comparar tasas" open={compareOpen} onToggle={() => setCompareOpen((o) => !o)}>
        {showCompare ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 font-mono text-sm">
                [{n},{k}] · R≈{formatRate(n, k)}
              </p>
              <ProportionalBar infoFraction={rate} infoLabel="" parityLabel="" />
            </div>
            <div>
              <div className="mb-2 flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={compareN}
                  onChange={(e) => setCompareN(Number(e.target.value))}
                  className="w-14 rounded border border-[var(--border)] bg-[var(--bg)] px-1 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  max={compareN}
                  value={compareK}
                  onChange={(e) => setCompareK(Math.min(Number(e.target.value), compareN))}
                  className="w-14 rounded border border-[var(--border)] bg-[var(--bg)] px-1 text-sm"
                />
              </div>
              <p className="mb-1 font-mono text-sm">
                [{compareN},{compareK}] · R≈{formatRate(compareN, compareK)}
              </p>
              <ProportionalBar infoFraction={compareK / compareN} infoLabel="" parityLabel="" />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="text-sm text-[var(--accent-strong)] underline"
            onClick={() => setShowCompare(true)}
          >
            Abrir comparador
          </button>
        )}
      </CollapsibleEdit>
    </VizPanel>
  );
}

function sub(n: number): string {
  const subs = '₀₁₂₃₄₅₆₇₈₉';
  return String(n)
    .split('')
    .map((d) => subs[Number(d)] ?? d)
    .join('');
}
