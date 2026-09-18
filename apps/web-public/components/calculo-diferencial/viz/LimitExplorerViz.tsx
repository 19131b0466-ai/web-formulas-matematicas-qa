'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from '@/components/calculo/viz/calcMath';
import { PLOT_H, PLOT_M, PLOT_W, pathOf, toX, toY, yRange } from './plotUtils';

type SecantPreset = {
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
  x0: number;
  xMin: number;
  xMax: number;
};

const SECANT_PRESETS: SecantPreset[] = [
  {
    label: 'x²',
    f: (x) => x * x,
    df: (x) => 2 * x,
    x0: 1,
    xMin: -2,
    xMax: 2,
  },
  {
    label: 'x³',
    f: (x) => x ** 3,
    df: (x) => 3 * x * x,
    x0: 0.8,
    xMin: -1.6,
    xMax: 1.6,
  },
  {
    label: 'sen(x)',
    f: (x) => Math.sin(x),
    df: (x) => Math.cos(x),
    x0: 0.6,
    xMin: -Math.PI,
    xMax: Math.PI,
  },
];

type Props = { mode?: string };

function SecantMode() {
  const t = useTranslations('vizDif.limit');
  const [idx, setIdx] = useState(0);
  const preset = SECANT_PRESETS[idx]!;
  const [h, setH] = useState(0.8);

  const { xMin, xMax, x0, f, df } = preset;
  const y0 = f(x0);
  const x1 = x0 + h;
  const y1 = f(x1);
  const slope = (y1 - y0) / h;
  const deriv = df(x0);
  const range = yRange(f, xMin, xMax);

  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const secant = `M${toX(x0, xMin, xMax)},${toY(y0, range.yMin, range.yMax)} L${toX(x1, xMin, xMax)},${toY(y1, range.yMin, range.yMax)}`;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('secantIdea')}</p>
      <div className="flex flex-wrap gap-2">
        {SECANT_PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setIdx(i)}
            className={`rounded-lg border px-3 py-1.5 text-sm transition ${
              i === idx
                ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                : 'border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--accent-strong)]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <ControlsStack>
        <SliderRow label={t('hLabel')} value={h} min={0.05} max={1.2} step={0.01} onChange={setH} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <line x1={PLOT_M.l} y1={toY(0, range.yMin, range.yMax)} x2={PLOT_W - PLOT_M.r} y2={toY(0, range.yMin, range.yMax)} stroke="var(--border)" />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <line x1={toX(x0, xMin, xMax)} y1={toY(y0, range.yMin, range.yMax)} x2={toX(x1, xMin, xMax)} y2={toY(y1, range.yMin, range.yMax)} stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 4" />
        <circle cx={toX(x0, xMin, xMax)} cy={toY(y0, range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
        <circle cx={toX(x1, xMin, xMax)} cy={toY(y1, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--fg-muted)]">{t('secantSlope')}</dt>
          <dd className="font-mono font-semibold">{fmt(slope, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('derivative')}</dt>
          <dd className="font-mono font-semibold text-[var(--accent-strong)]">{fmt(deriv, 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

function InformalMode() {
  const t = useTranslations('vizDif.limit');
  const a = 1;
  const L = 2;
  const f = (x: number) => (Math.abs(x - a) < 0.001 ? NaN : x + 1);
  const xMin = -0.5;
  const xMax = 2.5;
  const [x, setX] = useState(1.35);
  const range = yRange((v) => v + 1, xMin, xMax);
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const fx = x + 1;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('informalIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('xLabel')} value={x} min={xMin + 0.05} max={xMax - 0.05} step={0.01} onChange={setX} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <line x1={PLOT_M.l} y1={toY(L, range.yMin, range.yMax)} x2={PLOT_W - PLOT_M.r} y2={toY(L, range.yMin, range.yMax)} stroke="#22c55e" strokeDasharray="5 4" />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <circle cx={toX(a, xMin, xMax)} cy={toY(L, range.yMin, range.yMax)} r={5} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <line x1={toX(x, xMin, xMax)} y1={PLOT_M.t} x2={toX(x, xMin, xMax)} y2={PLOT_H - PLOT_M.b} stroke="var(--fg-muted)" strokeDasharray="4 3" opacity={0.45} />
        <circle cx={toX(x, xMin, xMax)} cy={toY(fx, range.yMin, range.yMax)} r={5} fill="#f59e0b" />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--fg-muted)]">x</dt>
          <dd className="font-mono font-semibold">{fmt(x, 3)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">f(x)</dt>
          <dd className="font-mono font-semibold">{fmt(fx, 4)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('limitValue')}</dt>
          <dd className="font-mono font-semibold text-[var(--accent-strong)]">{fmt(L, 4)}</dd>
        </div>
      </dl>
    </div>
  );
}

function EpsilonDeltaMode() {
  const t = useTranslations('vizDif.limit');
  const a = 1;
  const L = 3;
  const f = (x: number) => 2 * x + 1;
  const xMin = -0.5;
  const xMax = 2.5;
  const [epsilon, setEpsilon] = useState(0.6);
  const [delta, setDelta] = useState(0.35);
  const range = yRange(f, xMin, xMax);

  const yLo = L - epsilon;
  const yHi = L + epsilon;
  const xLo = a - delta;
  const xHi = a + delta;
  const curve = pathOf(f, xMin, xMax, range.yMin, range.yMax);
  const inBand = (x: number) => x > xLo && x < xHi && Math.abs(f(x) - L) < epsilon;

  let ok = true;
  for (let i = 0; i <= 40; i++) {
    const x = xLo + 0.02 + (i / 40) * (xHi - xLo - 0.04);
    if (Math.abs(x - a) < 0.001) continue;
    if (!inBand(x)) {
      ok = false;
      break;
    }
  }

  const bandX = `${toX(xLo, xMin, xMax)},${PLOT_M.t} ${toX(xHi, xMin, xMax)},${PLOT_M.t} ${toX(xHi, xMin, xMax)},${PLOT_H - PLOT_M.b} ${toX(xLo, xMin, xMax)},${PLOT_H - PLOT_M.b}`;
  const bandY = `${PLOT_M.l},${toY(yHi, range.yMin, range.yMax)} ${PLOT_W - PLOT_M.r},${toY(yHi, range.yMin, range.yMax)} ${PLOT_W - PLOT_M.r},${toY(yLo, range.yMin, range.yMax)} ${PLOT_M.l},${toY(yLo, range.yMin, range.yMax)}`;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('epsilonDeltaIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('epsilonLabel')} value={epsilon} min={0.15} max={1.2} step={0.05} onChange={setEpsilon} />
        <SliderRow label={t('deltaLabel')} value={delta} min={0.08} max={0.9} step={0.02} onChange={setDelta} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <polygon points={bandY} fill="#22c55e" opacity={0.12} />
        <polygon points={bandX} fill="#3b82f6" opacity={0.1} />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
        <circle cx={toX(a, xMin, xMax)} cy={toY(L, range.yMin, range.yMax)} r={5} fill="var(--accent-strong)" />
      </svg>
      <p className={`text-sm font-medium ${ok ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
        {ok ? t('epsilonDeltaOk') : t('epsilonDeltaFail')}
      </p>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--fg-muted)]">L</dt>
          <dd className="font-mono font-semibold">{fmt(L, 2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">a</dt>
          <dd className="font-mono font-semibold">{fmt(a, 2)}</dd>
        </div>
      </dl>
    </div>
  );
}

function LateralMode() {
  const t = useTranslations('vizDif.limit');
  const a = 0;
  const f = (x: number) => (x < a ? -x + 1 : x + 2);
  const xMin = -2;
  const xMax = 2;
  const [x, setX] = useState(0.6);
  const range = yRange(f, xMin, xMax);
  const curveLeft = pathOf(f, xMin, a - 0.02, range.yMin, range.yMax);
  const curveRight = pathOf(f, a + 0.02, xMax, range.yMin, range.yMax);
  const leftLimit = 1;
  const rightLimit = 2;
  const bilateral = false;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('lateralIdea')}</p>
      <ControlsStack>
        <SliderRow label={t('xLabel')} value={x} min={xMin + 0.1} max={xMax - 0.1} step={0.02} onChange={setX} />
      </ControlsStack>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <path d={curveLeft} fill="none" stroke="#3b82f6" strokeWidth={2} />
        <path d={curveRight} fill="none" stroke="#f59e0b" strokeWidth={2} />
        <line x1={toX(a, xMin, xMax)} y1={PLOT_M.t} x2={toX(a, xMin, xMax)} y2={PLOT_H - PLOT_M.b} stroke="var(--fg-muted)" strokeDasharray="4 3" />
        <circle cx={toX(x, xMin, xMax)} cy={toY(f(x), range.yMin, range.yMax)} r={5} fill={x < a ? '#3b82f6' : '#f59e0b'} />
      </svg>
      <dl className="grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--fg-muted)]">{t('leftLimit')}</dt>
          <dd className="font-mono font-semibold text-[#3b82f6]">{fmt(leftLimit, 2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('rightLimit')}</dt>
          <dd className="font-mono font-semibold text-[#f59e0b]">{fmt(rightLimit, 2)}</dd>
        </div>
        <div>
          <dt className="text-[var(--fg-muted)]">{t('bilateralExists')}</dt>
          <dd className="font-semibold">{bilateral ? t('yes') : t('no')}</dd>
        </div>
      </dl>
    </div>
  );
}

function NotableMode() {
  const t = useTranslations('vizDif.limit');
  const xs = [1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01];
  const rows = xs.map((x) => ({ x, y: Math.sin(x) / x }));
  const range = { yMin: 0.85, yMax: 1.05, xMin: -0.2, xMax: 1.2 };
  const f = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);
  const curve = pathOf(f, 0.01, 1.2, range.yMin, range.yMax);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('notableIdea')}</p>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <line x1={PLOT_M.l} y1={toY(1, range.yMin, range.yMax)} x2={PLOT_W - PLOT_M.r} y2={toY(1, range.yMin, range.yMax)} stroke="#22c55e" strokeDasharray="4 4" />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
      </svg>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
            <th className="py-1 pr-4">x</th>
            <th className="py-1">sen(x)/x</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.x} className="border-b border-[var(--border)] font-mono">
              <td className="py-1 pr-4">{r.x}</td>
              <td className="py-1">{fmt(r.y, 6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EDefinitionMode() {
  const t = useTranslations('vizDif.limit');
  const xs = [-0.2, -0.1, -0.05, -0.02, -0.01, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5];
  const e = Math.E;
  const rows = xs.map((x) => ({ x, y: (1 + x) ** (1 / x) }));
  const range = { yMin: 2.5, yMax: 3.2, xMin: -0.25, xMax: 0.55 };
  const f = (x: number) => {
    if (x <= -1) return NaN;
    if (Math.abs(x) < 1e-6) return e;
    return (1 + x) ** (1 / x);
  };
  const curve = pathOf(f, -0.22, 0.55, range.yMin, range.yMax);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--fg)]">{t('eDefinitionIdea')}</p>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full rounded-lg border border-[var(--border)] bg-[var(--formula-bg)]">
        <line x1={PLOT_M.l} y1={toY(e, range.yMin, range.yMax)} x2={PLOT_W - PLOT_M.r} y2={toY(e, range.yMin, range.yMax)} stroke="#22c55e" strokeDasharray="4 4" />
        <path d={curve} fill="none" stroke="var(--accent-strong)" strokeWidth={2} />
      </svg>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--fg-muted)]">
            <th className="py-1 pr-4">x</th>
            <th className="py-1">(1+x)^(1/x)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.x} className="border-b border-[var(--border)] font-mono">
              <td className="py-1 pr-4">{r.x}</td>
              <td className="py-1">{fmt(r.y, 6)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm text-[var(--fg-muted)]">
        {t('eValue')}: <span className="font-mono font-semibold text-[var(--accent-strong)]">{fmt(e, 6)}</span>
      </p>
    </div>
  );
}

export function LimitExplorerViz({ mode = 'secante' }: Props) {
  const t = useTranslations('vizDif.limit');

  const body = useMemo(() => {
    switch (mode) {
      case 'informal':
        return <InformalMode />;
      case 'epsilon_delta':
        return <EpsilonDeltaMode />;
      case 'lateral':
        return <LateralMode />;
      case 'notable':
        return <NotableMode />;
      case 'e_definition':
        return <EDefinitionMode />;
      default:
        return <SecantMode />;
    }
  }, [mode]);

  const note = mode === 'secante' ? t('note') : null;

  return (
    <VizPanel>
      {body}
      {note ? <p className="mt-3 text-xs text-[var(--fg-muted)]">{note}</p> : null}
    </VizPanel>
  );
}
