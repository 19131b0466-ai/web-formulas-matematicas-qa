'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { integrate } from '@/components/calculo/viz/calcMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, TEAL, areaToAxis, fnPath, makePlot } from './physPlot';

function riemannRects(F: (x: number) => number, x1: number, x2: number, n: number, plot: ReturnType<typeof makePlot>) {
  if (n < 1 || x2 <= x1) return '';
  const dx = (x2 - x1) / n;
  let d = '';
  for (let i = 0; i < n; i++) {
    const xa = x1 + i * dx;
    const xb = xa + dx;
    const ym = F((xa + xb) / 2);
    const y0 = plot.Y(0);
    const y1 = plot.Y(ym);
    const left = plot.X(xa);
    const right = plot.X(xb);
    const top = Math.min(y0, y1);
    const h = Math.abs(y1 - y0);
    d += `M${left},${y0} h${right - left} v${y1 < y0 ? -h : h} h${left - right} z `;
  }
  return d.trim();
}

export function WorkVariablePhysicsViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l4.ene002');
  const uid = useId();
  const [kind, setKind] = useState<'hooke' | 'lineal' | 'constante'>('hooke');
  const [k, setK] = useState(18);
  const [x1, setX1] = useState(0);
  const [x2, setX2] = useState(0.3);
  const [nRects, setNRects] = useState(6);
  const F = (x: number) => (kind === 'hooke' ? k * x : kind === 'lineal' ? k * x : k);
  const W = integrate(F, x1, x2);
  const tri = 0.5 * k * (x2 * x2 - x1 * x1);
  const plot = makePlot({ xMin: -0.1, xMax: 0.5, yMin: -2, yMax: Math.max(8, k * 0.5 + 2), H: 140 });

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="work_variable" mode={mode} />
        <ButtonRow>
          <VizButton active={kind === 'hooke'} onClick={() => setKind('hooke')}>{tr('spring')}</VizButton>
          <VizButton active={kind === 'lineal'} onClick={() => setKind('lineal')}>{tr('linear')}</VizButton>
          <VizButton active={kind === 'constante'} onClick={() => setKind('constante')}>{tr('constant')}</VizButton>
        </ButtonRow>
        <ChartFrame plot={plot} xLabel="x (m)" yLabel="F (N)" title={tr('title')}>
          <path d={riemannRects(F, x1, x2, nRects, plot)} fill={TEAL} fillOpacity={0.2} stroke={TEAL} strokeWidth={0.5} />
          <path d={areaToAxis(F, x1, x2, plot)} fill={ACCENT} fillOpacity={0.25} />
          <path d={fnPath(F, -0.05, 0.48, plot)} fill="none" stroke={ACCENT} strokeWidth={2} />
          <line x1={plot.X(0)} y1={plot.Y(plot.yMin)} x2={plot.X(0)} y2={plot.Y(plot.yMax)} stroke={MUTED} strokeDasharray="3 3" />
          <line x1={plot.X(x1)} y1={plot.Y(plot.yMin)} x2={plot.X(x1)} y2={plot.Y(plot.yMax)} stroke={ORANGE} strokeDasharray="3 3" />
          <line x1={plot.X(x2)} y1={plot.Y(plot.yMin)} x2={plot.X(x2)} y2={plot.Y(plot.yMax)} stroke={ORANGE} strokeDasharray="3 3" />
        </ChartFrame>
        <PhysResult
          primary={tr('work', { W: present(W) })}
          secondary={kind === 'hooke' ? tr('springWork', { tri: present(tri) }) : tr('rects', { n: nRects })}
        />
        <PhysStatus id={uid}>{tr('status', { W: present(W), x1: present(x1), x2: present(x2) })}</PhysStatus>
        <ControlsStack>
          <SliderRow label={kind === 'constante' ? 'F (N)' : 'k'} value={k} min={5} max={50} step={0.5} onChange={setK} />
          <SliderRow label="x1 (m)" value={x1} min={-0.05} max={0.4} step={0.01} onChange={setX1} />
          <SliderRow label="x2 (m)" value={x2} min={0} max={0.45} step={0.01} onChange={setX2} />
          <SliderRow label={tr('nRects')} value={nRects} min={2} max={24} step={1} onChange={setNRects} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
