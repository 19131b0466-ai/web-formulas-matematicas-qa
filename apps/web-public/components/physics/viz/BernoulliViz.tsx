'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatFlowRate } from './physFormat';
import { volumetricFlow } from './physLote1Math';
import { bernoulliHead } from './physLote3Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

function FlowRateMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.flu007');
  const uid = useId();
  const [A, setA] = useState(0.04);
  const [v, setV] = useState(0.5);
  const Q = volumetricFlow(A, v);
  const volW = Math.min(180, A * 4000);
  const presets = [
    { id: '2v', label: tr('preset2v'), A, v: v * 2 },
    { id: '2A', label: tr('preset2A'), A: A * 2, v },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="bernoulli" mode={mode} />
      <PhysPresets items={presets.map((p) => ({ id: p.id, label: p.label, onSelect: () => { setA(p.A); setV(p.v); } }))} />
      <svg viewBox="0 0 420 180" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={60} y={70} width={300} height={40} fill={ACCENT} fillOpacity={0.12} stroke={MUTED} />
        <rect x={60} y={70} width={volW} height={40} fill={TEAL} fillOpacity={0.35} stroke={TEAL} />
        <text x={70} y={62} fontSize={11} fill={TEAL}>A</text>
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={i} cx={80 + i * 45 + (v * 8) % 20} cy={90} r={4} fill={ORANGE} />
        ))}
        <text x={300} y={62} fontSize={11} fill={ORANGE}>v</text>
        <text x={200} y={140} textAnchor="middle" fontSize={11} fill={MUTED}>
          {tr('volume1s', { vol: present(A * v) })}
        </text>
      </svg>
      <PhysResult primary={`Q = A v = ${formatFlowRate(Q)}`} secondary={tr('derived', { A: present(A), v: present(v) })} />
      <PhysStatus id={uid}>{tr('status', { Q: formatFlowRate(Q) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('area', { A: present(A) })} ariaLabel={tr('areaLabel')} value={A} min={0.01} max={0.08} step={0.001} onChange={setA} />
        <SliderRow label={tr('speed', { v: present(v) })} ariaLabel={tr('speedLabel')} value={v} min={0.1} max={2} step={0.05} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function FullBernoulliMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l3.flu009');
  const uid = useId();
  const [A1, setA1] = useState(0.04);
  const [A2, setA2] = useState(0.015);
  const [Q, setQ] = useState(0.02);
  const [dy, setDy] = useState(0.4);
  const [rho, setRho] = useState(1000);
  const v1 = Q / A1;
  const v2 = Q / A2;
  const P1 = 1.5e5;
  const y1 = 0;
  const y2 = dy;
  const P2 = P1 + 0.5 * rho * v1 * v1 + rho * G * y1 - (0.5 * rho * v2 * v2 + rho * G * y2);
  const B1 = bernoulliHead(P1, rho, v1, y1);
  const B2 = bernoulliHead(P2, rho, v2, y2);

  return (
    <div className="space-y-4">
      <PhysGuide type="bernoulli" mode={mode} />
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <path
          d={`M40,80 h120 v${-20 - A1 * 400} h80 v${40 + dy * 40} h120 v${20 + A2 * 400} h-120 v${-40} h-80 v${20} h-120 z`}
          fill={ACCENT}
          fillOpacity={0.15}
          stroke={MUTED}
        />
        <text x={70} y={30} fontSize={11} fill={TEAL}>1</text>
        <text x={300} y={30} fontSize={11} fill={ORANGE}>2</text>
        <text x={60} y={150} fontSize={10} fill={MUTED}>P1={present(P1)} · v1={present(v1)}</text>
        <text x={220} y={150} fontSize={10} fill={MUTED}>P2={present(P2)} · v2={present(v2)}</text>
      </svg>
      <PhysResult
        primary={tr('constant', { B: present(B1) })}
        secondary={tr('compare', { B1: present(B1), B2: present(B2), drift: present(Math.abs(B1 - B2)) })}
      />
      <PhysStatus id={uid}>{tr('status', { v1: present(v1), v2: present(v2), P2: present(P2) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label="A1 (m²)" value={A1} min={0.01} max={0.08} step={0.001} onChange={setA1} />
        <SliderRow label="A2 (m²)" value={A2} min={0.005} max={0.06} step={0.001} onChange={setA2} />
        <SliderRow label="Q (m³/s)" value={Q} min={0.005} max={0.05} step={0.001} onChange={setQ} />
        <SliderRow label="Δy (m)" value={dy} min={-1} max={2} step={0.05} onChange={setDy} />
        <SliderRow label="ρ" value={rho} min={800} max={1200} step={10} onChange={setRho} />
      </ControlsStack>
    </div>
  );
}

function OtherBernoulliMode({ mode }: { mode: string }) {
  const uid = useId();
  const tor = mode === 'torricelli';
  const [A1, setA1] = useState(0.04);
  const [A2, setA2] = useState(0.015);
  const [Q, setQ] = useState(0.02);
  const [dy, setDy] = useState(0.4);
  const [rho, setRho] = useState(1000);
  const [h, setH] = useState(2.5);
  const v1 = Q / A1;
  const v2 = Q / A2;
  const P1 = 1.5e5;
  const P2 = P1 + 0.5 * rho * v1 * v1 + rho * G * 0 - (0.5 * rho * v2 * v2 + rho * G * dy);
  const vTor = Math.sqrt(2 * G * h);
  const B = P1 + 0.5 * rho * v1 * v1;

  let status = `P+½ρv²+ρgy = ${present(B)} · v1=${present(v1)} v2=${present(v2)} · P2=${present(P2)} Pa`;
  if (mode === 'continuity') status = `A1 v1 = A2 v2 = ${present(A1 * v1)}`;
  if (mode === 'mass_flow') status = `ṁ = ρ Q = ${present(rho * Q)} kg/s`;
  if (tor) status = `v = √(2 g h) = ${present(vTor)} m/s`;

  return (
    <div className="space-y-4">
      <PhysGuide type="bernoulli" mode={mode} />
      {tor ? (
        <svg viewBox="0 0 420 200" className="h-auto w-full" role="img" aria-label="Torricelli">
          <rect x={80} y={30} width={140} height={140} fill={TEAL} fillOpacity={0.2} stroke={MUTED} />
          <rect x={80} y={30 + (8 - h) * 12} width={140} height={h * 12} fill={TEAL} fillOpacity={0.4} />
          <circle cx={260} cy={30 + (8 - h) * 12 + h * 12} r={6} fill={ORANGE} />
        </svg>
      ) : (
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Tubo de Bernoulli">
          <path
            d={`M40,80 h120 v${-20 - A1 * 400} h80 v${40 + dy * 40} h120 v${20 + A2 * 400} h-120 v${-40} h-80 v${20} h-120 z`}
            fill={ACCENT}
            fillOpacity={0.15}
            stroke={MUTED}
          />
          <text x={70} y={30} fontSize={11} fill={TEAL}>1</text>
          <text x={300} y={30} fontSize={11} fill={ORANGE}>2</text>
        </svg>
      )}
      <PhysStatus id={uid}>{status} · estacionario, incompresible, no viscoso</PhysStatus>
      <ControlsStack>
        {tor ? (
          <SliderRow label="h (m)" value={h} min={0.3} max={6} step={0.1} onChange={setH} />
        ) : (
          <>
            <SliderRow label="A1 (m²)" value={A1} min={0.01} max={0.08} step={0.001} onChange={setA1} />
            <SliderRow label="A2 (m²)" value={A2} min={0.005} max={0.06} step={0.001} onChange={setA2} />
            <SliderRow label="Q (m³/s)" value={Q} min={0.005} max={0.05} step={0.001} onChange={setQ} />
            <SliderRow label="Δy (m)" value={dy} min={-1} max={2} step={0.05} onChange={setDy} />
            <SliderRow label="ρ" value={rho} min={800} max={1200} step={10} onChange={setRho} />
          </>
        )}
      </ControlsStack>
    </div>
  );
}

export function BernoulliViz({ mode }: { mode?: string }) {
  if (mode === 'Q') {
    return <VizPanel><FlowRateMode mode={mode} /></VizPanel>;
  }
  if (!mode) {
    return <VizPanel><FullBernoulliMode mode={mode} /></VizPanel>;
  }
  return <VizPanel><OtherBernoulliMode mode={mode} /></VizPanel>;
}
