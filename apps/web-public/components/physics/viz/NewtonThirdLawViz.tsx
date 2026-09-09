'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 200;

export function NewtonThirdLawViz({ mode }: { mode?: string }) {
  const t = useTranslations('vizFisica');
  const uid = useId();
  const [F, setF] = useState(12);
  const [view, setView] = useState<'a' | 'b' | 'both'>('both');
  const len = Math.min(70, 10 + F * 3);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="newton_third" mode={mode} />
        <ButtonRow>
          <VizButton active={view === 'a'} onClick={() => setView('a')}>
            DCL A
          </VizButton>
          <VizButton active={view === 'b'} onClick={() => setView('b')}>
            DCL B
          </VizButton>
          <VizButton active={view === 'both'} onClick={() => setView('both')}>
            {t('both')}
          </VizButton>
        </ButtonRow>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Acción y reacción en dos cuerpos">
          <line x1={20} y1={150} x2={400} y2={150} stroke={MUTED} />
          {(view === 'a' || view === 'both') && (
            <>
              <rect x={80} y={110} width={70} height={40} fill={ACCENT} />
              <text x={115} y={134} textAnchor="middle" fontSize={12} fill="white">
                A
              </text>
              <line x1={150} y1={130} x2={150 + len} y2={130} stroke={ORANGE} strokeWidth={2.6} />
              <text x={150 + len / 2} y={118} fontSize={11} fill={ORANGE}>
                FB→A
              </text>
            </>
          )}
          {(view === 'b' || view === 'both') && (
            <>
              <rect x={260} y={110} width={70} height={40} fill={TEAL} />
              <text x={295} y={134} textAnchor="middle" fontSize={12} fill="white">
                B
              </text>
              <line x1={260} y1={130} x2={260 - len} y2={130} stroke={ORANGE} strokeWidth={2.6} />
              <text x={260 - len / 2} y={118} fontSize={11} fill={ORANGE}>
                FA→B
              </text>
            </>
          )}
        </svg>
        <PhysStatus id={uid}>
          |FA→B| = |FB→A| = {present(F)} N · opuestas, en cuerpos distintos: no se cancelan en un mismo DCL
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="|F| (N)" value={F} min={1} max={20} step={0.5} onChange={setF} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
