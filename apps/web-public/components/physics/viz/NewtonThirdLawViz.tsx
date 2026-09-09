'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

const W = 420;
const H = 220;

type View = 'interaction' | 'a' | 'b' | 'both';
type Example = 'contact' | 'attract';

export function NewtonThirdLawViz({ mode }: { mode?: string }) {
  const t = useTranslations('vizFisica');
  const tr = useTranslations('vizFisica.l2.new003');
  const uid = useId();
  const [F, setF] = useState(12);
  const [view, setView] = useState<View>('interaction');
  const [example, setExample] = useState<Example>('contact');
  const len = Math.min(70, 10 + F * 3);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="newton_third" mode={mode} />
        <ButtonRow>
          <VizButton active={view === 'interaction'} onClick={() => setView('interaction')}>{tr('interaction')}</VizButton>
          <VizButton active={view === 'a'} onClick={() => setView('a')}>{tr('dclA')}</VizButton>
          <VizButton active={view === 'b'} onClick={() => setView('b')}>{tr('dclB')}</VizButton>
          <VizButton active={view === 'both'} onClick={() => setView('both')}>{t('both')}</VizButton>
        </ButtonRow>
        <ButtonRow>
          <VizButton active={example === 'contact'} onClick={() => setExample('contact')}>{tr('contact')}</VizButton>
          <VizButton active={example === 'attract'} onClick={() => setExample('attract')}>{tr('attract')}</VizButton>
        </ButtonRow>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={tr('aria')}>
          {example === 'contact' ? (
            <>
              <line x1={20} y1={170} x2={400} y2={170} stroke={MUTED} />
              {(view === 'interaction' || view === 'both' || view === 'a') && (
                <g>
                  <rect x={80} y={120} width={70} height={40} fill={ACCENT} />
                  <text x={115} y={144} textAnchor="middle" fontSize={12} fill="white">A</text>
                  {(view === 'interaction' || view === 'both' || view === 'a') && (
                    <>
                      <line x1={150} y1={140} x2={150 + len} y2={140} stroke={ORANGE} strokeWidth={2.6} />
                      <text x={150 + len / 2} y={128} fontSize={10} fill={ORANGE}>{tr('fOnA')}</text>
                    </>
                  )}
                </g>
              )}
              {(view === 'interaction' || view === 'both' || view === 'b') && (
                <g>
                  <rect x={260} y={120} width={70} height={40} fill={TEAL} />
                  <text x={295} y={144} textAnchor="middle" fontSize={12} fill="white">B</text>
                  {(view === 'interaction' || view === 'both' || view === 'b') && (
                    <>
                      <line x1={260} y1={140} x2={260 - len} y2={140} stroke={ORANGE} strokeWidth={2.6} />
                      <text x={260 - len / 2} y={128} fontSize={10} fill={ORANGE}>{tr('fOnB')}</text>
                    </>
                  )}
                </g>
              )}
            </>
          ) : (
            <>
              <circle cx={140} cy={120} r={28} fill={ACCENT} />
              <text x={140} y={124} textAnchor="middle" fontSize={12} fill="white">A</text>
              <circle cx={300} cy={120} r={28} fill={TEAL} />
              <text x={300} y={124} textAnchor="middle" fontSize={12} fill="white">B</text>
              <line x1={168} y1={120} x2={168 + len} y2={120} stroke={ORANGE} strokeWidth={2.4} />
              <line x1={272} y1={120} x2={272 - len} y2={120} stroke={ORANGE} strokeWidth={2.4} />
              <text x={210} y={108} fontSize={10} fill={ORANGE}>{tr('fOnA')}</text>
              <text x={230} y={108} fontSize={10} fill={ORANGE}>{tr('fOnB')}</text>
            </>
          )}
        </svg>
        <PhysResult primary={tr('card', { F: present(F) })} secondary={tr('note')} />
        <PhysStatus id={uid}>{tr('status', { F: present(F) })}</PhysStatus>
        <ControlsStack>
          <SliderRow label={tr('magnitude', { F: present(F) })} value={F} min={1} max={20} step={0.5} onChange={setF} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
