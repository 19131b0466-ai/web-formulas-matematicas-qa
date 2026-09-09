'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { clamp } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 280;

function CentripetalAcMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l2.cir006');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [r, setR] = useState(2);
  const [v, setV] = useState(4);
  const [t, setT] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const omega = v / r;
  const ac = (v * v) / r;
  const theta = omega * t;
  useRafPlay(playing, setT, { min: 0, max: 6, speed: 1, loop: true });
  const ox = W / 2;
  const oy = H / 2 + 10;
  const S = Math.min(58, 220 / r);
  const px = ox + r * S * Math.cos(theta);
  const py = oy - r * S * Math.sin(theta);
  const tx = -Math.sin(theta);
  const ty = Math.cos(theta);
  const vLen = clamp(Math.abs(v) * 7, 16, 48);
  const acLen = clamp(ac * 5, 14, 44);
  const invR = r * S || 1;
  const trail = Array.from({ length: 6 }, (_, i) => {
    const th = theta - i * 0.25;
    return { x: ox + r * S * Math.cos(th), y: oy - r * S * Math.sin(th) };
  });
  const presets = [
    { id: '2v', label: tr('preset2v'), v: v * 2, r },
    { id: '2r', label: tr('preset2r'), v, r: r * 2 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="circular_motion" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setV(p.v); setR(p.r); } }))} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={ox} cy={oy} r={r * S} fill="none" stroke={MUTED} />
        <circle cx={ox} cy={oy} r={3} fill={MUTED} />
        {trail.map((p, i) => (
          <line key={i} x1={p.x} y1={p.y} x2={p.x + tx * 12} y2={p.y - ty * 12} stroke={TEAL} opacity={0.25 - i * 0.03} strokeWidth={1.5} />
        ))}
        <circle cx={px} cy={py} r={8} fill={ORANGE} />
        <line x1={px} y1={py} x2={px + tx * vLen} y2={py - ty * vLen} stroke={TEAL} strokeWidth={2.4} />
        <line x1={px} y1={py} x2={px + ((ox - px) / invR) * acLen} y2={py + ((oy - py) / invR) * acLen} stroke={ORANGE} strokeWidth={2.4} />
        <line x1={ox} y1={oy} x2={px} y2={py} stroke={MUTED} strokeDasharray="4 3" />
      </svg>
      <PhysResult primary={`ac = v²/r = ${present(ac)} m/s²`} secondary={tr('also', { omega: present(omega), ac2: present(omega * omega * r) })} />
      <PhysStatus id={uid}>{tr('status', { v: present(v), r: present(r), ac: present(ac) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="r (m)" value={r} min={0.5} max={4} step={0.1} onChange={setR} />
        <SliderRow label="v (m/s)" value={v} min={0.5} max={10} step={0.1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function TangentialAcMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.cir008');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const [r, setR] = useState(2);
  const [omega0, setOmega0] = useState(1.8);
  const [alpha, setAlpha] = useState(0.6);
  const [t, setT] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [showAt, setShowAt] = useState(true);
  const [showAc, setShowAc] = useState(true);
  useRafPlay(playing, setT, { min: 0, max: 6, speed: 1, loop: true });
  const omega = omega0 + alpha * t;
  const theta = omega0 * t + 0.5 * alpha * t * t;
  const v = omega * r;
  const ac = omega * omega * r;
  const at = alpha * r;
  const ox = W / 2;
  const oy = H / 2 + 8;
  const S = Math.min(54, 210 / r);
  const px = ox + r * S * Math.cos(theta);
  const py = oy - r * S * Math.sin(theta);
  const tx = -Math.sin(theta);
  const ty = Math.cos(theta);
  const invR = r * S || 1;
  const acLen = clamp(ac * 5, 12, 40);
  const atLen = clamp(Math.abs(at) * 8, 10, 36);
  const presets = [
    { id: 'a0', label: tr('presetA0'), alpha: 0 },
    { id: 'w0', label: tr('presetW0'), omega0: 0, alpha: 0.8 },
    { id: 'both', label: tr('presetBoth'), alpha: 0.6, omega0: 1.2 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="circular_motion" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { if (p.alpha !== undefined) setAlpha(p.alpha); if (p.omega0 !== undefined) setOmega0(p.omega0); } }))} />
      <ButtonRow>
        <VizButton active={showAt} onClick={() => setShowAt((q) => !q)}>at</VizButton>
        <VizButton active={showAc} onClick={() => setShowAc((q) => !q)}>ac</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={ox} cy={oy} r={r * S} fill="none" stroke={MUTED} />
        <circle cx={px} cy={py} r={8} fill={ORANGE} />
        {showAc ? <line x1={px} y1={py} x2={px + ((ox - px) / invR) * acLen} y2={py + ((oy - py) / invR) * acLen} stroke={ORANGE} strokeWidth={2.4} /> : null}
        {showAt ? <line x1={px} y1={py} x2={px + tx * Math.sign(at || 1) * atLen} y2={py - ty * Math.sign(at || 1) * atLen} stroke={ACCENT} strokeWidth={2.4} /> : null}
      </svg>
      <PhysResult primary={`at = α r = ${present(at)} m/s²`} secondary={tr('also', { ac: present(ac), v: present(v) })} />
      <PhysStatus id={uid}>{tr('status', { at: present(at), ac: present(ac) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="r (m)" value={r} min={0.5} max={4} step={0.1} onChange={setR} />
        <SliderRow label="ω0 (rad/s)" value={omega0} min={0} max={6} step={0.1} onChange={setOmega0} />
        <SliderRow label="α (rad/s²)" value={alpha} min={-2} max={2} step={0.1} onChange={setAlpha} />
      </ControlsStack>
    </div>
  );
}

function GeneralCircularMode({ mode }: { mode: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const rot = mode === 'alpha' || mode === 'omega_alpha' || mode === 'theta_alpha' || mode === 'ang_torricelli';
  const [r, setR] = useState(2);
  const [omega0, setOmega0] = useState(1.8);
  const [alpha, setAlpha] = useState(rot || mode === 'tangential' ? 0.6 : 0);
  const [t, setT] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const tMax = 6;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const a = mode === 'tangential' || rot ? alpha : 0;
  const omega = omega0 + a * t;
  const theta = omega0 * t + 0.5 * a * t * t;
  const v = omega * r;
  const ac = (omega * omega) * r;
  const at = a * r;
  const Tper = Math.abs(omega) > 1e-6 ? (2 * Math.PI) / Math.abs(omega) : Infinity;
  const f = Number.isFinite(Tper) ? 1 / Tper : 0;
  const ox = W / 2;
  const oy = H / 2;
  const S = 52;
  const px = ox + r * S * Math.cos(theta);
  const py = oy - r * S * Math.sin(theta);
  const tx = -Math.sin(theta);
  const ty = Math.cos(theta);
  const vLen = clamp(Math.abs(v) * 8, 18, 56);
  const acLen = clamp(ac * 6, 16, 50);
  const invR = r * S || 1;

  let status = `ac = v²/r = ω² r = ${present(ac)} m/s² · v = ${present(v)} m/s · ω = ${present(omega)} rad/s`;
  if (mode === 'dtheta') status = `Δθ = ${present(theta)} rad · arco = r Δθ = ${present(r * theta)} m`;
  if (mode === 'omega_avg') status = `ωmed = Δθ/Δt = ${present(theta / Math.max(t, 1e-6))} rad/s`;
  if (mode === 'omega') status = `ω = ${present(omega)} rad/s`;
  if (mode === 'v_omega_r') status = `v = ω r = ${present(v)} m/s`;
  if (mode === 'omega_freq') status = `ω = 2π f = 2π/T · f = ${present(f)} Hz · T = ${present(Tper)} s`;
  if (mode === 'Fc') status = `Fc = m ac (componente radial neta) · ac = ${present(ac)} m/s²`;
  if (mode === 'tangential') status = `at = α r = ${present(at)} m/s² · ac = ${present(ac)} (dirección)`;
  if (mode === 'alpha') status = `α = ${present(a)} rad/s² · ω = ω0 + α t = ${present(omega)}`;
  if (mode === 'omega_alpha') status = `ωf = ω0 + α t = ${present(omega)} rad/s`;
  if (mode === 'theta_alpha') status = `θ = θ0 + ω0 t + ½ α t² = ${present(theta)} rad`;
  if (mode === 'ang_torricelli') status = `ω² = ω0² + 2 α Δθ = ${present(omega0 * omega0 + 2 * a * theta)}`;

  return (
    <div className="space-y-4">
      <PhysGuide type="circular_motion" mode={mode} />
      <PlayRow
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        extra={
          <VizButton
            onClick={() => {
              setPlaying(false);
              setT(0);
            }}
          >
            {tr('reset')}
          </VizButton>
        }
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Movimiento circular: v tangente y ac al centro">
        <circle cx={ox} cy={oy} r={r * S} fill="none" stroke={MUTED} />
        <circle cx={ox} cy={oy} r={3} fill={MUTED} />
        <path
          d={`M${ox + r * S} ${oy} A ${r * S} ${r * S} 0 ${theta % (2 * Math.PI) > Math.PI ? 1 : 0} 0 ${px} ${py}`}
          fill="none"
          stroke={ACCENT}
          strokeWidth={3}
          opacity={0.5}
        />
        <circle cx={px} cy={py} r={8} fill={ORANGE} />
        <line x1={px} y1={py} x2={px + tx * vLen} y2={py - ty * vLen} stroke={TEAL} strokeWidth={2.4} />
        <text x={px + tx * vLen + 6} y={py - ty * vLen} fontSize={12} fill={TEAL} fontWeight={700}>
          v
        </text>
        <line x1={px} y1={py} x2={px + ((ox - px) / invR) * acLen} y2={py + ((oy - py) / invR) * acLen} stroke={ORANGE} strokeWidth={2.4} />
        <text x={ox + (px - ox) * 0.28} y={oy + (py - oy) * 0.28} fontSize={12} fill={ORANGE} fontWeight={700}>
          ac
        </text>
        {Math.abs(a) > 0.05 ? (
          <line
            x1={px}
            y1={py}
            x2={px + tx * Math.sign(a) * clamp(Math.abs(at) * 10, 14, 40)}
            y2={py - ty * Math.sign(a) * clamp(Math.abs(at) * 10, 14, 40)}
            stroke={ACCENT}
            strokeWidth={2}
            strokeDasharray="5 3"
          />
        ) : null}
      </svg>
      <PhysStatus id={uid}>{status}</PhysStatus>
      <ControlsStack>
        <SliderRow label={`t (${fmt(t)} s)`} value={t} min={0} max={tMax} step={0.05} onChange={setT} />
        <SliderRow label="r (m)" value={r} min={0.5} max={4} step={0.1} onChange={setR} />
        <SliderRow label="ω0 (rad/s)" value={omega0} min={0.5} max={6} step={0.1} onChange={setOmega0} />
        {mode === 'tangential' || rot ? (
          <SliderRow label="α (rad/s²)" value={alpha} min={-2} max={2} step={0.1} onChange={setAlpha} />
        ) : null}
      </ControlsStack>
    </div>
  );
}

export function CircularMotionViz({ mode }: { mode?: string }) {
  if (!mode) {
    return <VizPanel><CentripetalAcMode mode={mode} /></VizPanel>;
  }
  if (mode === 'tangential') {
    return <VizPanel><TangentialAcMode mode={mode} /></VizPanel>;
  }
  return <VizPanel><GeneralCircularMode mode={mode} /></VizPanel>;
}
