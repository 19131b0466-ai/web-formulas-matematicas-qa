'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from './controls';
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
 * nth roots of a complex number (ALG-COM-007).
 */
export function ComplexRootsViz() {
  const [n, setN] = useState(5);
  const [r, setR] = useState(2);
  const [theta, setTheta] = useState(0.4);
  const [k, setK] = useState(0);
  const [showPoly, setShowPoly] = useState(true);
  const [buildK, setBuildK] = useState<number | null>(null);
  const guideId = useId();
  const statusId = useId();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const nn = Math.round(n);
  const rho = r ** (1 / nn);
  const delta = (2 * Math.PI) / nn;
  const roots = Array.from({ length: nn }, (_, i) => {
    const phi = (theta + 2 * Math.PI * i) / nn;
    return { k: i, phi, p: { x: rho * Math.cos(phi), y: rho * Math.sin(phi) } };
  });
  const active = roots[Math.min(k, nn - 1)] ?? roots[0];
  const z = { x: r * Math.cos(theta), y: r * Math.sin(theta) };

  const W = COMPLEX_W;
  const H = 340;
  const ox = W / 2;
  const oy = H / 2;
  const maxR = Math.max(r, rho, 1);
  const S = Math.min(70, 120 / maxR);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const pz = to(z);
  const pw = to(active.p);

  const setFromPoint = (p: Vec2) => {
    const nr = Math.hypot(p.x, p.y);
    setR(snap(Math.min(4, Math.max(0.25, nr)), 0.25, 4, 0.01));
    if (nr > 1e-6) setTheta(Math.atan2(p.y, p.x));
  };
  const drag = useComplexDrag(setFromPoint, S, { x: ox, y: oy });

  useEffect(() => {
    if (k >= nn) setK(0);
  }, [nn, k]);

  useEffect(() => {
    if (buildK === null) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setBuildK((bk) => {
        if (bk === null) return null;
        if (bk >= nn - 1) return null;
        const next = bk + 1;
        setK(next);
        return next;
      });
    }, 650);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [buildK, nn]);

  const polyPath =
    showPoly && roots.length >= 2
      ? `M${roots.map((rt) => `${to(rt.p).x},${to(rt.p).y}`).join(' L')} Z`
      : '';

  // verification: (wk)^n ≈ z
  const verify = {
    x: active.p.x ** 2 + active.p.y ** 2 > 0 ? Math.pow(rho, nn) * Math.cos(nn * active.phi) : 0,
    y: Math.pow(rho, nn) * Math.sin(nn * active.phi),
  };

  const visibleRoots =
    buildK === null ? roots : roots.filter((rt) => rt.k <= buildK);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Las n raíces de un número complejo tienen el mismo módulo r<sup>1/n</sup> y se
            distribuyen uniformemente alrededor del origen.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia n, r y θ: observa cómo las raíces forman un polígono regular y quedan separadas
            por 2π/n.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-base font-semibold">
            w<sub>k</sub>=r<sup>1/n</sup> e<sup>i(θ+2πk)/n</sup>
          </p>
          <p className="mt-1">
            |w<sub>k</sub>|={present(rho)} · Δφ=2π/n={formatAngle(delta, true)}
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            r → r<sup>1/n</sup>: {present(r)} → {present(rho)} · θ → (θ+2πk)/n · k={k}
          </p>
          <p className="text-xs text-[var(--fg-muted)]">
            Si z rota Δθ, las raíces rotan Δθ/n. · w<sub>n</sub>=w<sub>0</sub>
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.35} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.35} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im</text>

            <circle cx={ox} cy={oy} r={r * S} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.28} />
            <circle cx={ox} cy={oy} r={rho * S} fill="none" stroke="teal" strokeWidth={1.4} opacity={0.45} />
            <text x={ox + rho * S * 0.72} y={oy - 8} fontSize={9} fill="teal" opacity={0.8}>
              |w<sub>k</sub>|=r<sup>1/n</sup>
            </text>

            {polyPath ? <path d={polyPath} fill="none" stroke="teal" strokeWidth={1.2} opacity={0.5} /> : null}

            <path d={polarArc(ox, oy, S, Math.min(0.55, r * 0.25), 0, theta)} fill="none" stroke="var(--accent-strong)" strokeWidth={1.6} />
            <path d={polarArc(ox, oy, S, Math.min(0.7, rho * 0.45), 0, active.phi)} fill="none" stroke="orange" strokeWidth={1.8} />
            <path
              d={polarArc(ox, oy, S, rho * 0.85, active.phi, active.phi + delta)}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              opacity={0.45}
              strokeDasharray="3 2"
            />

            <line x1={ox} y1={oy} x2={pz.x} y2={pz.y} stroke="var(--accent-strong)" strokeWidth={2.6} />
            <circle cx={pz.x} cy={pz.y} r={7} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <text x={pz.x + 8} y={pz.y - 10} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
              z={formatComplex(z.x, z.y)}
            </text>

            {visibleRoots.map((rt) => {
              const tp = to(rt.p);
              const sel = rt.k === k;
              return (
                <g key={rt.k} style={{ cursor: 'pointer' }} onClick={() => setK(rt.k)}>
                  <circle
                    cx={tp.x}
                    cy={tp.y}
                    r={sel ? 8 : 5}
                    fill={sel ? 'orange' : 'teal'}
                    stroke={sel ? 'currentColor' : 'none'}
                    strokeWidth={sel ? 1.5 : 0}
                  />
                  <text x={tp.x + (sel ? 10 : 6)} y={tp.y - 6} fontSize={sel ? 11 : 9} fill={sel ? 'orange' : 'teal'} fontWeight={sel ? 600 : 400}>
                    w<sub>{rt.k}</sub>
                  </text>
                </g>
              );
            })}

            <line x1={ox} y1={oy} x2={pw.x} y2={pw.y} stroke="orange" strokeWidth={2} opacity={0.85} />
          </svg>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p>
            φ<sub>{k}</sub>=(θ+2π·{k})/n={formatAngle(active.phi, true)} ({present(active.phi)} rad)
          </p>
          <p>
            w<sub>{k}</sub>={present(rho)}(cosφ<sub>{k}</sub>+i sinφ<sub>{k}</sub>)=
            {formatComplex(active.p.x, active.p.y)}
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            Comprobación: (w<sub>{k}</sub>)<sup>{nn}</sup>≈{formatComplex(verify.x, verify.y)} ≈ z
          </p>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          n={nn} · r={present(r)} · θ={formatAngle(theta, true)} · k={k} · w<sub>{k}</sub>=
          {formatComplex(active.p.x, active.p.y)} · Δφ={formatAngle(delta, true)}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton
              onClick={() => {
                setBuildK(0);
                setK(0);
              }}
            >
              ▶ Construir raíces
            </VizButton>
            <VizButton onClick={() => setK((kk) => (kk - 1 + nn) % nn)}>k−</VizButton>
            <VizButton onClick={() => setK((kk) => (kk + 1) % nn)}>k+</VizButton>
          </ButtonRow>
          <ToggleRow label="Mostrar polígono de raíces" checked={showPoly} onChange={setShowPoly} />
          <SliderRow label="n" value={nn} min={2} max={10} step={1} onChange={(v) => setN(Math.round(v))} />
          <SliderRow label="r" value={r} min={0.25} max={4} step={0.01} onChange={(v) => setR(snap(v, 0.25, 4, 0.01))} />
          <SliderRow
            label="θ"
            value={radToDeg(theta)}
            min={0}
            max={360}
            step={1}
            onChange={(v) => setTheta((snap(v, 0, 360, 1) * Math.PI) / 180)}
          />
          <SliderRow label="k" value={k} min={0} max={Math.max(0, nn - 1)} step={1} onChange={(v) => setK(Math.round(v))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
