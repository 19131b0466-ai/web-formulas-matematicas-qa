'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from './controls';
import {
  COMPLEX_H,
  COMPLEX_W,
  clampVec,
  formatAngle,
  formatComplex,
  polarArc,
  present,
  snap,
  useComplexDrag,
} from './complexPlane';
import type { Vec2 } from './math2d';

/**
 * Complex conjugate: z̄ = a − bi (ALG-COM-002).
 */
export function ComplexConjugateViz() {
  const [z, setZ] = useState<Vec2>({ x: 2, y: 1.5 });
  const [showMod, setShowMod] = useState(false);
  const [showArg, setShowArg] = useState(false);
  const [showProp, setShowProp] = useState(false);
  const [flash, setFlash] = useState(0);
  const guideId = useId();
  const statusId = useId();

  const a = z.x;
  const b = z.y;
  const conj = { x: a, y: -b };
  const r = Math.hypot(a, b);
  const theta = Math.atan2(b, a);
  const W = COMPLEX_W;
  const H = COMPLEX_H;
  const ox = W / 2;
  const oy = H / 2;
  const S = 42;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const drag = useComplexDrag((p) => setZ(clampVec(p, 3.6)), S, { x: ox, y: oy });
  const pz = to(z);
  const pc = to(conj);
  const isReal = Math.abs(b) < 1e-9;
  const isImag = Math.abs(a) < 1e-9 && !isReal;

  const animateConjugate = () => {
    setFlash((f) => f + 1);
    // Visual cue: briefly emphasize reflection line (flash counter drives opacity via key)
  };

  const doubleConjugate = () => {
    setZ(conj);
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            El conjugado conserva la parte real y cambia el signo de la parte imaginaria. En el plano
            esto equivale a reflejar el punto respecto del eje real.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Arrastra z y observa cómo z̄ se mueve simétricamente al otro lado del eje real.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-center">
          <p className="font-mono text-base font-semibold">
            z={formatComplex(a, b)} ⟹ z̄={formatComplex(a, -b)}
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">(a,b) → (a,−b)</p>
          {isReal ? (
            <p className="mt-1 text-sm text-teal">Los números reales son iguales a su conjugado.</p>
          ) : null}
          {isImag ? <p className="mt-1 text-sm text-orange">bi → −bi · simétricos sobre el eje imaginario.</p> : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg
            key={flash}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto w-full max-w-xl touch-none"
            role="img"
            aria-labelledby={statusId}
          >
            <line x1={24} y1={oy} x2={W - 24} y2={oy} stroke="currentColor" opacity={0.4} strokeWidth={1.4} />
            <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.3} />
            <text x={W - 28} y={oy - 8} fontSize={11} opacity={0.7}>Re(z)</text>
            <text x={ox + 8} y={24} fontSize={11} opacity={0.7}>Im(z)</text>
            {[-3, -2, -1, 1, 2, 3].map((t) => (
              <g key={t}>
                <text x={to({ x: t, y: 0 }).x} y={oy + 14} textAnchor="middle" fontSize={9} opacity={0.4}>{t}</text>
                <text x={ox - 8} y={to({ x: 0, y: t }).y + 3} textAnchor="end" fontSize={9} opacity={0.4}>{t}</text>
              </g>
            ))}

            {showMod && r > 0.05 ? (
              <circle cx={ox} cy={oy} r={r * S} fill="none" stroke="currentColor" strokeWidth={1.2} opacity={0.35} />
            ) : null}

            {/* reflection guide */}
            {!isReal ? (
              <>
                <line x1={pz.x} y1={pz.y} x2={pc.x} y2={pc.y} stroke="currentColor" strokeDasharray="4 3" opacity={0.55} />
                <text x={pz.x + 8} y={(pz.y + pc.y) / 2} fontSize={10} opacity={0.7}>
                  b→−b
                </text>
              </>
            ) : null}

            {/* projections */}
            <line x1={pz.x} y1={pz.y} x2={pz.x} y2={oy} stroke="var(--accent-strong)" strokeDasharray="3 2" opacity={0.35} />
            <line x1={pc.x} y1={pc.y} x2={pc.x} y2={oy} stroke="orange" strokeDasharray="3 2" opacity={0.35} />

            {showArg && r > 0.2 ? (
              <>
                <path d={polarArc(ox, oy, S, Math.min(0.7, r * 0.45), 0, theta)} fill="none" stroke="var(--accent-strong)" strokeWidth={1.5} opacity={0.7} />
                <path d={polarArc(ox, oy, S, Math.min(0.55, r * 0.35), 0, -theta)} fill="none" stroke="orange" strokeWidth={1.5} opacity={0.7} />
              </>
            ) : null}

            <line x1={ox} y1={oy} x2={pz.x} y2={pz.y} stroke="var(--accent-strong)" strokeWidth={2.6} />
            <line x1={ox} y1={oy} x2={pc.x} y2={pc.y} stroke="orange" strokeWidth={2.4} />
            <circle cx={pz.x} cy={pz.y} r={7} fill="var(--accent-strong)" style={{ cursor: 'grab' }} {...drag} />
            <circle cx={pc.x} cy={pc.y} r={7} fill="orange" />
            <text x={pz.x + 10} y={pz.y - 10} fontSize={11} fontWeight={600} fill="var(--accent-strong)">
              z={formatComplex(a, b)}
            </text>
            <text x={pc.x + 10} y={pc.y + 16} fontSize={11} fontWeight={600} fill="orange">
              z̄={formatComplex(a, -b)}
            </text>
            {showMod && r > 0.05 ? (
              <text x={ox + r * S * 0.7} y={oy - 8} fontSize={10} opacity={0.65}>
                |z|=|z̄|={present(r)}
              </text>
            ) : null}
          </svg>
        </section>

        <section className="grid gap-2 rounded-xl border border-[var(--border)] px-3 py-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Cambia</p>
            <p className="font-mono">b→−b</p>
            <p className="font-mono">arg(z)→−arg(z)</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--fg-muted)]">Se conserva</p>
            <p className="font-mono">a · |z| · |z|²</p>
          </div>
        </section>

        {showProp ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>|z|=√(a²+b²)={present(r)}</p>
            <p>|z̄|=√(a²+(−b)²)={present(r)} ⇒ |z|=|z̄|</p>
            <p className="mt-1">
              z·z̄=({formatComplex(a, b)})({formatComplex(a, -b)})={present(a * a + b * b)}=|z|²
            </p>
            {showArg ? <p>arg(z̄)=−arg(z)={formatAngle(-theta, true)}</p> : null}
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          (a,b)→(a,−b) · |z|=|z̄|={present(r)} · z·z̄=|z|²={present(r * r)}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={animateConjugate}>Conjugar</VizButton>
            <VizButton onClick={doubleConjugate}>Conjugar otra vez</VizButton>
            <VizButton active={showMod} onClick={() => setShowMod((v) => !v)}>Mostrar módulo</VizButton>
            <VizButton active={showArg} onClick={() => setShowArg((v) => !v)}>Mostrar ángulos</VizButton>
            <VizButton active={showProp} onClick={() => setShowProp((v) => !v)}>Ver propiedad</VizButton>
          </ButtonRow>
          <ToggleRow label="Mostrar módulo" checked={showMod} onChange={setShowMod} />
          <SliderRow label="a" value={a} min={-3.5} max={3.5} step={0.1} onChange={(v) => setZ({ x: snap(v, -3.5, 3.5, 0.1), y: b })} />
          <SliderRow label="b" value={b} min={-3.5} max={3.5} step={0.1} onChange={(v) => setZ({ x: a, y: snap(v, -3.5, 3.5, 0.1) })} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
