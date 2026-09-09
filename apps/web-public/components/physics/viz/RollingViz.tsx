'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PlayRow, PhysGuide, PhysStatus, useRafPlay } from './physChrome';
import { formatEnergy } from './physFormat';
import { rollingInertia, rotationalKineticEnergy } from './physLote1Math';
import { PhysResult } from './physPanel';
import { ACCENT, ChartFrame, EnergyBars, MUTED, ORANGE, TEAL, fnPath, makePlot, padRange } from './physPlot';

const BETA: Record<string, number> = { aro: 1, disco: 0.5, esfera: 0.4 };

function KrotFormulaMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l1.rot010');
  const uid = useId();
  const [tab, setTab] = useState<'formula' | 'rolling'>('formula');
  const [I, setI] = useState(0.32);
  const [omega, setOmega] = useState(4);
  const [shape, setShape] = useState<'aro' | 'disco' | 'esfera'>('disco');
  const [R, setR] = useState(0.4);
  const [vcm, setVcm] = useState(2.5);
  const [m, setM] = useState(2);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trBase = useTranslations('vizFisica');
  useRafPlay(playing, setT, { min: 0, max: 8, speed: 1, loop: true });

  const beta = BETA[shape]!;
  const Iroll = rollingInertia(beta, m, R);
  const omegaroll = vcm / R;
  const Krot = tab === 'formula' ? rotationalKineticEnergy(I, omega) : rotationalKineticEnergy(Iroll, omegaroll);
  const Ktr = 0.5 * m * vcm * vcm;
  const omegaMax = 10;
  const kPlot = makePlot({
    xMin: 0,
    xMax: omegaMax,
    ...padRange(Array.from({ length: 40 }, (_, i) => rotationalKineticEnergy(tab === 'formula' ? I : Iroll, (i / 39) * omegaMax)), 0.15, 5),
    H: 110,
  });
  const x = ((vcm * t) % 6) * 50 + 50;
  const phi = -(vcm * t) / R;

  return (
    <div className="space-y-4">
      <PhysGuide type="rolling" mode={mode} />
      <ButtonRow>
        <VizButton active={tab === 'formula'} onClick={() => setTab('formula')}>{tr('tabFormula')}</VizButton>
        <VizButton active={tab === 'rolling'} onClick={() => setTab('rolling')}>{tr('tabRolling')}</VizButton>
      </ButtonRow>
      {tab === 'rolling' ? (
        <>
          <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{trBase('reset')}</VizButton>} />
          <ButtonRow>
            {(['aro', 'disco', 'esfera'] as const).map((s) => (
              <VizButton key={s} active={shape === s} onClick={() => setShape(s)}>{s} (β={BETA[s]})</VizButton>
            ))}
          </ButtonRow>
          <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label={tr('ariaRolling')}>
            <line x1={20} y1={120} x2={400} y2={120} stroke={MUTED} strokeWidth={2} />
            <circle cx={x} cy={120 - R * 80} r={R * 80} fill={ACCENT} fillOpacity={0.15} stroke={MUTED} />
            <circle cx={x + R * 80 * Math.cos(phi)} cy={120 - R * 80 + R * 80 * Math.sin(phi)} r={5} fill={ORANGE} />
            <line x1={x} y1={120 - R * 80} x2={x + 40} y2={120 - R * 80} stroke={TEAL} strokeWidth={2} />
          </svg>
          <EnergyBars items={[{ label: 'Ktras', value: Ktr, color: TEAL }, { label: 'Krot', value: Krot, color: ACCENT }]} />
        </>
      ) : (
        <ChartFrame plot={kPlot} xLabel="ω (rad/s)" yLabel="Krot (J)" title="Krot(ω)">
          <path d={fnPath((w) => rotationalKineticEnergy(I, w), 0, omegaMax, kPlot)} fill="none" stroke={ACCENT} strokeWidth={2} />
          <circle cx={kPlot.X(omega)} cy={kPlot.Y(Krot)} r={5} fill={ORANGE} />
        </ChartFrame>
      )}
      <PhysResult
        primary={`Krot = ½ I ω² = ${formatEnergy(Krot)}`}
        secondary={tab === 'rolling' ? tr('rollingSub', { beta: present(beta), I: present(Iroll), omega: present(omegaroll), vcm: present(vcm), R: present(R) }) : undefined}
      />
      <PhysStatus id={uid}>{tab === 'formula' ? tr('formulaStatus') : tr('rollingStatus', { vcm: present(vcm), omega: present(omegaroll) })}</PhysStatus>
      <ControlsStack>
        {tab === 'formula' ? (
          <>
            <SliderRow label={tr('I', { I: present(I) })} value={I} min={0.05} max={2} step={0.01} onChange={setI} />
            <SliderRow label={tr('omega', { omega: present(omega) })} value={omega} min={0.5} max={10} step={0.1} onChange={setOmega} />
          </>
        ) : (
          <>
            <SliderRow label="m (kg)" value={m} min={0.5} max={5} step={0.1} onChange={setM} />
            <SliderRow label="R (m)" value={R} min={0.2} max={0.8} step={0.05} onChange={setR} />
            <SliderRow label="vCM (m/s)" value={vcm} min={0.5} max={6} step={0.1} onChange={setVcm} />
          </>
        )}
      </ControlsStack>
    </div>
  );
}

function GeneralRollingMode({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica');
  const uid = useId();
  const [shape, setShape] = useState<'aro' | 'disco' | 'esfera'>('disco');
  const [R, setR] = useState(0.4);
  const [vcm, setVcm] = useState(2.5);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const M = 2;
  const beta = BETA[shape]!;
  const I = beta * M * R * R;
  const omega = vcm / R;
  const Ktr = 0.5 * M * vcm * vcm;
  const Krot = 0.5 * I * omega * omega;
  useRafPlay(playing, setT, { min: 0, max: 8, speed: 1, loop: true });
  const x = ((vcm * t) % 6) * 50 + 50;

  return (
    <div className="space-y-4">
      <PhysGuide type="rolling" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} extra={<VizButton onClick={() => { setPlaying(false); setT(0); }}>{tr('reset')}</VizButton>} />
      <ButtonRow>
        {(['aro', 'disco', 'esfera'] as const).map((s) => (
          <VizButton key={s} active={shape === s} onClick={() => setShape(s)}>{s}</VizButton>
        ))}
      </ButtonRow>
      <svg viewBox="0 0 420 160" className="h-auto w-full" role="img" aria-label="Rodadura">
        <line x1={20} y1={120} x2={400} y2={120} stroke={MUTED} strokeWidth={2} />
        <circle cx={x} cy={120 - R * 80} r={R * 80} fill={ACCENT} fillOpacity={0.15} stroke={MUTED} />
        <line x1={x} y1={120 - R * 80} x2={x + 40} y2={120 - R * 80} stroke={TEAL} strokeWidth={2} />
      </svg>
      <EnergyBars items={[{ label: 'Ktras', value: Ktr, color: TEAL }, { label: 'Krot', value: Krot, color: ACCENT }]} />
      <PhysStatus id={uid}>vCM = R ω = {present(vcm)} m/s · Krot = {present(Krot)} J</PhysStatus>
      <ControlsStack>
        <SliderRow label="R (m)" value={R} min={0.2} max={0.8} step={0.05} onChange={setR} />
        <SliderRow label="vCM (m/s)" value={vcm} min={0.5} max={6} step={0.1} onChange={setVcm} />
      </ControlsStack>
    </div>
  );
}

export function RollingViz({ mode }: { mode?: string }) {
  return (
    <VizPanel>
      {mode === 'krot' ? <KrotFormulaMode mode={mode} /> : <GeneralRollingMode mode={mode} />}
    </VizPanel>
  );
}
