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
 * De Moivre: z^n = r^n (cos(nθ)+i sin(nθ)) (ALG-COM-006).
 */
export function DeMoivreViz() {
  const [r, setR] = useState(1);
  const [theta, setTheta] = useState(0.8);
  const [n, setN] = useState(3);
  const [unitMode, setUnitMode] = useState(true);
  const [showInter, setShowInter] = useState(false);
  const [animK, setAnimK] = useState<number | null>(null);
  const guideId = useId();
  const statusId = useId();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const rr = unitMode ? 1 : r;
  const rn = rr ** n;
  const nTheta = n * theta;
  const nThetaMod = ((nTheta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const turns = Math.floor(Math.abs(nTheta) / (Math.PI * 2));
  const z = { x: rr * Math.cos(theta), y: rr * Math.sin(theta) };
  const zn = { x: rn * Math.cos(nTheta), y: rn * Math.sin(nTheta) };

  const W = COMPLEX_W;
  const H = COMPLEX_H;
  const ox = W / 2;
  const oy = H / 2;
  const maxR = Math.max(rr, rn, 1.2);
  const S = Math.min(90, 130 / maxR);
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const pz = to(z);
  const pzn = to(zn);

  const setFromPoint = (p: Vec2) => {
    if (unitMode) {
      const ang = Math.atan2(p.y, p.x);
      setTheta(ang);
      return;
    }
    const nr = Math.hypot(p.x, p.y);
    setR(snap(Math.min(1.5, Math.max(0.5, nr)), 0.5, 1.5, 0.01));
    if (nr > 1e-6) setTheta(Math.atan2(p.y, p.x));
  };
  const drag = useComplexDrag(setFromPoint, S, { x: ox, y: oy });

  useEffect(() => {
    if (animK === null) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setAnimK((k) => {
        if (k === null) return null;
        if (k >= n) return null;
        return k + 1;
      });
    }, 700);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [animK, n]);

  const powers = Array.from({ length: n }, (_, k) => {
    const kk = k + 1;
    const rk = rr ** kk;
    const ang = kk * theta;
    return { k: kk, p: { x: rk * Math.cos(ang), y: rk * Math.sin(ang) }, ang, rk };
  });

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Elevar un número complejo a n multiplica su ángulo por n y eleva su módulo a la potencia
            n.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia r, θ y n: compara z con z<sup>n</sup> y observa cómo cambian su longitud y su
            ángulo.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
          <p className="text-base font-semibold">
            z={present(rr)}(cosθ+i sinθ) → z<sup>{n}</sup>={present(rn)}(cos{n}θ+i sin{n}θ)
          </p>
          <p className="mt-1">
            r → r<sup>n</sup>: {present(rr)} → {present(rn)} · θ → nθ:{' '}
            {formatAngle(theta, true)} → {formatAngle(nTheta, true)}
          </p>
          {unitMode ? (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              r=1 ⇒ z=e<sup>iθ</sup> · z<sup>n</sup>=e<sup>inθ</sup>
            </p>
          ) : null}
          {turns > 0 ? (
            <p className="mt-1 text-xs text-orange">
              ángulo acumulado {formatAngle(nTheta, true)} · equivalente {formatAngle(nThetaMod, true)} ·
              vueltas={turns}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl touch-none" role="img" aria-labelledby={statusId}>
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.35} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.35} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im</text>

            <circle cx={ox} cy={oy} r={rr * S} fill="none" stroke="currentColor" strokeWidth={1.1} opacity={0.3} />
            {Math.abs(rn - rr) > 0.05 ? (
              <circle cx={ox} cy={oy} r={rn * S} fill="none" stroke="orange" strokeWidth={1.1} opacity={0.35} />
            ) : null}

            {(showInter || animK !== null) &&
              powers
                .filter((p) => (animK === null ? p.k < n : p.k <= (animK ?? 0) && p.k < n))
                .map((p) => {
                  const tp = to(p.p);
                  return (
                    <g key={p.k} opacity={0.45}>
                      <line x1={ox} y1={oy} x2={tp.x} y2={tp.y} stroke="teal" strokeWidth={1.4} />
                      <circle cx={tp.x} cy={tp.y} r={4} fill="teal" />
                      <text x={tp.x + 6} y={tp.y - 6} fontSize={9} fill="teal">
                        z<sup>{p.k}</sup>
                      </text>
                    </g>
                  );
                })}

            <path d={polarArc(ox, oy, S, Math.min(0.55, rr * 0.4), 0, theta)} fill="none" stroke="var(--accent-strong)" strokeWidth={1.8} />
            <path d={polarArc(ox, oy, S, Math.min(0.75, rn * 0.35 + 0.15), 0, nThetaMod)} fill="none" stroke="orange" strokeWidth={1.8} />
            <line x1={ox} y1={oy} x2={pz.x} y2={pz.y} stroke="var(--accent-strong)" strokeWidth={2.6} />
            <line x1={ox} y1={oy} x2={pzn.x} y2={pzn.y} stroke="orange" strokeWidth={2.6} />
            <circle cx={pz.x} cy={pz.y} r={7} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <circle cx={pzn.x} cy={pzn.y} r={7} fill="orange" />
            <text x={pz.x + 8} y={pz.y - 10} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
              z={formatComplex(z.x, z.y)}
            </text>
            <text x={pzn.x + 8} y={pzn.y + 14} fontSize={11} fontWeight={600} fill="orange">
              z<sup>{n}</sup>={formatComplex(zn.x, zn.y)}
            </text>
            <text x={(ox + pz.x) / 2 - 4} y={(oy + pz.y) / 2 - 8} fontSize={10} fill="var(--accent-strong)">
              r
            </text>
            <text x={(ox + pzn.x) / 2 + 4} y={(oy + pzn.y) / 2 - 8} fontSize={10} fill="orange">
              r<sup>n</sup>
            </text>
          </svg>
        </section>

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          r={present(rr)}→r<sup>{n}</sup>={present(rn)} · θ={formatAngle(theta, true)}→{n}θ=
          {formatAngle(nTheta, true)} · z={formatComplex(z.x, z.y)} · z<sup>{n}</sup>=
          {formatComplex(zn.x, zn.y)}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={unitMode} onClick={() => { setUnitMode(true); setR(1); }}>
              Círculo unitario
            </VizButton>
            <VizButton active={!unitMode} onClick={() => setUnitMode(false)}>
              Módulo libre
            </VizButton>
            <VizButton active={showInter} onClick={() => setShowInter((v) => !v)}>
              Potencias intermedias
            </VizButton>
            <VizButton
              onClick={() => {
                setShowInter(true);
                setAnimK(1);
              }}
            >
              ▶ Ver potencias
            </VizButton>
          </ButtonRow>
          {!unitMode ? (
            <SliderRow label="r" value={r} min={0.5} max={1.5} step={0.01} onChange={(v) => setR(snap(v, 0.5, 1.5, 0.01))} />
          ) : null}
          <SliderRow
            label="θ"
            value={radToDeg(theta)}
            min={-180}
            max={180}
            step={1}
            onChange={(v) => setTheta((snap(v, -180, 180, 1) * Math.PI) / 180)}
          />
          <SliderRow label="n" value={n} min={1} max={8} step={1} onChange={(v) => setN(Math.round(v))} />
          <ToggleRow label="Mostrar potencias intermedias" checked={showInter} onChange={setShowInter} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
