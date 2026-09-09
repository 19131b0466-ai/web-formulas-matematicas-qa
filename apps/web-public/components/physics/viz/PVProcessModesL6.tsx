'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { R_GAS } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatPressure, formatValue } from './physFormat';
import {
  adiabaticFinalTemperature,
  adiabaticPressure,
  workIsothermal,
  workIsobar,
} from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

function PistonSketch({ V, T, label }: { V: number; T: number; label?: string }) {
  const pistonY = 40 + (0.11 - V) * 900;
  const agitation = Math.min(1, T / 400);
  return (
    <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label={label ?? 'Pistón'}>
      <rect x={120} y={30} width={180} height={150} fill={MUTED} fillOpacity={0.15} stroke={MUTED} />
      <rect x={125} y={pistonY} width={170} height={150 - pistonY + 30} fill={TEAL} fillOpacity={0.25} stroke={TEAL} />
      <line x1={120} y1={pistonY} x2={300} y2={pistonY} stroke={ORANGE} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => (
        <circle
          key={i}
          cx={140 + (i % 4) * 40 + Math.sin(i * 2) * agitation * 8}
          cy={pistonY + 20 + Math.floor(i / 4) * 30 + Math.cos(i) * agitation * 6}
          r={3 + agitation * 2}
          fill={ACCENT}
          opacity={0.7}
        />
      ))}
    </svg>
  );
}

export function WorkMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ter015');
  const uid = useId();
  const [proc, setProc] = useState<'isobar' | 'curve'>('isobar');
  const [Pi, setPi] = useState(1.2e5);
  const [Vi, setVi] = useState(0.04);
  const [Vf, setVf] = useState(0.08);
  const [Ti, setTi] = useState(300);
  const Pcurve = (V: number) => Pi * Math.exp(-2 * (V - Vi));
  const P = proc === 'isobar' ? () => Pi : Pcurve;
  const W = proc === 'isobar' ? workIsobar(Pi, Vi, Vf) : integrate(P, Vi, Vf);
  const expanding = Vf > Vi;
  const plot = makePlot({ xMin: 0.02, xMax: 0.12, yMin: 0, yMax: Pi * 1.5, H: 150 });

  const presets = [
    { id: 'iso', label: tr('isobar'), onSelect: () => setProc('isobar') },
    { id: 'var', label: tr('variable'), onSelect: () => setProc('curve') },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="pv_process" mode={mode} />
      <PhysPresets items={presets} />
      <ChartFrame plot={plot} xLabel="V (m³)" yLabel="P (Pa)" title={tr('pvTitle')}>
        <path d={areaToAxis(P, Vi, Vf, plot)} fill={ACCENT} fillOpacity={0.22} />
        <path d={fnPath(P, 0.025, 0.11, plot)} fill="none" stroke={TEAL} strokeWidth={1.8} />
        <circle cx={plot.X(Vi)} cy={plot.Y(P(Vi))} r={5} fill={ORANGE} />
        <circle cx={plot.X(Vf)} cy={plot.Y(P(Vf))} r={5} fill={ACCENT} />
        <text x={plot.X(Vi) + 4} y={plot.Y(P(Vi)) - 6} fontSize={10} fill={ORANGE}>i</text>
        <text x={plot.X(Vf) + 4} y={plot.Y(P(Vf)) - 6} fontSize={10} fill={ACCENT}>f</text>
      </ChartFrame>
      <PistonSketch V={Vf} T={Ti} label={tr('aria')} />
      <PhysResult
        primary={tr('work', { W: formatValue(W, 'J') })}
        secondary={tr('conv', { sign: expanding ? tr('byGas') : tr('onGas') })}
      />
      <PhysStatus id={uid}>{tr('status', { W: present(W), proc: proc === 'isobar' ? tr('isobar') : tr('variable') })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('Pi')} value={Pi} min={8e4} max={2e5} step={1000} onChange={setPi} />
        <SliderRow label={tr('Vi')} value={Vi} min={0.025} max={0.07} step={0.001} onChange={setVi} />
        <SliderRow label={tr('Vf')} value={Vf} min={0.03} max={0.11} step={0.001} onChange={setVf} />
      </ControlsStack>
    </div>
  );
}

export function IsothermalMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ter017');
  const uid = useId();
  const [n, setN] = useState(1);
  const [T, setT] = useState(300);
  const [Vi, setVi] = useState(0.04);
  const [Vf, setVf] = useState(0.08);
  const [showRef, setShowRef] = useState(true);
  const Pi = (n * R_GAS * T) / Vi;
  const Pf = (n * R_GAS * T) / Vf;
  const Piso = (V: number) => (n * R_GAS * T) / V;
  const Pref = (V: number) => (n * R_GAS * (T + 80)) / V;
  const W = workIsothermal(n, T, Vi, Vf);
  const plot = makePlot({ xMin: 0.02, xMax: 0.12, yMin: 0, yMax: Pi * 1.5, H: 150 });

  const presets = [
    { id: 'exp', label: tr('expand'), onSelect: () => { setVi(0.04); setVf(0.09); } },
    { id: 'comp', label: tr('compress'), onSelect: () => { setVi(0.09); setVf(0.04); } },
    { id: 'same', label: tr('sameV'), onSelect: () => setVf(Vi) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="pv_process" mode={mode} />
      <PhysPresets items={presets} />
      <ButtonRow>
        <VizButton active={showRef} onClick={() => setShowRef(true)}>{tr('refOn')}</VizButton>
        <VizButton active={!showRef} onClick={() => setShowRef(false)}>{tr('refOff')}</VizButton>
      </ButtonRow>
      <ChartFrame plot={plot} xLabel="V (m³)" yLabel="P (Pa)" title={tr('pvTitle')}>
        {showRef ? <path d={fnPath(Pref, 0.025, 0.11, plot)} fill="none" stroke={MUTED} strokeDasharray="5 4" strokeWidth={1.2} /> : null}
        <path d={areaToAxis(Piso, Vi, Vf, plot)} fill={ACCENT} fillOpacity={0.2} />
        <path d={fnPath(Piso, 0.025, 0.11, plot)} fill="none" stroke={TEAL} strokeWidth={1.8} />
        <circle cx={plot.X(Vi)} cy={plot.Y(Pi)} r={5} fill={ORANGE} />
        <circle cx={plot.X(Vf)} cy={plot.Y(Pf)} r={5} fill={ACCENT} />
      </ChartFrame>
      <PistonSketch V={Vf} T={T} label={tr('aria')} />
      <PhysResult
        primary={tr('isothermal', { T: present(T), W: formatValue(W, 'J') })}
        secondary={tr('deltaU', { dU: '0' })}
      />
      <PhysStatus id={uid}>{tr('status', { P0: formatPressure(Pi), Pf: formatPressure(Pf), W: present(W) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('n')} value={n} min={0.5} max={3} step={0.1} onChange={setN} />
        <SliderRow label={tr('T')} value={T} min={250} max={500} step={5} onChange={setT} />
        <SliderRow label={tr('Vi')} value={Vi} min={0.025} max={0.1} step={0.001} onChange={setVi} />
        <SliderRow label={tr('Vf')} value={Vf} min={0.025} max={0.11} step={0.001} onChange={setVf} />
      </ControlsStack>
    </div>
  );
}

export function AdiabaticMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ter018');
  const uid = useId();
  const [gamma, setGamma] = useState(5 / 3);
  const [Ti, setTi] = useState(300);
  const [Vi, setVi] = useState(0.04);
  const [Vf, setVf] = useState(0.08);
  const [n, setN] = useState(1);
  const Pi = (n * R_GAS * Ti) / Vi;
  const Pad = (V: number) => adiabaticPressure(Pi, Vi, V, gamma);
  const Piso = (V: number) => (n * R_GAS * Ti) / V;
  const Tf = adiabaticFinalTemperature(Ti, Vi, Vf, gamma);
  const W = integrate(Pad, Vi, Vf);
  const dU = 1.5 * n * R_GAS * (Tf - Ti);
  const plot = makePlot({ xMin: 0.02, xMax: 0.12, yMin: 0, yMax: Pi * 1.6, H: 150 });

  const presets = [
    { id: 'mono', label: tr('mono'), onSelect: () => setGamma(5 / 3) },
    { id: 'di', label: tr('di'), onSelect: () => setGamma(7 / 5) },
    { id: 'exp', label: tr('expand'), onSelect: () => { setVi(0.04); setVf(0.09); } },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="pv_process" mode={mode} />
      <PhysPresets items={presets} />
      <ChartFrame plot={plot} xLabel="V (m³)" yLabel="P (Pa)" title={tr('pvTitle')}>
        <path d={fnPath(Piso, 0.025, 0.11, plot)} fill="none" stroke={MUTED} strokeDasharray="5 4" strokeWidth={1.2} />
        <path d={areaToAxis(Pad, Vi, Vf, plot)} fill={ACCENT} fillOpacity={0.2} />
        <path d={fnPath(Pad, 0.025, 0.11, plot)} fill="none" stroke={TEAL} strokeWidth={1.8} />
        <circle cx={plot.X(Vi)} cy={plot.Y(Pi)} r={5} fill={ORANGE} />
        <circle cx={plot.X(Vf)} cy={plot.Y(Pad(Vf))} r={5} fill={ACCENT} />
      </ChartFrame>
      <PistonSketch V={Vf} T={Tf} label={tr('aria')} />
      <PhysResult
        primary={tr('adiabatic', { gamma: present(gamma), Q: '0' })}
        secondary={tr('energy', { dU: present(dU), W: present(W), Tf: present(Tf) })}
      />
      <PhysStatus id={uid}>{tr('status', { Ti: present(Ti), Tf: present(Tf), W: present(W) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="γ" value={gamma} min={1.2} max={1.7} step={0.01} onChange={setGamma} />
        <SliderRow label={tr('Ti')} value={Ti} min={250} max={500} step={5} onChange={setTi} />
        <SliderRow label={tr('Vi')} value={Vi} min={0.025} max={0.07} step={0.001} onChange={setVi} />
        <SliderRow label={tr('Vf')} value={Vf} min={0.03} max={0.11} step={0.001} onChange={setVf} />
      </ControlsStack>
    </div>
  );
}
