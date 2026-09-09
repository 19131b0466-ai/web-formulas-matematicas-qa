'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { formatValue } from './physFormat';
import { angularMomentum } from './physLote1Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE } from './physPlot';

function LIomegaMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.rot013');
  const uid = useId();
  const [sub, setSub] = useState<'direct' | 'redistribute'>('direct');
  const [I, setI] = useState(3.2);
  const [omega, setOmega] = useState(2.2);
  const [r, setR] = useState(1.6);
  const m = 1;
  const Ired = 2 * m * r * r;
  const L0 = angularMomentum(I, omega);
  const omegaCons = L0 / Ired;
  const L = sub === 'direct' ? angularMomentum(I, omega) : L0;
  const omegaShow = sub === 'direct' ? omega : omegaCons;
  const Ishow = sub === 'direct' ? I : Ired;
  const th = omegaShow * 0.8;
  const ox = 210;
  const oy = 140;
  const S = 50;

  const presets = [{ id: 'skater', label: tr('presetSkater'), sub: 'redistribute' as const, r: 0.7 }];

  return (
    <div className="space-y-4">
      <PhysGuide type="angular_momentum" mode={mode} />
      <ButtonRow>
        <VizButton active={sub === 'direct'} onClick={() => setSub('direct')}>{tr('direct')}</VizButton>
        <VizButton active={sub === 'redistribute'} onClick={() => setSub('redistribute')}>{tr('redistribute')}</VizButton>
      </ButtonRow>
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setSub(p.sub); setR(p.r); } }))} />
      <svg viewBox="0 0 420 280" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={ox} cy={oy} r={18} fill={MUTED} />
        {[0, Math.PI].map((off) => (
          <g key={off}>
            <line x1={ox} y1={oy} x2={ox + r * S * Math.cos(th + off)} y2={oy + r * S * Math.sin(th + off)} stroke={ACCENT} strokeWidth={3} />
            <circle cx={ox + r * S * Math.cos(th + off)} cy={oy + r * S * Math.sin(th + off)} r={10} fill={ORANGE} />
          </g>
        ))}
      </svg>
      <PhysResult
        primary={`L = I ω = ${formatValue(L, 'kg·m²/s')}`}
        secondary={tr('values', { I: present(Ishow), omega: present(omegaShow), state: sub === 'redistribute' ? tr('Lconstant') : tr('Lvariable') })}
      />
      <PhysStatus id={uid}>{sub === 'redistribute' ? tr('conservation') : tr('directStatus')}</PhysStatus>
      <ControlsStack>
        {sub === 'direct' ? (
          <>
            <SliderRow label={tr('I', { I: present(I) })} value={I} min={0.5} max={8} step={0.1} onChange={setI} />
            <SliderRow label={tr('omega', { omega: present(omega) })} value={omega} min={0.2} max={6} step={0.1} onChange={setOmega} />
          </>
        ) : (
          <SliderRow label={tr('r', { r: present(r) })} value={r} min={0.4} max={2.4} step={0.05} onChange={setR} />
        )}
      </ControlsStack>
    </div>
  );
}

function GeneralAngularMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [r, setR] = useState(1.6);
  const [tauOn, setTauOn] = useState(mode === 'tau_dL');
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const m = 1;
  const I0 = 2 * m * 1.6 * 1.6;
  const L0 = I0 * 2.2;
  const I = 2 * m * r * r;
  const omega = tauOn ? L0 / I0 + (1.5 * t) / I : L0 / I;
  const L = I * omega;
  useRafPlay(playing, setT, { min: 0, max: 4, speed: 0.8, loop: true });
  const th = omega * t;
  const ox = 210;
  const oy = 140;
  const S = 50;

  return (
    <div className="space-y-4">
      <PhysGuide type="angular_momentum" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{tr('reset')}</VizButton>} />
      <svg viewBox="0 0 420 280" className="h-auto w-full" role="img" aria-label="Momento angular">
        <circle cx={ox} cy={oy} r={18} fill={MUTED} />
        {[0, Math.PI].map((off) => (
          <g key={off}>
            <line x1={ox} y1={oy} x2={ox + r * S * Math.cos(th + off)} y2={oy + r * S * Math.sin(th + off)} stroke={ACCENT} strokeWidth={3} />
            <circle cx={ox + r * S * Math.cos(th + off)} cy={oy + r * S * Math.sin(th + off)} r={10} fill={ORANGE} />
          </g>
        ))}
      </svg>
      <PhysStatus id={uid}>
        {tauOn ? `τ ≠ 0 · L = ${present(L)}` : `L = I ω = ${present(L)} · ω = ${present(omega)} rad/s`}
      </PhysStatus>
      {mode === 'tau_dL' ? <ToggleRow label="Aplicar torque externo" checked={tauOn} onChange={setTauOn} /> : null}
      <ControlsStack>
        <SliderRow label="r (m)" value={r} min={0.5} max={2.4} step={0.05} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

export function AngularMomentumViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'L_Iomega' ? <LIomegaMode mode={mode} /> : <GeneralAngularMode mode={mode} />}
    </VizPanel>
  );
}
