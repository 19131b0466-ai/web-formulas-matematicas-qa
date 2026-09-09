'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import {
  branchCurrent,
  circuitCurrent,
  parallelResistance,
  seriesResistance,
  voltageDrop,
} from './physLote7Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, EnergyBars, MUTED, ORANGE, TEAL } from './physPlot';

function OhmMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [R1, setR1] = useState(10);
  const [emf, setEmf] = useState(12);
  const I = circuitCurrent(emf, R1);

  return (
    <div className="space-y-4">
      <PhysGuide type="resistor_network" mode={mode} />
      <PhysStatus id={uid}>V = I R · I = ε/R = {present(I)} A</PhysStatus>
      <ControlsStack>
        <SliderRow label="ε (V)" value={emf} min={1} max={24} step={0.5} onChange={setEmf} />
        <SliderRow label="R (Ω)" value={R1} min={1} max={50} step={0.5} onChange={setR1} />
      </ControlsStack>
    </div>
  );
}

function ResistivityMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [L, setL] = useState(0.5);
  const [A, setA] = useState(1e-6);
  const [rho, setRho] = useState(1.7e-8);
  const Req = (rho * L) / A;

  return (
    <div className="space-y-4">
      <PhysGuide type="resistor_network" mode={mode} />
      <PhysStatus id={uid}>R = ρ L/A = {present(Req)} Ω</PhysStatus>
      <ControlsStack>
        <SliderRow label="ρ" value={rho} min={1e-8} max={1e-6} step={1e-9} onChange={setRho} />
        <SliderRow label="L (m)" value={L} min={0.1} max={2} step={0.05} onChange={setL} />
        <SliderRow label="A (m²)" value={A} min={2e-7} max={4e-6} step={1e-7} onChange={setA} />
      </ControlsStack>
    </div>
  );
}

function SeriesMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l7.ele014');
  const uid = useId();
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(20);
  const [emf, setEmf] = useState(12);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  useRafPlay(playing, setPhase, { min: 0, max: 1, speed: 0.8, loop: true });
  const Req = seriesResistance(R1, R2);
  const I = circuitCurrent(emf, Req);
  const V1 = voltageDrop(I, R1);
  const V2 = voltageDrop(I, R2);
  const dash = `${8 + phase * 20} 12`;

  const presets = [{ id: 'eq', label: tr('equal'), onSelect: () => { setR1(15); setR2(15); } }];

  return (
    <div className="space-y-4">
      <PhysGuide type="resistor_network" mode={mode} />
      <PhysPresets items={presets} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <svg viewBox="0 0 420 150" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={30} y={55} width={24} height={40} fill={ORANGE} />
        <text x={18} y={48} fontSize={11} fill={ORANGE}>ε</text>
        <line x1={54} y1={75} x2={110} y2={75} stroke={MUTED} strokeWidth={2.5} strokeDasharray={dash} />
        <rect x={110} y={63} width={70} height={24} fill={ACCENT} fillOpacity={0.35} stroke={MUTED} />
        <text x={135} y={79} fontSize={11}>R1</text>
        <line x1={180} y1={75} x2={230} y2={75} stroke={MUTED} strokeWidth={2.5} strokeDasharray={dash} />
        <rect x={230} y={63} width={70} height={24} fill={TEAL} fillOpacity={0.35} stroke={MUTED} />
        <text x={255} y={79} fontSize={11}>R2</text>
        <line x1={300} y1={75} x2={360} y2={75} stroke={MUTED} strokeWidth={2.5} strokeDasharray={dash} />
        <line x1={360} y1={75} x2={360} y2={110} stroke={MUTED} strokeWidth={2} />
        <line x1={360} y1={110} x2={30} y2={110} stroke={MUTED} strokeWidth={2} />
        <line x1={30} y1={110} x2={30} y2={95} stroke={MUTED} strokeWidth={2} />
        <text x={190} y={62} fontSize={10} fill={ORANGE}>I = {present(I)} A</text>
      </svg>
      <EnergyBars items={[
        { label: 'V1', value: V1, color: ACCENT },
        { label: 'V2', value: V2, color: TEAL },
        { label: 'ε', value: emf, color: ORANGE },
      ]} />
      <PhysResult
        primary={tr('req', { Req: present(Req), I: present(I) })}
        secondary={tr('drops', { V1: present(V1), V2: present(V2) })}
      />
      <PhysStatus id={uid}>{tr('status', { Req: present(Req), I: present(I), V1: present(V1), V2: present(V2) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="ε (V)" value={emf} min={1} max={24} step={0.5} onChange={setEmf} />
        <SliderRow label="R1 (Ω)" value={R1} min={1} max={50} step={0.5} onChange={setR1} />
        <SliderRow label="R2 (Ω)" value={R2} min={1} max={50} step={0.5} onChange={setR2} />
      </ControlsStack>
    </div>
  );
}

function ParallelMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l7.ele015');
  const uid = useId();
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(20);
  const [emf, setEmf] = useState(12);
  const [compareSeries, setCompareSeries] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [phase, setPhase] = useState(0);
  useRafPlay(playing, setPhase, { min: 0, max: 1, speed: 0.8, loop: true });
  const Req = parallelResistance(R1, R2);
  const ReqSeries = seriesResistance(R1, R2);
  const V = emf;
  const I1 = branchCurrent(V, R1);
  const I2 = branchCurrent(V, R2);
  const Itotal = I1 + I2;
  const w1 = 1.5 + (I1 / Math.max(Itotal, 0.01)) * 4;
  const w2 = 1.5 + (I2 / Math.max(Itotal, 0.01)) * 4;
  const dash = `${8 + phase * 20} 12`;

  const presets = [{ id: 'eq', label: tr('equal'), onSelect: () => { setR1(12); setR2(12); } }];

  return (
    <div className="space-y-4">
      <PhysGuide type="resistor_network" mode={mode} />
      <PhysPresets items={presets} />
      <ButtonRow>
        <VizButton active={!compareSeries} onClick={() => setCompareSeries(false)}>{tr('parallelOnly')}</VizButton>
        <VizButton active={compareSeries} onClick={() => setCompareSeries(true)}>{tr('compareSeries')}</VizButton>
      </ButtonRow>
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={30} y={70} width={24} height={40} fill={ORANGE} />
        <line x1={54} y1={90} x2={100} y2={90} stroke={MUTED} strokeWidth={2.5} strokeDasharray={dash} />
        <line x1={100} y1={90} x2={100} y2={40} stroke={MUTED} strokeWidth={2} />
        <line x1={100} y1={40} x2={300} y2={40} stroke={MUTED} strokeWidth={2} />
        <rect x={150} y={28} width={70} height={24} fill={ACCENT} fillOpacity={0.35} stroke={MUTED} />
        <line x1={185} y1={52} x2={185} y2={90} stroke={MUTED} strokeWidth={w1} strokeDasharray={dash} />
        <rect x={230} y={88} width={70} height={24} fill={TEAL} fillOpacity={0.35} stroke={MUTED} />
        <line x1={265} y1={52} x2={265} y2={88} stroke={MUTED} strokeWidth={w2} strokeDasharray={dash} />
        <line x1={300} y1={40} x2={300} y2={90} stroke={MUTED} strokeWidth={2} />
        <line x1={300} y1={90} x2={340} y2={90} stroke={MUTED} strokeWidth={2.5} strokeDasharray={dash} />
        <text x={120} y={24} fontSize={10} fill={ORANGE}>V = {present(V)} V</text>
        <text x={150} y={74} fontSize={10} fill={ACCENT}>I1</text>
        <text x={240} y={118} fontSize={10} fill={TEAL}>I2</text>
      </svg>
      <PhysResult
        primary={tr('req', { Req: present(Req), Itotal: present(Itotal) })}
        secondary={compareSeries ? tr('vsSeries', { ReqS: present(ReqSeries), minR: present(Math.min(R1, R2)) }) : tr('branches', { I1: present(I1), I2: present(I2) })}
      />
      <PhysStatus id={uid}>{tr('status', { Req: present(Req), I1: present(I1), I2: present(I2), Itotal: present(Itotal) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="ε (V)" value={emf} min={1} max={24} step={0.5} onChange={setEmf} />
        <SliderRow label="R1 (Ω)" value={R1} min={1} max={50} step={0.5} onChange={setR1} />
        <SliderRow label="R2 (Ω)" value={R2} min={1} max={50} step={0.5} onChange={setR2} />
      </ControlsStack>
    </div>
  );
}

export function ResistorNetworkViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'ohm' ? (
        <OhmMode mode={mode} />
      ) : mode === 'resistivity' ? (
        <ResistivityMode mode={mode} />
      ) : mode === 'parallel' ? (
        <ParallelMode mode={mode} />
      ) : (
        <SeriesMode mode={mode} />
      )}
    </VizPanel>
  );
}
