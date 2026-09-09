'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { PhysGuide, PhysStatus } from './physChrome';
import { ACCENT, MUTED, ORANGE, TEAL } from './physPlot';

export function ResistorNetworkViz({ mode }: { mode?: string }) {
  const t = useTranslations('vizFisica');
  const uid = useId();
  const parForced = mode === 'parallel';
  const ohm = mode === 'ohm';
  const res = mode === 'resistivity';
  const [series, setSeries] = useState(!parForced);
  const [R1, setR1] = useState(10);
  const [R2, setR2] = useState(20);
  const [emf, setEmf] = useState(12);
  const [L, setL] = useState(0.5);
  const [A, setA] = useState(1e-6);
  const [rho, setRho] = useState(1.7e-8);
  const isPar = parForced || (!series && !ohm && !res);
  const Req = res ? (rho * L) / A : ohm ? R1 : isPar ? 1 / (1 / R1 + 1 / R2) : R1 + R2;
  const I = emf / Req;
  const I1 = isPar && !ohm && !res ? emf / R1 : I;
  const I2 = isPar && !ohm && !res ? emf / R2 : I;

  let status = isPar
    ? `paralelo · Req = ${present(Req)} Ω · misma V · I1=${present(I1)} I2=${present(I2)}`
    : `serie · Req = ${present(Req)} Ω · misma I = ${present(I)} A`;
  if (ohm) status = `V = I R · I = ε/R = ${present(I)} A`;
  if (res) status = `R = ρ L/A = ${present(Req)} Ω`;

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="resistor_network" mode={mode} />
        {!ohm && !res && !parForced ? (
          <ButtonRow>
            <VizButton active={series} onClick={() => setSeries(true)}>
              {t('series')}
            </VizButton>
            <VizButton active={!series} onClick={() => setSeries(false)}>
              {t('parallel')}
            </VizButton>
          </ButtonRow>
        ) : null}
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label="Red de resistencias">
          <rect x={30} y={50} width={24} height={40} fill={ORANGE} />
          <text x={20} y={40} fontSize={11} fill={ORANGE}>
            ε
          </text>
          <line x1={54} y1={70} x2={120} y2={70} stroke={MUTED} strokeWidth={2} />
          <rect x={120} y={58} width={70} height={24} fill={ACCENT} fillOpacity={0.3} stroke={MUTED} />
          <text x={135} y={74} fontSize={11}>
            R1
          </text>
          {!ohm && !res ? (
            <>
              {isPar ? (
                <>
                  <line x1={120} y1={40} x2={260} y2={40} stroke={MUTED} />
                  <rect x={160} y={28} width={70} height={24} fill={TEAL} fillOpacity={0.3} stroke={MUTED} />
                </>
              ) : (
                <rect x={220} y={58} width={70} height={24} fill={TEAL} fillOpacity={0.3} stroke={MUTED} />
              )}
            </>
          ) : null}
        </svg>
        <PhysStatus id={uid}>{status}</PhysStatus>
        <ControlsStack>
          {res ? (
            <>
              <SliderRow label="ρ" value={rho} min={1e-8} max={1e-6} step={1e-9} onChange={setRho} />
              <SliderRow label="L (m)" value={L} min={0.1} max={2} step={0.05} onChange={setL} />
              <SliderRow label="A (m²)" value={A} min={2e-7} max={4e-6} step={1e-7} onChange={setA} />
            </>
          ) : (
            <>
              <SliderRow label="ε (V)" value={emf} min={1} max={24} step={0.5} onChange={setEmf} />
              <SliderRow label="R1 (Ω)" value={R1} min={1} max={50} step={0.5} onChange={setR1} />
              {!ohm ? <SliderRow label="R2 (Ω)" value={R2} min={1} max={50} step={0.5} onChange={setR2} /> : null}
            </>
          )}
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
