'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { SOUND_V } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import {
  closedTubeFrequency,
  closedTubeWavelength,
  openTubeFrequency,
  openTubeWavelength,
} from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

type ViewKind = 'displacement' | 'pressure';

function tubeProfile(n: number, closed: boolean, kind: ViewKind): number[] {
  const samples = 40;
  if (!closed) {
    return Array.from({ length: samples + 1 }, (_, i) => {
      const x = (i / samples) * Math.PI * n;
      const disp = Math.cos(x);
      return kind === 'displacement' ? disp : -Math.sin(x);
    });
  }
  return Array.from({ length: samples + 1 }, (_, i) => {
    const x = (i / samples) * Math.PI * n * 0.5;
    const disp = Math.sin(x);
    return kind === 'displacement' ? disp : Math.cos(x);
  });
}

function OpenTubeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.son006');
  const uid = useId();
  const [L, setL] = useState(0.8);
  const [n, setN] = useState(1);
  const [v, setV] = useState(SOUND_V);
  const [kind, setKind] = useState<ViewKind>('displacement');
  const f = openTubeFrequency(n, L, v);
  const lambda = openTubeWavelength(n, L);
  const profile = tubeProfile(n, false, kind);
  const presets = [1, 2, 3].map((harm) => ({
    id: `n${harm}`,
    label: tr('harmonic', { n: harm }),
    onSelect: () => setN(harm),
  }));

  return (
    <div className="space-y-4">
      <PhysGuide type="resonance_tube" mode={mode} />
      <PhysPresets items={presets} />
      <ButtonRow>
        <VizButton active={kind === 'displacement'} onClick={() => setKind('displacement')}>{tr('displacement')}</VizButton>
        <VizButton active={kind === 'pressure'} onClick={() => setKind('pressure')}>{tr('pressure')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={40} y={40} width={340} height={60} fill="none" stroke={MUTED} strokeWidth={3} />
        <path
          d={profile.map((u, i) => `${i === 0 ? 'M' : 'L'}${40 + (i / profile.length) * 340},${70 - u * 22}`).join(' ')}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
        />
        {profile.map((u, i) =>
          Math.abs(u) < 0.12 ? <circle key={i} cx={40 + (i / profile.length) * 340} cy={70} r={4} fill={TEAL} /> : null,
        )}
        {profile.map((u, i) =>
          Math.abs(u) > 0.85 ? <circle key={`a${i}`} cx={40 + (i / profile.length) * 340} cy={70 - u * 22} r={4} fill={ACCENT} /> : null,
        )}
        <text x={50} y={28} fontSize={11} fill={ACCENT}>{kind === 'displacement' ? tr('antinodesOpen') : tr('nodesOpenP')}</text>
      </svg>
      <PhysResult
        primary={tr('freq', { f: present(f), n: present(n) })}
        secondary={tr('lambda', { lambda: present(lambda), L: present(L) })}
      />
      <PhysStatus id={uid}>{tr('status', { n: present(n), f: present(f), kind: kind === 'displacement' ? tr('displacement') : tr('pressure') })}</PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('L')} value={L} min={0.3} max={2} step={0.05} onChange={setL} />
        <SliderRow label="n" value={n} min={1} max={5} step={1} onChange={setN} />
        <SliderRow label={tr('v')} value={v} min={300} max={360} step={1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

function ClosedTubeMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.son007');
  const uid = useId();
  const [L, setL] = useState(0.8);
  const [n, setN] = useState(1);
  const [v, setV] = useState(SOUND_V);
  const [kind, setKind] = useState<ViewKind>('displacement');
  const nUse = n % 2 === 0 ? n + 1 : n;
  const f = closedTubeFrequency(nUse, L, v);
  const lambda = closedTubeWavelength(nUse, L);
  const profile = tubeProfile(nUse, true, kind);
  const presets = [1, 3, 5].map((harm) => ({
    id: `n${harm}`,
    label: tr('harmonic', { n: harm }),
    onSelect: () => setN(harm),
  }));

  return (
    <div className="space-y-4">
      <PhysGuide type="resonance_tube" mode={mode} />
      <PhysPresets items={presets} />
      <ButtonRow>
        <VizButton active={kind === 'displacement'} onClick={() => setKind('displacement')}>{tr('displacement')}</VizButton>
        <VizButton active={kind === 'pressure'} onClick={() => setKind('pressure')}>{tr('pressure')}</VizButton>
      </ButtonRow>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={tr('aria')}>
        <rect x={40} y={40} width={340} height={60} fill="none" stroke={MUTED} strokeWidth={3} />
        <line x1={40} y1={40} x2={40} y2={100} stroke={MUTED} strokeWidth={8} />
        <path
          d={profile.map((u, i) => `${i === 0 ? 'M' : 'L'}${40 + (i / profile.length) * 340},${70 - u * 22}`).join(' ')}
          fill="none"
          stroke={ORANGE}
          strokeWidth={2}
        />
        <circle cx={40} cy={70} r={5} fill={TEAL} />
        <text x={48} y={115} fontSize={10} fill={TEAL}>{tr('closedEnd')}</text>
        <text x={350} y={115} fontSize={10} fill={ACCENT}>{tr('openEnd')}</text>
        <text x={50} y={28} fontSize={11} fill={ACCENT}>{tr('oddOnly')}</text>
      </svg>
      <PhysResult
        primary={tr('freq', { f: present(f), n: present(nUse) })}
        secondary={tr('lambda', { lambda: present(lambda), L: present(L) })}
      />
      <PhysStatus id={uid}>
        {tr('status', { n: present(nUse), f: present(f), note: n % 2 === 0 ? tr('evenBlocked') : '' })}
      </PhysStatus>
      <ControlsStack>
        <SliderRow label={tr('L')} value={L} min={0.3} max={2} step={0.05} onChange={setL} />
        <SliderRow label="n" value={n} min={1} max={7} step={2} onChange={setN} />
        <SliderRow label={tr('v')} value={v} min={300} max={360} step={1} onChange={setV} />
      </ControlsStack>
    </div>
  );
}

export function ResonanceTubeViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'closed' ? <ClosedTubeMode mode={mode} /> : <OpenTubeMode mode={mode} />}
    </VizPanel>
  );
}
