'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { SOUND_V, clamp } from './physMath';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { dopplerObservedFrequency } from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ORANGE, TEAL } from './physPlot';

export function DopplerViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.son004');
  const uid = useId();
  const [f, setF] = useState(400);
  const [vs, setVs] = useState(20);
  const [vo, setVo] = useState(0);
  const [srcToward, setSrcToward] = useState(true);
  const [obsToward, setObsToward] = useState(false);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  useRafPlay(playing, setT, { min: 0, max: 1000, speed: 60, loop: true });
  const v = SOUND_V;
  const vsClamped = clamp(vs, 0, v - 5);
  const voClamped = clamp(vo, 0, v - 5);
  const fp = dopplerObservedFrequency(f, v, vsClamped, voClamped, srcToward, obsToward);
  const srcX = 140 + (srcToward ? Math.sin(t * 0.02) * 12 : -Math.sin(t * 0.02) * 8);
  const obsX = 320 + (obsToward ? -Math.sin(t * 0.015) * 10 : Math.sin(t * 0.015) * 6);
  const compress = srcToward ? 0.75 : 1.25;

  const presets = [
    { id: 'src', label: tr('srcApproach'), onSelect: () => { setSrcToward(true); setObsToward(false); setVs(25); setVo(0); } },
    { id: 'obs', label: tr('obsApproach'), onSelect: () => { setSrcToward(false); setObsToward(true); setVs(0); setVo(15); } },
    { id: 'away', label: tr('bothAway'), onSelect: () => { setSrcToward(false); setObsToward(false); setVs(15); setVo(10); } },
  ];

  const signNum = obsToward ? '+' : '−';
  const signDen = srcToward ? '−' : '+';

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="doppler" mode={mode} />
        <PhysPresets items={presets} />
        <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
        <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('aria')}>
          <circle cx={srcX} cy={80} r={9} fill={ACCENT} />
          <text x={srcX - 22} y={24} fontSize={11} fill={ACCENT}>{tr('source')}</text>
          <circle cx={obsX} cy={80} r={9} fill={TEAL} />
          <text x={obsX - 30} y={24} fontSize={11} fill={TEAL}>{tr('observer')}</text>
          {[1, 2, 3, 4, 5].map((i) => {
            const phase = (t * 0.08 + i * 18) % 90;
            const r = phase * compress;
            const cx = srcX + (srcToward ? r * 0.35 : -r * 0.2);
            return <circle key={i} cx={cx} cy={80} r={r} fill="none" stroke={ORANGE} opacity={0.45 - i * 0.05} />;
          })}
          <line x1={srcX + 12} y1={80} x2={obsX - 12} y2={80} stroke={MUTED_LINE} strokeWidth={1} strokeDasharray="3 4" />
        </svg>
        <PhysResult
          primary={tr('observed', { f: present(f), fp: present(fp) })}
          secondary={tr('formula', { signNum, signDen, v: present(v) })}
        />
        <PhysStatus id={uid}>{tr('status', { fp: present(fp), vs: present(vsClamped), vo: present(voClamped) })}</PhysStatus>
        <ButtonRow>
          <VizButton active={srcToward} onClick={() => setSrcToward(true)}>{tr('srcToward')}</VizButton>
          <VizButton active={!srcToward} onClick={() => setSrcToward(false)}>{tr('srcAway')}</VizButton>
        </ButtonRow>
        <ButtonRow>
          <VizButton active={obsToward} onClick={() => setObsToward(true)}>{tr('obsToward')}</VizButton>
          <VizButton active={!obsToward} onClick={() => setObsToward(false)}>{tr('obsAway')}</VizButton>
        </ButtonRow>
        <ControlsStack>
          <SliderRow label={tr('fEmit')} value={f} min={100} max={800} step={10} onChange={setF} />
          <SliderRow label={tr('vs')} value={vs} min={0} max={80} step={1} onChange={(n) => setVs(clamp(n, 0, v - 5))} />
          <SliderRow label={tr('vo')} value={vo} min={0} max={40} step={1} onChange={(n) => setVo(clamp(n, 0, v - 5))} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}

const MUTED_LINE = 'var(--fg-muted)';
