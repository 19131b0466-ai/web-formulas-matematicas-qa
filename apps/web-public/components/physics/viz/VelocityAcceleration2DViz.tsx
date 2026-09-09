'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp, projectileState } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 280;

type Curve = 'circle' | 'parabola' | 'line';

function sample(curve: Curve, u: number) {
  if (curve === 'circle') {
    const th = u * 2 * Math.PI;
    const r = 2.4;
    return {
      x: r * Math.cos(th),
      y: r * Math.sin(th),
      vx: -r * Math.sin(th) * 2 * Math.PI,
      vy: r * Math.cos(th) * 2 * Math.PI,
      ax: -r * Math.cos(th) * (2 * Math.PI) ** 2,
      ay: -r * Math.sin(th) * (2 * Math.PI) ** 2,
    };
  }
  if (curve === 'parabola') {
    const t = u * 2.2;
    const st = projectileState(16, 50, t, G);
    return { x: st.x / 6 - 2, y: st.y / 5 - 0.4, vx: st.vx / 6, vy: st.vy / 5, ax: 0, ay: -G / 5 };
  }
  const x = -3 + u * 6;
  return { x, y: 0.4 * x, vx: 6, vy: 2.4, ax: 0, ay: 0 };
}

export function VelocityAcceleration2DViz({ mode = 'inst_velocity' }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [curve, setCurve] = useState<Curve>(mode === 'acceleration' ? 'circle' : 'parabola');
  const [u, setU] = useState(0.25);
  const [playing, setPlaying] = useState(false);
  const [ui, setUi] = useState(0.15);
  const [uf, setUf] = useState(0.55);
  useRafPlay(playing, setU, { min: 0, max: 1, speed: 0.25, loop: true });

  const p = sample(curve, clamp(u, 0, 1));
  const pi = sample(curve, ui);
  const pf = sample(curve, uf);
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = 48;
  const to = (x: number, y: number) => ({ x: ox + x * S, y: oy - y * S });
  const pts = Array.from({ length: 80 }, (_, i) => {
    const s = sample(curve, i / 79);
    return to(s.x, s.y);
  });
  const pp = to(p.x, p.y);
  const vScale = curve === 'circle' ? 0.12 : 0.35;
  const aScale = curve === 'circle' ? 0.012 : 0.08;
  const pv = to(p.x + p.vx * vScale, p.y + p.vy * vScale);
  const pa = to(p.x + p.ax * aScale, p.y + p.ay * aScale);
  const pii = to(pi.x, pi.y);
  const pff = to(pf.x, pf.y);
  const showDr = mode === 'displacement' || mode === 'avg_velocity';

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="velocity_accel_2d" mode={mode} />
        <ButtonRow>
          <VizButton active={curve === 'parabola'} onClick={() => setCurve('parabola')}>
            Parábola
          </VizButton>
          <VizButton active={curve === 'circle'} onClick={() => setCurve('circle')}>
            Circunferencia
          </VizButton>
          <VizButton active={curve === 'line'} onClick={() => setCurve('line')}>
            Recta
          </VizButton>
        </ButtonRow>
        <PlayRow
          playing={playing}
          onToggle={() => setPlaying((q) => !q)}
          extra={
            <VizButton
              onClick={() => {
                setPlaying(false);
                setU(0);
              }}
            >
              {tr('reset')}
            </VizButton>
          }
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Velocidad tangente y aceleración">
          <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke={MUTED} opacity={0.4} />
          <line x1={ox} y1={16} x2={ox} y2={H - 16} stroke={MUTED} opacity={0.4} />
          <path d={pts.map((q, i) => `${i ? 'L' : 'M'}${q.x},${q.y}`).join(' ')} fill="none" stroke={MUTED} strokeWidth={1.6} />
          {showDr ? (
            <line x1={pii.x} y1={pii.y} x2={pff.x} y2={pff.y} stroke={ORANGE} strokeWidth={2.4} />
          ) : null}
          <circle cx={pp.x} cy={pp.y} r={7} fill={ORANGE} />
          <line x1={pp.x} y1={pp.y} x2={pv.x} y2={pv.y} stroke={TEAL} strokeWidth={2.4} />
          <text x={pv.x + 6} y={pv.y} fontSize={12} fill={TEAL} fontWeight={700}>
            v
          </text>
          {(mode === 'acceleration' || curve !== 'line') && (
            <>
              <line x1={pp.x} y1={pp.y} x2={pa.x} y2={pa.y} stroke={ORANGE} strokeWidth={2.4} />
              <text x={pa.x + 6} y={pa.y} fontSize={12} fill={ORANGE} fontWeight={700}>
                a
              </text>
            </>
          )}
        </svg>
        <PhysStatus id={uid}>
          {mode === 'displacement'
            ? `Δr = rf − ri · |Δr| = ${present(Math.hypot(pf.x - pi.x, pf.y - pi.y))} (cuerda, no el arco)`
            : mode === 'avg_velocity'
              ? `vmed ∥ Δr · |vmed| = ${present(Math.hypot(pf.x - pi.x, pf.y - pi.y) / Math.max(0.05, uf - ui))}`
              : `v tangente · |v| = ${present(Math.hypot(p.vx, p.vy))} · |a| = ${present(Math.hypot(p.ax, p.ay))}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label={`u (${fmt(u)})`} value={u} min={0} max={1} step={0.01} onChange={setU} />
          {showDr ? (
            <>
              <SliderRow label="ui" value={ui} min={0} max={0.9} step={0.01} onChange={setUi} />
              <SliderRow label="uf" value={uf} min={0.1} max={1} step={0.01} onChange={setUf} />
            </>
          ) : null}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
