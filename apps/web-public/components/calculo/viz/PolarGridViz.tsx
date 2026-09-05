'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type PolarCurve = {
  id: 'rose3' | 'rose4' | 'cardioid' | 'lemniscate' | 'spiral' | 'circle' | 'limacon';
  r: (th: number) => number;
  tMin: number;
  tMax: number;
  rMax: number;
};

const CURVES: PolarCurve[] = [
  { id: 'rose3', r: (th) => Math.cos(3 * th), tMin: 0, tMax: Math.PI, rMax: 1.2 },
  { id: 'rose4', r: (th) => Math.cos(2 * th), tMin: 0, tMax: 2 * Math.PI, rMax: 1.2 },
  { id: 'cardioid', r: (th) => 1 + Math.cos(th), tMin: 0, tMax: 2 * Math.PI, rMax: 2.4 },
  {
    id: 'lemniscate',
    r: (th) => {
      const c = Math.cos(2 * th);
      return c >= 0 ? Math.sqrt(c) : NaN;
    },
    tMin: -Math.PI / 4,
    tMax: (5 * Math.PI) / 4,
    rMax: 1.2,
  },
  { id: 'spiral', r: (th) => th / Math.PI, tMin: 0, tMax: 4 * Math.PI, rMax: 4.2 },
  { id: 'circle', r: () => 2, tMin: 0, tMax: 2 * Math.PI, rMax: 2.6 },
  { id: 'limacon', r: (th) => 1 + 2 * Math.cos(th), tMin: 0, tMax: 2 * Math.PI, rMax: 3.4 },
];

const W = 480;
const CX = 240;
const CY = 240;
const SCALE = 55;

function polarToCart(r: number, th: number) {
  return { x: r * Math.cos(th), y: r * Math.sin(th) };
}
function toSvg(x: number, y: number) {
  return { sx: CX + x * SCALE, sy: CY - y * SCALE };
}

function polarPath(curve: PolarCurve, thEnd: number): string {
  const pts: string[] = [];
  let on = false;
  for (let th = curve.tMin; th <= thEnd + 1e-9; th += 0.008) {
    const r = curve.r(th);
    if (!isFinite(r)) {
      on = false;
      continue;
    }
    const { x, y } = polarToCart(r, th);
    const p = toSvg(x, y);
    pts.push(`${on ? 'L' : 'M'}${p.sx},${p.sy}`);
    on = true;
  }
  return pts.join(' ');
}

const RAYS = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2, (2 * Math.PI) / 3, (3 * Math.PI) / 4, (5 * Math.PI) / 6, Math.PI];

function angleLabel(th: number): string {
  const table: Record<string, string> = {
    '0': '0',
    '0.52': 'π/6',
    '0.79': 'π/4',
    '1.05': 'π/3',
    '1.57': 'π/2',
    '2.09': '2π/3',
    '2.36': '3π/4',
    '2.62': '5π/6',
    '3.14': 'π',
  };
  return table[th.toFixed(2)] ?? '';
}

export function PolarGridViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [idx, setIdx] = useState(0);
  const [theta, setTheta] = useState(CURVES[0]!.tMax);
  const [playing, setPlaying] = useState(false);
  const [showAxes, setShowAxes] = useState(true);
  const [showConv, setShowConv] = useState(true);
  const raf = useRef<number | null>(null);
  const curve = CURVES[idx]!;

  useEffect(() => {
    setTheta(curve.tMax);
    setPlaying(false);
  }, [idx, curve.tMax]);

  useEffect(() => {
    if (!playing) return;
    const step = () => {
      setTheta((prev) => {
        const next = prev + 0.03;
        if (next >= curve.tMax) return curve.tMin;
        return next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, curve.tMax, curve.tMin]);

  const fullPath = useMemo(() => polarPath(curve, curve.tMax), [curve]);
  const path = useMemo(() => polarPath(curve, theta), [curve, theta]);

  const rNow = curve.r(theta);
  const cart = isFinite(rNow) ? polarToCart(rNow, theta) : { x: NaN, y: NaN };
  const tip = isFinite(cart.x) ? toSvg(cart.x, cart.y) : { sx: CX, sy: CY };
  const deg = (theta * 180) / Math.PI;
  const rings = [1, 2, 3, 4].filter((r) => r <= Math.ceil(curve.rMax));

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('polar.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('polar.note')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          {CURVES.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-md border px-2 py-1 text-xs transition ${
                i === idx
                  ? 'border-[var(--accent-strong)] bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--accent-soft)]'
              }`}
            >
              {t(`polar.${c.id}`)}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${W}`} className="mx-auto h-auto w-full max-w-lg" role="img" aria-labelledby={statusId}>
            {rings.map((r) => (
              <circle key={r} cx={CX} cy={CY} r={r * SCALE} fill="none" stroke="currentColor" opacity={0.12} />
            ))}
            {[...RAYS, ...RAYS.slice(1).map((th) => th + Math.PI)].map((th) => {
              const p = toSvg(4.1 * Math.cos(th), 4.1 * Math.sin(th));
              return <line key={th} x1={CX} y1={CY} x2={p.sx} y2={p.sy} stroke="currentColor" opacity={0.1} />;
            })}
            {RAYS.map((th) => {
              const p = toSvg(3.55 * Math.cos(th), 3.55 * Math.sin(th));
              const lab = angleLabel(th);
              return lab ? (
                <text key={`lab${th}`} x={p.sx} y={p.sy} textAnchor="middle" fontSize={9} opacity={0.45} fill="currentColor">
                  {lab}
                </text>
              ) : null;
            })}
            {showAxes ? (
              <>
                <line x1={40} y1={CY} x2={440} y2={CY} stroke="currentColor" opacity={0.35} />
                <line x1={CX} y1={40} x2={CX} y2={440} stroke="currentColor" opacity={0.35} />
                <text x={448} y={CY - 6} fontSize={10} opacity={0.45} fill="currentColor">
                  x
                </text>
                <text x={CX + 6} y={36} fontSize={10} opacity={0.45} fill="currentColor">
                  y
                </text>
              </>
            ) : null}
            <path d={fullPath} fill="none" stroke="var(--accent-strong)" strokeWidth={2.2} opacity={0.28} />
            <path d={path} fill="none" stroke="var(--accent-strong)" strokeWidth={2.2} />
            {isFinite(rNow) ? (
              <>
                <line x1={CX} y1={CY} x2={tip.sx} y2={tip.sy} stroke="orange" strokeWidth={1.8} />
                <path
                  d={`M${CX + 28},${CY} A28,28,0,${Math.abs(theta) > Math.PI ? 1 : 0},${theta >= 0 ? 0 : 1},${CX + 28 * Math.cos(theta)},${CY - 28 * Math.sin(theta)}`}
                  fill="none"
                  stroke="orange"
                  strokeWidth={1.5}
                />
                <circle cx={tip.sx} cy={tip.sy} r={6} fill="orange" />
                {showConv ? (
                  <>
                    <line x1={tip.sx} y1={tip.sy} x2={tip.sx} y2={CY} stroke="currentColor" strokeDasharray="4 3" opacity={0.4} />
                    <line x1={tip.sx} y1={tip.sy} x2={CX} y2={tip.sy} stroke="currentColor" strokeDasharray="4 3" opacity={0.4} />
                  </>
                ) : null}
              </>
            ) : null}
          </svg>
        </div>

        <div id={statusId} className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs" aria-live="polite">
          <p>
            θ = {fmt(theta, 2)} rad ({fmt(deg, 1)}°) · r = {fmt(rNow)}
          </p>
          {showConv ? (
            <p>
              (r, θ) = ({fmt(rNow)}, {fmt(theta, 2)}) → (x, y) = ({fmt(cart.x)}, {fmt(cart.y)})
            </p>
          ) : null}
        </div>

        <ButtonRow>
          <VizButton active={playing} onClick={() => setPlaying((v) => !v)}>
            {playing ? t('common.pause') : t('common.play')}
          </VizButton>
        </ButtonRow>

        <ControlsStack>
          <SliderRow
            label={`θ = ${fmt(theta, 2)}`}
            value={theta}
            min={curve.tMin}
            max={curve.tMax}
            step={0.01}
            onChange={(v) => {
              setPlaying(false);
              setTheta(v);
            }}
          />
          <ToggleRow label={t('polar.showAxes')} checked={showAxes} onChange={setShowAxes} />
          <ToggleRow label={t('polar.showConv')} checked={showConv} onChange={setShowConv} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
