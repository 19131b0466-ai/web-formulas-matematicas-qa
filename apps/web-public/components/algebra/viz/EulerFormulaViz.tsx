'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from './controls';
import {
  COMPLEX_H,
  COMPLEX_W,
  formatAngle,
  formatComplex,
  polarArc,
  present,
  radToDeg,
  snap,
  useComplexDrag,
} from './complexPlane';
import type { Vec2 } from './math2d';

/**
 * Euler's formula e^{iθ}=cosθ+i sinθ (ALG-COM-005).
 */
export function EulerFormulaViz() {
  const [theta, setTheta] = useState(Math.PI / 4);
  const [degrees, setDegrees] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const guideId = useId();
  const statusId = useId();
  const raf = useRef<number | null>(null);

  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const W = COMPLEX_W;
  const H = 340;
  const ox = W / 2;
  const oy = H / 2;
  const S = 110; // large unit circle
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const tip = to({ x: c, y: s });

  const setFromPoint = (p: Vec2) => {
    const n = Math.hypot(p.x, p.y);
    if (n < 1e-6) return;
    setTheta(Math.atan2(p.y, p.x));
  };
  const drag = useComplexDrag(setFromPoint, S, { x: ox, y: oy });

  useEffect(() => {
    if (!spinning) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      setTheta((th) => {
        let n = th + dt * 0.55;
        while (n > Math.PI * 2) n -= Math.PI * 2;
        while (n < 0) n += Math.PI * 2;
        return n;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [spinning]);

  const nearPi = Math.abs(theta - Math.PI) < 0.08;
  const thLabel = formatAngle(theta, degrees);
  const notables = [
    { t: 0, label: '0' },
    { t: Math.PI / 2, label: 'π/2' },
    { t: Math.PI, label: 'π' },
    { t: (3 * Math.PI) / 2, label: '3π/2' },
    { t: Math.PI * 2, label: '2π' },
  ];

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Un ángulo θ determina un punto del círculo unitario mediante cosθ y sinθ. Ese mismo punto
            es el número complejo e<sup>iθ</sup>.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Mueve θ y observa cómo cambian simultáneamente el ángulo, las coordenadas y el número
            complejo.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-center">
          <p className="font-mono text-lg font-semibold">
            e<sup>iθ</sup>=cosθ+i sinθ
          </p>
          <p className="mt-2 font-mono text-sm">
            θ={thLabel} · e<sup>i{thLabel}</sup>={formatComplex(c, s)}
          </p>
          <p className="mt-1 font-mono text-sm text-[var(--fg-muted)]">
            (cosθ,sinθ)=({present(c)},{present(s)}) ⟷ {formatComplex(c, s)}
          </p>
          {nearPi ? (
            <p className="mt-2 rounded-lg border border-orange px-2 py-1 text-sm font-semibold text-orange">
              e<sup>iπ</sup>+1=0
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.4} />
            <line x1={ox} y1={24} x2={ox} y2={H - 24} stroke="currentColor" opacity={0.4} />
            <text x={W - 28} y={oy - 8} fontSize={12} opacity={0.75}>Re</text>
            <text x={ox + 8} y={28} fontSize={12} opacity={0.75}>Im</text>
            {[-1, 1].map((t) => (
              <g key={t}>
                <text x={to({ x: t, y: 0 }).x} y={oy + 14} textAnchor="middle" fontSize={10} opacity={0.5}>{t}</text>
                <text x={ox - 10} y={to({ x: 0, y: t }).y + 4} textAnchor="end" fontSize={10} opacity={0.5}>{t}</text>
              </g>
            ))}

            <circle cx={ox} cy={oy} r={S} fill="none" stroke="currentColor" strokeWidth={1.6} opacity={0.45} />
            <text x={ox + S * 0.72} y={oy - 10} fontSize={10} opacity={0.6}>
              |e<sup>iθ</sup>|=1
            </text>

            <line x1={tip.x} y1={tip.y} x2={tip.x} y2={oy} stroke="orange" strokeDasharray="4 2" opacity={0.7} />
            <line x1={tip.x} y1={tip.y} x2={ox} y2={tip.y} stroke="teal" strokeDasharray="4 2" opacity={0.7} />
            <text x={(ox + tip.x) / 2} y={oy + 16} textAnchor="middle" fontSize={11} fill="teal">
              cosθ
            </text>
            <text x={tip.x + 10} y={(oy + tip.y) / 2} fontSize={11} fill="orange">
              sinθ
            </text>

            <path d={polarArc(ox, oy, S, 0.35, 0, theta)} fill="none" stroke="orange" strokeWidth={2.2} />
            <text
              x={ox + 0.35 * S * Math.cos(theta / 2) + 6}
              y={oy - 0.35 * S * Math.sin(theta / 2) - 4}
              fontSize={12}
              fill="orange"
              fontWeight={600}
            >
              θ
            </text>

            <line x1={ox} y1={oy} x2={tip.x} y2={tip.y} stroke="var(--accent-strong)" strokeWidth={2.8} />
            <circle cx={tip.x} cy={tip.y} r={8} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <text x={tip.x + 10} y={tip.y - 12} fontSize={12} fontWeight={600} fill="var(--accent-strong)">
              e<sup>iθ</sup>
            </text>
            <text x={tip.x + 10} y={tip.y + 6} fontSize={10} opacity={0.75}>
              ({present(c)},{present(s)})
            </text>
          </svg>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          θ={thLabel} · cosθ={present(c)} · sinθ={present(s)} · e<sup>iθ</sup>={formatComplex(c, s)}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={!degrees} onClick={() => setDegrees(false)}>Radianes</VizButton>
            <VizButton active={degrees} onClick={() => setDegrees(true)}>Grados</VizButton>
            <VizButton active={spinning} onClick={() => setSpinning((v) => !v)}>
              {spinning ? '⏸ Pausar' : '▶ Animar θ'}
            </VizButton>
            {notables.map((n) => (
              <VizButton key={n.label} onClick={() => setTheta(n.t === Math.PI * 2 ? 0 : n.t)}>
                {n.label}
              </VizButton>
            ))}
          </ButtonRow>
          <SliderRow
            label="θ"
            value={degrees ? radToDeg(theta) : theta}
            min={0}
            max={degrees ? 360 : Math.PI * 2}
            step={degrees ? 1 : 0.01}
            onChange={(v) => {
              let th = degrees ? (snap(v, 0, 360, 1) * Math.PI) / 180 : snap(v, 0, Math.PI * 2, 0.01);
              // soft snap to notables
              for (const n of notables) {
                if (Math.abs(th - n.t) < 0.06) th = n.t === Math.PI * 2 ? 0 : n.t;
              }
              setTheta(th);
            }}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
