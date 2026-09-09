'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { clamp, elastic1D, inelastic1D } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { totalKineticEnergy, totalLinearMomentum } from './physLote3Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

function useCollisionAnim() {
  const [m1, setM1] = useState(2);
  const [m2, setM2] = useState(2);
  const [v1i, setV1i] = useState(4);
  const [v2i, setV2i] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tCol = 1.2;
  const tMax = 2.8;
  useRafPlay(playing, setT, { min: 0, max: tMax, speed: 1, loop: true });
  const hit = t >= tCol;
  return {
    m1, setM1, m2, setM2, v1i, setV1i, v2i, setV2i, t, setT, playing, setPlaying, tCol, tMax, hit,
  };
}

function CollisionScene({
  m1, m2, v1i, v2i, v1f, v2f, t, tCol, hit, aria,
}: {
  m1: number; m2: number; v1i: number; v2i: number; v1f: number; v2f: number;
  t: number; tCol: number; hit: boolean; aria: string;
}) {
  const x1 = clamp(40 + v1i * 28 * Math.min(t, tCol) + (hit ? v1f * 28 * (t - tCol) : 0), 20, 250);
  const x2 = clamp(220 + v2i * 28 * Math.min(t, tCol) + (hit ? v2f * 28 * (t - tCol) : 0), 80, 380);
  const stuck = v1f === v2f && hit;
  const x2draw = stuck ? x1 + 38 : Math.max(x1 + 38, x2);

  return (
    <svg viewBox="0 0 420 90" className="h-auto w-full" role="img" aria-label={aria}>
      <line x1={16} y1={60} x2={404} y2={60} stroke={MUTED} />
      <rect x={x1} y={36} width={36} height={24} fill={ACCENT} />
      <rect x={x2draw} y={36} width={36} height={24} fill={TEAL} />
    </svg>
  );
}

function ElasticMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.mom007');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const anim = useCollisionAnim();
  const { m1, m2, v1i, v2i, t, tCol, hit, playing, setPlaying, setT } = anim;
  const { v1f, v2f } = elastic1D(m1, m2, v1i, v2i);
  const pi = totalLinearMomentum(m1, v1i, m2, v2i);
  const pf = totalLinearMomentum(m1, v1f, m2, v2f);
  const Ki = totalKineticEnergy(m1, v1i, m2, v2i);
  const Kf = totalKineticEnergy(m1, v1f, m2, v2f);
  const presets = [
    { id: 'swap', label: tr('presetSwap'), m1: 2, m2: 2, v1i: 4, v2i: 0 },
    { id: 'bounce', label: tr('presetBounce'), m1: 1, m2: 3, v1i: 5, v2i: -1 },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="collision_1d" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { anim.setM1(p.m1); anim.setM2(p.m2); anim.setV1i(p.v1i); anim.setV2i(p.v2i); } }))} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <CollisionScene m1={m1} m2={m2} v1i={v1i} v2i={v2i} v1f={v1f} v2f={v2f} t={t} tCol={tCol} hit={hit} aria={tr('aria')} />
      <EnergyBars items={[
        { label: 'K tot', value: hit ? Kf : Ki, color: TEAL },
        { label: 'p tot', value: hit ? pf : pi, color: ORANGE },
      ]} />
      <PhysResult primary={tr('kConserved', { Ki: present(Ki), Kf: present(Kf) })} secondary={tr('velocities', { v1f: present(v1f), v2f: present(v2f) })} />
      <PhysStatus id={uid}>{tr('status', { Ki: present(Ki), Kf: present(Kf), pi: present(pi), pf: present(pf) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m1" value={m1} min={0.5} max={8} step={0.1} onChange={anim.setM1} />
        <SliderRow label="m2" value={m2} min={0.5} max={8} step={0.1} onChange={anim.setM2} />
        <SliderRow label="v1i" value={v1i} min={-6} max={8} step={0.1} onChange={anim.setV1i} />
        <SliderRow label="v2i" value={v2i} min={-6} max={8} step={0.1} onChange={anim.setV2i} />
      </ControlsStack>
    </div>
  );
}

function ConservationMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.mom005');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const anim = useCollisionAnim();
  const [elastic, setElastic] = useState(true);
  const { m1, m2, v1i, v2i, t, tCol, hit, playing, setPlaying, setT } = anim;
  const { v1f, v2f } = elastic
    ? elastic1D(m1, m2, v1i, v2i)
    : { v1f: inelastic1D(m1, m2, v1i, v2i), v2f: inelastic1D(m1, m2, v1i, v2i) };
  const pi = totalLinearMomentum(m1, v1i, m2, v2i);
  const pf = totalLinearMomentum(m1, v1f, m2, v2f);
  const p1i = m1 * v1i;
  const p2i = m2 * v2i;
  const p1f = m1 * v1f;
  const p2f = m2 * v2f;

  return (
    <div className="space-y-4">
      <PhysGuide type="collision_1d" mode={mode} />
      <ButtonRow>
        <VizButton active={elastic} onClick={() => setElastic(true)}>{tr('elastic')}</VizButton>
        <VizButton active={!elastic} onClick={() => setElastic(false)}>{tr('inelastic')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <CollisionScene m1={m1} m2={m2} v1i={v1i} v2i={v2i} v1f={v1f} v2f={v2f} t={t} tCol={tCol} hit={hit} aria={tr('aria')} />
      <EnergyBars items={[
        { label: 'p1', value: hit ? p1f : p1i, color: ACCENT },
        { label: 'p2', value: hit ? p2f : p2i, color: TEAL },
        { label: 'p tot', value: hit ? pf : pi, color: ORANGE },
      ]} />
      <PhysResult primary={tr('conserved', { pi: present(pi), pf: present(pf) })} secondary={elastic ? tr('elastic') : tr('inelastic')} />
      <PhysStatus id={uid}>{tr('status', { p1i: present(p1i), p2i: present(p2i), p1f: present(p1f), p2f: present(p2f) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m1" value={m1} min={0.5} max={8} step={0.1} onChange={anim.setM1} />
        <SliderRow label="m2" value={m2} min={0.5} max={8} step={0.1} onChange={anim.setM2} />
        <SliderRow label="v1i" value={v1i} min={-6} max={8} step={0.1} onChange={anim.setV1i} />
        <SliderRow label="v2i" value={v2i} min={-6} max={8} step={0.1} onChange={anim.setV2i} />
      </ControlsStack>
    </div>
  );
}

function InelasticMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.mom006');
  const trBase = useTranslations('vizFisica');
  const uid = useId();
  const anim = useCollisionAnim();
  const { m1, m2, v1i, v2i, t, tCol, hit, playing, setPlaying, setT } = anim;
  const vf = inelastic1D(m1, m2, v1i, v2i);
  const pi = totalLinearMomentum(m1, v1i, m2, v2i);
  const pf = totalLinearMomentum(m1, vf, m2, vf);
  const Ki = totalKineticEnergy(m1, v1i, m2, v2i);
  const Kf = totalKineticEnergy(m1, vf, m2, vf);
  const Q = Ki - Kf;

  return (
    <div className="space-y-4">
      <PhysGuide type="collision_1d" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
      <CollisionScene m1={m1} m2={m2} v1i={v1i} v2i={v2i} v1f={vf} v2f={vf} t={t} tCol={tCol} hit={hit} aria={tr('aria')} />
      <EnergyBars items={[
        { label: 'K tot', value: hit ? Kf : Ki, color: TEAL },
        { label: 'Q', value: hit ? Q : 0, color: MUTED },
        { label: 'p tot', value: hit ? pf : pi, color: ORANGE },
      ]} />
      <PhysResult primary={tr('oneVf', { vf: present(vf) })} secondary={tr('kLost', { Ki: present(Ki), Kf: present(Kf), Q: present(Q) })} />
      <PhysStatus id={uid}>{tr('status', { vf: present(vf), pi: present(pi), pf: present(pf) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="m1" value={m1} min={0.5} max={8} step={0.1} onChange={anim.setM1} />
        <SliderRow label="m2" value={m2} min={0.5} max={8} step={0.1} onChange={anim.setM2} />
        <SliderRow label="v1i" value={v1i} min={-6} max={8} step={0.1} onChange={anim.setV1i} />
        <SliderRow label="v2i" value={v2i} min={-6} max={8} step={0.1} onChange={anim.setV2i} />
      </ControlsStack>
    </div>
  );
}

export function Collision1DViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'conservation' ? <ConservationMode mode={mode} /> :
        mode === 'inelastic' ? <InelasticMode mode={mode} /> :
        <ElasticMode mode={mode} />}
    </VizPanel>
  );
}
