'use client';

import { useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { beatFrequency } from './physLote6Math';
import { PhysPresets, PhysResult } from './physPanel';
import { ACCENT, ChartFrame, MUTED, ORANGE, fnPath, makePlot } from './physPlot';

export function BeatsViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l6.son005');
  const uid = useId();
  const audioRef = useRef<OscillatorNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const [f1, setF1] = useState(200);
  const [f2, setF2] = useState(208);
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.15);
  const fbat = beatFrequency(f1, f2);
  const T = fbat > 0 ? Math.min(1.2, 6 / fbat) : 0.5;
  const plot = makePlot({ xMin: 0, xMax: T, yMin: -2.4, yMax: 2.4, H: 160 });
  const carrier = (f1 + f2) / 2;
  const y1 = (t: number) => Math.sin(2 * Math.PI * f1 * t);
  const y2 = (t: number) => Math.sin(2 * Math.PI * f2 * t);
  const sum = (t: number) => y1(t) + y2(t);
  const env = (t: number) => 2 * Math.cos(2 * Math.PI * (fbat / 2) * t);
  const peaksPerSec = fbat;

  const stopAudio = () => {
    audioRef.current?.stop();
    audioRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
    setAudioOn(false);
  };

  const startAudio = async () => {
    stopAudio();
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = carrier;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx;
    audioRef.current = osc;
    setAudioOn(true);
  };

  const presets = [
    { id: 'eq', label: tr('equal'), onSelect: () => { setF1(220); setF2(220); stopAudio(); } },
    { id: 'small', label: tr('smallDiff'), onSelect: () => { setF1(200); setF2(204); stopAudio(); } },
    { id: 'large', label: tr('largeDiff'), onSelect: () => { setF1(200); setF2(230); stopAudio(); } },
  ];

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="beats" mode={mode} />
        <PhysPresets items={presets} />
        <ChartFrame plot={plot} xLabel="t (s)" yLabel="y" title={tr('title')}>
          <path d={fnPath(y1, 0, T, plot, 600)} fill="none" stroke={MUTED} strokeWidth={1} opacity={0.55} />
          <path d={fnPath(y2, 0, T, plot, 600)} fill="none" stroke={ACCENT} strokeWidth={1} opacity={0.55} />
          <path d={fnPath(sum, 0, T, plot, 800)} fill="none" stroke={ORANGE} strokeWidth={1.6} />
          <path d={fnPath(env, 0, T, plot, 300)} fill="none" stroke={ORANGE} strokeDasharray="5 4" strokeWidth={1.2} />
          <path d={fnPath((t) => -env(t), 0, T, plot, 300)} fill="none" stroke={ORANGE} strokeDasharray="5 4" strokeWidth={1.2} />
        </ChartFrame>
        <PhysResult
          primary={tr('beat', { fbat: present(fbat) })}
          secondary={tr('peaks', { n: present(peaksPerSec) })}
        />
        <PhysStatus id={uid}>{tr('status', { f1: present(f1), f2: present(f2), fbat: present(fbat) })}</PhysStatus>
        <ButtonRow>
          <VizButton onClick={() => (audioOn ? stopAudio() : startAudio())}>{audioOn ? tr('mute') : tr('playAudio')}</VizButton>
        </ButtonRow>
        <ControlsStack>
          <SliderRow label={tr('f1')} value={f1} min={180} max={260} step={1} onChange={(n) => { setF1(n); if (audioOn) stopAudio(); }} />
          <SliderRow label={tr('f2')} value={f2} min={180} max={260} step={1} onChange={(n) => { setF2(n); if (audioOn) stopAudio(); }} />
          <SliderRow label={tr('volume')} value={volume} min={0} max={0.4} step={0.02} onChange={setVolume} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
