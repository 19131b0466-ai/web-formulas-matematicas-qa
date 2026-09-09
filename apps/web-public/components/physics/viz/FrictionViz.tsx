'use client';

import { useId, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { G, clamp } from './physMath';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function FrictionViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [m, setM] = useState(2);
  const [mus, setMus] = useState(0.5);
  const [muk, setMuk] = useState(0.3);
  const [Fapl, setFapl] = useState(4);
  const N = m * G;
  const fsMax = mus * N;
  const fk = Math.min(muk, mus - 0.01) * N;
  const kineticForced = mode === 'kinetic';
  const sliding = kineticForced || Fapl > fsMax + 1e-6;
  const fs = sliding ? fk : Math.min(Fapl, fsMax);
  const a = sliding ? (Fapl - fk) / m : 0;
  const barMax = Math.max(fsMax, Fapl, 1);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="friction" mode={mode} />
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Fricción estática y cinética">
          <line x1={20} y1={100} x2={400} y2={100} stroke={MUTED} strokeWidth={3} />
          <rect x={170} y={62} width={70} height={38} fill={ORANGE} />
          <line x1={240} y1={80} x2={240 + clamp(Fapl * 4, 8, 90)} y2={80} stroke={ACCENT} strokeWidth={2.4} />
          <text x={250} y={54} fontSize={11} fill={ACCENT}>
            Fapl
          </text>
          <line x1={170} y1={80} x2={170 - clamp(fs * 4, 8, 90)} y2={80} stroke={TEAL} strokeWidth={2.4} />
          <text x={80} y={54} fontSize={11} fill={TEAL}>
            {sliding ? 'fk' : 'fs'}
          </text>
        </svg>
        <div>
          <p className="mb-1 text-xs text-[var(--fg-muted)]">fs hasta μs N, luego fk</p>
          <div className="h-3 overflow-hidden rounded bg-[var(--border)]">
            <div className="h-full" style={{ width: `${(fs / barMax) * 100}%`, background: sliding ? TEAL : ACCENT }} />
          </div>
          <div className="mt-1 h-1 rounded bg-[var(--border)]" style={{ width: `${(fsMax / barMax) * 100}%` }} />
          <p className="mt-1 text-[10px] text-[var(--fg-muted)]">marca μs N</p>
        </div>
        <PhysStatus id={uid}>
          {sliding
            ? `desliza · fk = μk N = ${present(fk)} N · a = ${present(a)} m/s²`
            : `en reposo · fs = Fapl = ${present(fs)} N ≤ μs N = ${present(fsMax)}`}
        </PhysStatus>
        <ControlsStack>
          <SliderRow label="m (kg)" value={m} min={0.5} max={10} step={0.1} onChange={setM} />
          <SliderRow label="μs" value={mus} min={0.2} max={1.2} step={0.01} onChange={(v) => { setMus(v); if (muk >= v) setMuk(v - 0.05); }} />
          <SliderRow label="μk" value={muk} min={0.1} max={Math.max(0.11, mus - 0.01)} step={0.01} onChange={setMuk} />
          <SliderRow label="Fapl (N)" value={Fapl} min={0} max={40} step={0.5} onChange={setFapl} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
