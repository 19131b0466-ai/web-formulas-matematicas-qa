'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ACCENT, MUTED, ORANGE, TEAL } from '@/components/physics/viz/physPlot';
import { ElecGuide, elecCaption, PlayRow, PhysStatus, useRafPlay } from './elecChrome';
import {
  fullWaveAvg,
  halfWaveAvg,
  integratorRamp,
  invertingGain,
  nonInvertingGain,
  shockley,
} from './elecMath';

type Props = { mode?: string };

export function DiodeIvViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [vd, setVd] = useState(0.65);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  useRafPlay(playing, setTime, { min: 0, max: 1, speed: 0.5, loop: true });
  const isat = 1e-12;
  const vt = 0.026;
  const id = shockley(isat, vd, 1, vt);
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const v = -0.4 + (i / 80) * 1.2;
      const iA = Math.min(0.08, Math.max(-0.002, shockley(isat, v, 1, vt)));
      out.push(`${40 + ((v + 0.4) / 1.2) * 200},${120 - (iA / 0.08) * 90}`);
    }
    return out.join(' ');
  }, []);
  const vin = 5 * Math.sin(2 * Math.PI * time);
  const half = Math.max(vin, 0);
  const full = Math.abs(vin);

  return (
    <VizPanel caption={elecCaption(t, 'diode_iv', mode)}>
      <ElecGuide type="diode_iv" mode={mode} />
      {mode === 'half' || mode === 'full' ? (
        <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      ) : null}
      <PhysStatus id={uid}>
        {mode === 'half'
          ? t('diode_iv.statusHalf', { vavg: present(halfWaveAvg(5), 2) })
          : mode === 'full'
            ? t('diode_iv.statusFull', { vavg: present(fullWaveAvg(5), 2) })
            : t('diode_iv.statusIv', { i: present(id * 1e3, 4), v: present(vd, 2) })}
      </PhysStatus>
      {mode === 'half' || mode === 'full' ? (
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('diode_iv.ariaRect')}>
          {Array.from({ length: 80 }, (_, i) => {
            const ti = i / 80;
            const vs = 5 * Math.sin(2 * Math.PI * ti);
            const vo = mode === 'full' ? Math.abs(vs) : Math.max(vs, 0);
            return <circle key={i} cx={30 + ti * 360} cy={70 - vo * 8} r={1.4} fill={ACCENT} />;
          })}
          <circle
            cx={30 + time * 360}
            cy={70 - (mode === 'full' ? full : half) * 8}
            r={4}
            fill={ORANGE}
          />
        </svg>
      ) : (
        <svg viewBox="0 0 280 140" className="h-auto w-full max-w-sm" role="img" aria-label={t('diode_iv.aria')}>
          <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={2} />
          <line x1={40} y1={120} x2={240} y2={120} stroke={MUTED} />
          <line
            x1={40 + ((0.7 + 0.4) / 1.2) * 200}
            y1={20}
            x2={40 + ((0.7 + 0.4) / 1.2) * 200}
            y2={120}
            stroke={TEAL}
            strokeDasharray="4 4"
          />
          <text x={150} y={18} fontSize={11} fill={TEAL}>
            ~0.7 V
          </text>
        </svg>
      )}
      {mode === 'half' || mode === 'full' ? null : (
        <ControlsStack>
          <SliderRow label={t('sliders.vd')} value={vd} min={-0.2} max={0.85} step={0.01} onChange={setVd} />
        </ControlsStack>
      )}
    </VizPanel>
  );
}

function initialIbUa(mode?: string): number {
  if (mode === 'cutoff') return 0;
  if (mode === 'sat') return 120;
  return 40;
}

export function BjtLoadLineViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [ibUa, setIbUa] = useState(() => initialIbUa(mode));
  const vcc = 10;
  const rc = 1000;
  const beta = 100;
  const vceSat = 0.2;
  const icSat = (vcc - vceSat) / rc;
  const icActive = beta * (ibUa * 1e-6);
  const sat = icActive >= icSat;
  const cutoff = ibUa < 1;
  const ic = sat ? icSat : icActive;
  const vce = vcc - ic * rc;
  const icAxis = vcc / rc;
  const region = cutoff ? t('regions.cutoff') : sat ? t('regions.sat') : t('regions.active');

  return (
    <VizPanel caption={elecCaption(t, 'bjt_load_line', mode)}>
      <ElecGuide type="bjt_load_line" mode={mode} />
      <PhysStatus id={uid}>
        {t('bjt_load_line.status', {
          ic: present(ic * 1e3, 2),
          vce: present(vce, 2),
          region,
        })}
      </PhysStatus>
      <svg viewBox="0 0 280 140" className="h-auto w-full max-w-sm" role="img" aria-label={t('bjt_load_line.aria')}>
        <line x1={40} y1={20} x2={40} y2={120} stroke={MUTED} />
        <line x1={40} y1={120} x2={240} y2={120} stroke={MUTED} />
        <line x1={40} y1={30} x2={230} y2={120} stroke={TEAL} strokeWidth={2} />
        <circle cx={40 + (vce / vcc) * 190} cy={120 - (ic / icAxis) * 90} r={5} fill={ACCENT} />
        <text x={200} y={134} fontSize={11} fill={MUTED}>
          VCE
        </text>
        <text x={8} y={28} fontSize={11} fill={MUTED}>
          IC
        </text>
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.ib')} value={ibUa} min={0} max={160} step={1} onChange={setIbUa} />
      </ControlsStack>
    </VizPanel>
  );
}

export function OpampCircuitViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const isInt = mode === 'int';
  const [vin, setVin] = useState(1);
  const [rf, setRf] = useState(10);
  const [rg, setRg] = useState(1);
  const [rK, setRK] = useState(10);
  const [cUf, setCUf] = useState(1);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  useRafPlay(playing && isInt, setTime, { min: 0, max: 2, speed: 0.6, loop: true });
  const avInv = invertingGain(rf * 1e3, rg * 1e3);
  const avNinv = nonInvertingGain(rf * 1e3, rg * 1e3);
  const tau = rK * 1e3 * cUf * 1e-6;
  const vo = isInt
    ? integratorRamp(vin, time, rK * 1e3, cUf * 1e-6)
    : mode === 'buffer'
      ? vin
      : mode === 'ninv'
        ? avNinv * vin
        : avInv * vin;
  const clamped = Math.max(-12, Math.min(12, vo));
  const rampPts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 40; i += 1) {
      const ti = (i / 40) * 2;
      const yi = Math.max(-12, Math.min(12, integratorRamp(vin, ti, rK * 1e3, cUf * 1e-6)));
      out.push(`${210 + (ti / 2) * 90},${70 - (yi / 12) * 40}`);
    }
    return out.join(' ');
  }, [cUf, rK, vin]);

  return (
    <VizPanel caption={elecCaption(t, 'opamp_circuit', mode ?? 'inv')}>
      <ElecGuide type="opamp_circuit" mode={mode ?? 'inv'} />
      {isInt ? <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} /> : null}
      <PhysStatus id={uid}>
        {isInt
          ? t('opamp_circuit.statusInt', {
              rc: present(tau * 1e3, 2),
              vo: present(clamped, 2),
            })
          : t('opamp_circuit.statusAv', {
              av: present(mode === 'ninv' ? avNinv : mode === 'buffer' ? 1 : avInv, 2),
              vo: present(clamped, 2),
            })}
      </PhysStatus>
      <svg viewBox="0 0 320 120" className="h-auto w-full max-w-md" role="img" aria-label={t('opamp_circuit.aria')}>
        <polygon points="80,20 80,100 180,60" fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={70} cy={40} r={3} fill={TEAL} />
        <circle cx={70} cy={80} r={3} fill={ORANGE} />
        <text x={54} y={44} fontSize={12} fill={TEAL}>
          −
        </text>
        <text x={54} y={84} fontSize={12} fill={ORANGE}>
          +
        </text>
        <path d="M20 40 H70" stroke={ACCENT} strokeWidth={2} />
        <text x={8} y={36} fontSize={11} fill={MUTED}>
          Vin
        </text>
        {isInt ? (
          <>
            <rect x={28} y={32} width={28} height={14} fill={TEAL} />
            <text x={32} y={28} fontSize={10} fill={MUTED}>
              R
            </text>
            <path d="M180 60 H210 M70 40 V12 H210 V60" stroke={ACCENT} strokeWidth={2} fill="none" />
            <rect x={188} y={6} width={28} height={14} fill={ORANGE} />
            <text x={194} y={17} fontSize={10} fill={MUTED}>
              C
            </text>
            <polyline points={rampPts} fill="none" stroke={TEAL} strokeWidth={2} />
            <circle
              cx={210 + (time / 2) * 90}
              cy={70 - (clamped / 12) * 40}
              r={3}
              fill={ORANGE}
            />
          </>
        ) : (
          <>
            <path d="M180 60 H240" stroke={ACCENT} strokeWidth={2} />
            <rect x={200} y={18} width={40} height={14} fill={TEAL} />
            <text x={248} y={64} fontSize={12} fill={ACCENT}>
              Vo
            </text>
          </>
        )}
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.vin')} value={vin} min={-2} max={2} step={0.1} onChange={setVin} />
        {isInt ? (
          <>
            <SliderRow label={t('sliders.rK')} value={rK} min={1} max={50} step={1} onChange={setRK} />
            <SliderRow label={t('sliders.c')} value={cUf} min={0.1} max={5} step={0.1} onChange={setCUf} />
          </>
        ) : mode === 'buffer' ? null : (
          <>
            <SliderRow label={t('sliders.rf')} value={rf} min={1} max={50} step={1} onChange={setRf} />
            <SliderRow label={t('sliders.rg')} value={rg} min={1} max={20} step={1} onChange={setRg} />
          </>
        )}
      </ControlsStack>
    </VizPanel>
  );
}
