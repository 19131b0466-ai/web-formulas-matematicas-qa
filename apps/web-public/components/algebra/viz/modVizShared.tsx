'use client';

import type { ReactNode } from 'react';
import { Badge } from './transformHelpers';

export type WheelNodeRole =
  | 'neutral'
  | 'visited'
  | 'active'
  | 'identity'
  | 'target'
  | 'result'
  | 'dimmed';

export type WheelNode = {
  residue: number;
  role?: WheelNodeRole;
  badges?: string[];
  label?: string;
};

export type WheelEdge = {
  from: number;
  to: number;
  active?: boolean;
};

export function wheelPositions(
  modulus: number,
  cx: number,
  cy: number,
  radius: number,
): { residue: number; x: number; y: number }[] {
  return Array.from({ length: modulus }, (_, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / modulus;
    return { residue: i, x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) };
  });
}

function nodeFill(role: WheelNodeRole | undefined): string {
  switch (role) {
    case 'active':
      return 'var(--accent-strong)';
    case 'visited':
      return 'teal';
    case 'identity':
    case 'target':
      return 'var(--accent-strong)';
    case 'result':
      return 'orange';
    case 'dimmed':
      return 'currentColor';
    default:
      return 'currentColor';
  }
}

function nodeRadius(role: WheelNodeRole | undefined): number {
  if (role === 'active' || role === 'identity' || role === 'target' || role === 'result') return 9;
  if (role === 'visited') return 7;
  return 5;
}

function nodeOpacity(role: WheelNodeRole | undefined, residue: number): number {
  if (role === 'dimmed' || (residue === 0 && role === 'neutral')) return 0.35;
  return 0.9;
}

export function ModularWheel({
  modulus,
  nodes = {},
  edges = [],
  center,
  size = 280,
  showLastEdgeOnly = false,
}: {
  modulus: number;
  nodes?: Record<number, WheelNode>;
  edges?: WheelEdge[];
  center?: ReactNode;
  size?: number;
  showLastEdgeOnly?: boolean;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const R = size * 0.36;
  const points = wheelPositions(modulus, cx, cy, R);

  const visibleEdges = showLastEdgeOnly && edges.length > 0 ? [edges[edges.length - 1]!] : edges;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[320px]" role="img">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="currentColor" opacity={0.25} />
      {visibleEdges.map((e, i) => {
        const from = points.find((p) => p.residue === e.from);
        const to = points.find((p) => p.residue === e.to);
        if (!from || !to) return null;
        return (
          <line
            key={`${e.from}-${e.to}-${i}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={e.active ? 'var(--accent-strong)' : 'teal'}
            strokeWidth={e.active ? 2.5 : 1.5}
            opacity={e.active ? 0.9 : 0.45}
            strokeLinecap="round"
          />
        );
      })}
      {points.map((p) => {
        const meta = nodes[p.residue];
        const role = meta?.role ?? (p.residue === 0 ? 'dimmed' : 'neutral');
        return (
          <g key={p.residue}>
            <circle
              cx={p.x}
              cy={p.y}
              r={nodeRadius(role)}
              fill={nodeFill(role)}
              opacity={nodeOpacity(role, p.residue)}
            />
            <text
              x={p.x}
              y={p.y - (meta?.badges?.length ? 16 : 12)}
              textAnchor="middle"
              fontSize={11}
              fill="currentColor"
            >
              {p.residue}
            </text>
            {meta?.badges?.map((b, i) => (
              <text
                key={b}
                x={p.x + (i - (meta.badges!.length - 1) / 2) * 14}
                y={p.y + 14}
                textAnchor="middle"
                fontSize={9}
                fill="var(--accent-strong)"
                fontWeight="bold"
              >
                {b}
              </text>
            ))}
          </g>
        );
      })}
      {center ? (
        <foreignObject x={cx - 70} y={cy - 36} width={140} height={72}>
          <div className="flex h-full flex-col items-center justify-center text-center">{center}</div>
        </foreignObject>
      ) : null}
    </svg>
  );
}

export function HypothesisCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
      {children}
    </div>
  );
}

export function ModExpr({ children }: { children: ReactNode }) {
  return <p className="text-center font-mono text-base tabular-nums sm:text-lg">{children}</p>;
}

export function StatusBadge({
  ok,
  okLabel,
  badLabel,
}: {
  ok: boolean;
  okLabel: string;
  badLabel: string;
}) {
  return (
    <Badge tone={ok ? 'ok' : 'neutral'}>{ok ? okLabel : badLabel}</Badge>
  );
}

export function SequenceBand({
  label,
  values,
  activeIndex,
  highlightIndex,
  highlightLabel,
  onSelect,
}: {
  label: string;
  values: (number | string)[];
  activeIndex?: number;
  highlightIndex?: number;
  highlightLabel?: string;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-max flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="w-8 shrink-0 font-mono text-xs text-[var(--fg-muted)]">{label}</span>
          {values.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect?.(i)}
              className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded border px-1 font-mono text-sm tabular-nums transition ${
                i === activeIndex
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : i === highlightIndex
                    ? 'border-teal-600/40 bg-teal-500/10'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {v}
              {i === highlightIndex && highlightLabel ? (
                <span className="ml-0.5 text-[9px] text-[var(--fg-muted)]">{highlightLabel}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepDetail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">{title}</p>
      <div className="mt-1 space-y-1 font-mono tabular-nums">{children}</div>
    </div>
  );
}

export function ReductionPanel({
  raw,
  modulus,
  residue,
  expression,
}: {
  raw: number;
  modulus: number;
  residue: number;
  expression: string;
}) {
  const q = Math.trunc((raw - residue) / modulus);
  return (
    <div className="space-y-2 text-sm">
      <ModExpr>{expression}</ModExpr>
      <ModExpr>{raw}</ModExpr>
      <p className="text-center text-xs text-[var(--fg-muted)]">
        {raw} = {q}·{modulus} + {residue}
      </p>
      <ModExpr>
        {raw} mod {modulus} = {residue}
      </ModExpr>
      <p className="text-center font-mono text-base text-[var(--accent-strong)] tabular-nums sm:text-lg">
        {expression.split('=')[0]?.trim()} ≡ {residue} (mod {modulus})
      </p>
    </div>
  );
}

export function NumberLineMarks({
  marks,
  solutions,
  range,
}: {
  marks: { value: number; kind: 'a' | 'b' | 'both' }[];
  solutions: number[];
  range: [number, number];
}) {
  const [min, max] = range;
  const width = max - min || 1;
  const pos = (v: number) => `${((v - min) / width) * 100}%`;
  return (
    <div className="relative h-16 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2">
      <div className="relative h-full min-w-[480px]">
        <div className="absolute left-2 right-2 top-1/2 h-px bg-[var(--border)]" />
        {marks.map((m) => (
          <div
            key={`${m.kind}-${m.value}`}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos(m.value) }}
          >
            <div
              className={`h-3 w-3 rounded-full ${
                m.kind === 'both'
                  ? 'bg-[var(--accent-strong)]'
                  : m.kind === 'a'
                    ? 'bg-teal-500'
                    : 'bg-orange-500'
              }`}
            />
            <span className="absolute left-1/2 top-4 -translate-x-1/2 font-mono text-[10px] tabular-nums">
              {m.value}
            </span>
          </div>
        ))}
        {solutions.map((s) => (
          <div
            key={`sol-${s}`}
            className="absolute top-0 -translate-x-1/2 text-[10px] text-[var(--accent-strong)]"
            style={{ left: pos(s) }}
          >
            ▲
          </div>
        ))}
      </div>
    </div>
  );
}
