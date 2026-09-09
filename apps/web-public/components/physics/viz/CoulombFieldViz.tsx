'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { formatValue } from './physFormat';
import {
  coulombForceMagnitude,
  coulombIsAttractive,
  electricFieldMagnitude,
  forceOnCharge,
} from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, ORANGE, TEAL, fnPath, makePlot } from './physPlot';

function UniformMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [d, setD] = useState(0.04);
  const [Euni, setEuni] = useState(200);
  const dV = Euni * d;

  return (
    <div className="space-y-4">
      <PhysGuide type="coulomb_field" mode={mode} />
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Campo uniforme entre placas">
        <line x1={80} y1={30} x2={340} y2={30} stroke={ACCENT} strokeWidth={6} />
        <line x1={80} y1={30 + d * 1200} x2={340} y2={30 + d * 1200} stroke={TEAL} strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={100 + i * 50} y1={40} x2={100 + i * 50} y2={30 + d * 1200 - 10} stroke={ORANGE} />
        ))}
      </svg>
      <PhysStatus id={uid}>|ΔV| = E d = {present(dV)} V</PhysStatus>
      <ControlsStack>
        <SliderRow label="E (N/C)" value={Euni} min={50} max={500} step={5} onChange={setEuni} />
        <SliderRow label="d (m)" value={d} min={0.01} max={0.08} step={0.005} onChange={setD} />
      </ControlsStack>
    </div>
  );
}

function CoulombLawMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ele002');
  const uid = useId();
  const [q1, setQ1] = useState(2);
  const [q2, setQ2] = useState(-1);
  const [r, setR] = useState(0.12);
  const Q1 = q1 * 1e-6;
  const Q2 = q2 * 1e-6;
  const F = coulombForceMagnitude(Q1, Q2, r);
  const attract = coulombIsAttractive(Q1, Q2);
  const plot = makePlot({ xMin: 0.05, xMax: 0.35, yMin: 0, yMax: F * 2.2, H: 120 });
  const Fof = (rr: number) => coulombForceMagnitude(Q1, Q2, rr);
  const cx1 = 120;
  const cx2 = 120 + r * 800;

  const presets = [
    { id: 'eq', label: tr('equal'), onSelect: () => { setQ1(2); setQ2(2); } },
    { id: 'opp', label: tr('opposite'), onSelect: () => { setQ1(2); setQ2(-2); } },
    { id: 'dbl', label: tr('doubleQ'), onSelect: () => { setQ1(4); setQ2(1); } },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="coulomb_field" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 170" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={cx1} cy={80} r={14} fill={q1 >= 0 ? ORANGE : TEAL} />
        <circle cx={cx2} cy={80} r={12} fill={q2 >= 0 ? ORANGE : TEAL} />
        <line x1={cx1 + 16} y1={80} x2={cx2 - 14} y2={80} stroke={ACCENT} strokeWidth={2.5} markerEnd="url(#arrowF)" />
        <line x1={cx2 - 16} y1={92} x2={cx1 + 14} y2={92} stroke={ACCENT} strokeWidth={2.5} markerEnd="url(#arrowF)" opacity={0.7} />
        <text x={200} y={68} fontSize={11} fill={attract ? TEAL : ORANGE}>{attract ? tr('attract') : tr('repel')}</text>
        <defs>
          <marker id="arrowF" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill={ACCENT} />
          </marker>
        </defs>
      </svg>
      <ChartFrame plot={plot} xLabel="r (m)" yLabel="F (N)" title={tr('fChart')}>
        <path d={fnPath(Fof, 0.06, 0.32, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(r)} cy={plot.Y(F)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('force', { F: formatValue(F, 'N') })} secondary={tr('inverse')} />
      <PhysStatus id={uid}>{tr('status', { F: present(F), kind: attract ? tr('attract') : tr('repel'), r: present(r) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('q1')} value={q1} min={-4} max={4} step={0.1} onChange={setQ1} />
        <SliderRow label={tr('q2')} value={q2} min={-4} max={4} step={0.1} onChange={setQ2} />
        <SliderRow label={tr('r')} value={r} min={0.05} max={0.3} step={0.01} onChange={setR} />
      </ControlsStack>
    </div>
  );
}

function ElectricFieldMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.ele003');
  const uid = useId();
  const [qSrc, setQSrc] = useState(2);
  const [rObs, setRObs] = useState(0.14);
  const [qTest, setQTest] = useState(1);
  const Q = qSrc * 1e-6;
  const E = electricFieldMagnitude(Q, rObs);
  const dir = qSrc >= 0 ? 1 : -1;
  const Ftest = forceOnCharge(qTest * 1e-6, dir * E);
  const plot = makePlot({ xMin: 0.05, xMax: 0.35, yMin: 0, yMax: E * 2.2, H: 120 });
  const Eof = (rr: number) => electricFieldMagnitude(Q, rr);
  const srcX = 100;
  const obsX = 100 + rObs * 900;

  const presets = [
    { id: 'pos', label: tr('posSource'), onSelect: () => setQSrc(3) },
    { id: 'neg', label: tr('negSource'), onSelect: () => setQSrc(-3) },
  ];

  return (
    <div className="space-y-4">
      <PhysGuide type="coulomb_field" mode={mode} />
      <PhysPresets items={presets} />
      <svg viewBox="0 0 420 170" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <circle cx={srcX} cy={80} r={14} fill={qSrc >= 0 ? ORANGE : TEAL} />
        <circle cx={obsX} cy={80} r={8} fill={MUTED_DOT} stroke={ACCENT} />
        {[1, 2, 3].map((i) => (
          <circle key={i} cx={srcX} cy={80} r={18 + i * 22} fill="none" stroke={TEAL} opacity={0.25} />
        ))}
        <line
          x1={obsX}
          y1={80}
          x2={obsX + dir * 50}
          y2={80}
          stroke={ORANGE}
          strokeWidth={2.5}
          markerEnd="url(#arrowE)"
        />
        <defs>
          <marker id="arrowE" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6" fill={ORANGE} />
          </marker>
        </defs>
        <text x={obsX + dir * 55} y={76} fontSize={11} fill={ORANGE}>E</text>
      </svg>
      <ChartFrame plot={plot} xLabel="r (m)" yLabel="E (N/C)" title={tr('eChart')}>
        <path d={fnPath(Eof, 0.06, 0.32, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={plot.X(rObs)} cy={plot.Y(E)} r={4} fill={ORANGE} />
      </ChartFrame>
      <PhysResult primary={tr('field', { E: formatValue(E, 'N/C') })} secondary={tr('forceTest', { q: present(qTest), F: formatValue(Ftest, 'N') })} />
      <PhysStatus id={uid}>{tr('status', { E: present(E), r: present(rObs) })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('qSource')} value={qSrc} min={-4} max={4} step={0.1} onChange={setQSrc} />
        <SliderRow label={tr('rObs')} value={rObs} min={0.06} max={0.3} step={0.01} onChange={setRObs} />
        <SliderRow label={tr('qTest')} value={qTest} min={-3} max={3} step={0.1} onChange={setQTest} />
      </ControlsStack>
    </div>
  );
}

function ForceOnChargeMode({ mode }: { mode?: string }) {
  const uid = useId();
  const [q1, setQ1] = useState(2);
  const [r, setR] = useState(0.12);
  const [qp, setQp] = useState(1);
  const Q1 = q1 * 1e-6;
  const E = electricFieldMagnitude(Q1, r);
  const Fq = forceOnCharge(qp * 1e-6, Math.sign(Q1) * E);

  return (
    <div className="space-y-4">
      <PhysGuide type="coulomb_field" mode={mode} />
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Fuerza sobre carga de prueba">
        <circle cx={140} cy={80} r={14} fill={q1 >= 0 ? ORANGE : TEAL} />
        <circle cx={140 + r * 800} cy={80} r={10} fill={qp >= 0 ? ORANGE : TEAL} />
      </svg>
      <PhysStatus id={uid}>F = q E · q prueba = {qp} μC · F = {present(Fq)} N</PhysStatus>
      <ControlsStack>
        <SliderRow label="q fuente (μC)" value={q1} min={-4} max={4} step={0.1} onChange={setQ1} />
        <SliderRow label="r (m)" value={r} min={0.05} max={0.3} step={0.01} onChange={setR} />
        <SliderRow label="q prueba (μC)" value={qp} min={-3} max={3} step={0.1} onChange={setQp} />
      </ControlsStack>
    </div>
  );
}

const MUTED_DOT = 'var(--fg-muted)';

export function CoulombFieldViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'uniform' ? (
        <UniformMode mode={mode} />
      ) : mode === 'field' ? (
        <ElectricFieldMode mode={mode} />
      ) : mode === 'force_on_q' ? (
        <ForceOnChargeMode mode={mode} />
      ) : (
        <CoulombLawMode mode={mode} />
      )}
    </VizPanel>
  );
}
