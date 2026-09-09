'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { SOUND_V } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE } from './physPlot';

export function ResonanceTubeViz({ mode }: { mode?: string }) {
  const t = useTranslations('vizFisica');
  const uid = useId();
  const closedForced = mode === 'closed';
  const [closed, setClosed] = useState(closedForced);
  const [L, setL] = useState(0.8);
  const [n, setN] = useState(1);
  const isClosed = closedForced || closed;
  const nUse = isClosed ? (n % 2 === 0 ? n + 1 : n) : n;
  const f = isClosed ? (nUse * SOUND_V) / (4 * L) : (nUse * SOUND_V) / (2 * L);
  const nodes = isClosed
    ? Array.from({ length: (nUse + 1) / 2 }, (_, i) => i / ((nUse + 1) / 2))
    : Array.from({ length: nUse + 1 }, (_, i) => i / nUse);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="resonance_tube" mode={mode} />
        {!closedForced ? (
          <ButtonRow>
            <VizButton active={!closed} onClick={() => setClosed(false)}>
              {t('open')}
            </VizButton>
            <VizButton active={closed} onClick={() => setClosed(true)}>
              {t('closed')}
            </VizButton>
          </ButtonRow>
        ) : null}
        <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label="Tubo de resonancia">
          <rect x={40} y={30} width={340} height={60} fill="none" stroke={MUTED} strokeWidth={3} />
          {isClosed ? <line x1={40} y1={30} x2={40} y2={90} stroke={MUTED} strokeWidth={8} /> : null}
          {nodes.map((u, i) => (
            <circle key={i} cx={40 + u * 340} cy={60} r={5} fill={ORANGE} />
          ))}
          <text x={50} y={20} fontSize={11} fill={ACCENT}>
            {isClosed ? 'nodo de desplazamiento (cerrado)' : 'vientres en las bocas'}
          </text>
        </svg>
        <PhysStatus id={uid}>
          {isClosed
            ? `cerrado: fn = n v/(4L), n impar = ${nUse} · f = ${present(f)} Hz`
            : `abierto: fn = n v/(2L) = ${present(f)} Hz · n = ${nUse}`}
          {isClosed && n % 2 === 0 ? ' · n=2 deshabilitado (solo impares)' : ''}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="L (m)" value={L} min={0.3} max={2} step={0.05} onChange={setL} />
          <SliderRow label="n" value={n} min={1} max={5} step={1} onChange={setN} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
