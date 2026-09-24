'use client';

import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ACCENT, MUTED, ORANGE, TEAL } from '@/components/physics/viz/physPlot';
import { ElecGuide, elecCaption, PlayRow, PhysStatus, useRafPlay } from './elecChrome';
import { noiseMarginHigh, noiseMarginLow, nyquistRate, pwmDuty, quantStep, r2rDac } from './elecMath';

type Props = { mode?: string };

export function CmosVtcViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [vin, setVin] = useState(1.6);
  const vdd = 3.3;
  const vol = 0.1;
  const voh = 3.2;
  const vil = 0.8;
  const vih = 2.0;
  const vm = vdd / 2;
  const vo = vdd / (1 + Math.exp(8 * (vin - vm)));
  const nmh = noiseMarginHigh(voh, vih);
  const nml = noiseMarginLow(vil, vol);

  return (
    <VizPanel caption={elecCaption(t, 'cmos_vtc', mode)}>
      <ElecGuide type="cmos_vtc" mode={mode} />
      <PhysStatus id={uid}>
        {t('cmos_vtc.status', { vo: present(vo, 2), nmh: present(nmh, 2), nml: present(nml, 2) })}
      </PhysStatus>
      <svg viewBox="0 0 280 150" className="h-auto w-full max-w-sm" role="img" aria-label={t('cmos_vtc.aria')}>
        {Array.from({ length: 40 }, (_, i) => {
          const x = (i / 39) * vdd;
          const y = vdd / (1 + Math.exp(8 * (x - vm)));
          return <circle key={i} cx={40 + (x / vdd) * 200} cy={120 - (y / vdd) * 90} r={1.6} fill={ACCENT} />;
        })}
        <line x1={40 + (vil / vdd) * 200} y1={20} x2={40 + (vil / vdd) * 200} y2={120} stroke={TEAL} strokeDasharray="3 3" />
        <line x1={40 + (vih / vdd) * 200} y1={20} x2={40 + (vih / vdd) * 200} y2={120} stroke={ORANGE} strokeDasharray="3 3" />
        <circle cx={40 + (vin / vdd) * 200} cy={120 - (vo / vdd) * 90} r={4} fill={ACCENT} />
        <text x={48} y={16} fontSize={10} fill={MUTED}>
          VIL / VIH
        </text>
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.vin')} value={vin} min={0} max={3.3} step={0.05} onChange={setVin} />
      </ControlsStack>
    </VizPanel>
  );
}

export function FlipFlopTimingViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [tsu, setTsu] = useState(2);
  const [th, setTh] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  useRafPlay(playing, setTime, { min: 0, max: 10, speed: 1.8, loop: true });
  const edge = 5;
  const dStable = time < edge - tsu || time > edge + th;
  const inWindow = !dStable;

  return (
    <VizPanel caption={elecCaption(t, 'flip_flop_timing', mode)}>
      <ElecGuide type="flip_flop_timing" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <PhysStatus id={uid}>
        {t('flip_flop_timing.status', {
          tsu: present(tsu, 1),
          th: present(th, 1),
          window: inWindow ? t('regions.window') : t('regions.stable'),
        })}
      </PhysStatus>
      <svg viewBox="0 0 420 120" className="h-auto w-full" role="img" aria-label={t('flip_flop_timing.aria')}>
        <path d="M20 80 H180 V40 H420" stroke={MUTED} strokeWidth={2} fill="none" />
        <text x={24} y={34} fontSize={11} fill={MUTED}>
          CLK
        </text>
        <rect x={180 - tsu * 12} y={70} width={tsu * 12} height={16} fill={TEAL} opacity={0.4} />
        <rect x={180} y={70} width={th * 12} height={16} fill={ORANGE} opacity={0.4} />
        <text x={180 - tsu * 12} y={66} fontSize={10} fill={TEAL}>
          tsu
        </text>
        <text x={184} y={66} fontSize={10} fill={ORANGE}>
          th
        </text>
        <circle cx={20 + time * 38} cy={50} r={4} fill={ACCENT} />
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.tsu')} value={tsu} min={0.5} max={4} step={0.1} onChange={setTsu} />
        <SliderRow label={t('sliders.th')} value={th} min={0.2} max={3} step={0.1} onChange={setTh} />
      </ControlsStack>
    </VizPanel>
  );
}

export function SamplingPwmViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const isR2r = mode === 'r2r';
  const isQuant = mode === 'quant';
  const [fmax, setFmax] = useState(1000);
  const [fs, setFs] = useState(2500);
  const [bits, setBits] = useState(isR2r ? 3 : 4);
  const [code, setCode] = useState(0b101);
  const [duty, setDuty] = useState(0.4);
  const nyq = nyquistRate(fmax);
  const ok = fs > nyq;
  const delta = quantStep(5, bits);
  const vref = 8;
  const maxCode = 2 ** bits - 1;
  const clampedCode = Math.min(code, maxCode);
  const voDac = r2rDac(vref, bits, clampedCode);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  useRafPlay(playing, setTime, { min: 0, max: 1, speed: 0.5, loop: true });
  const on = time % 1 < duty;
  const binary = clampedCode.toString(2).padStart(bits, '0');

  return (
    <VizPanel caption={elecCaption(t, 'sampling_pwm', mode ?? 'nyquist')}>
      <ElecGuide type="sampling_pwm" mode={mode ?? 'nyquist'} />
      {mode === 'pwm' ? <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} /> : null}
      <PhysStatus id={uid}>
        {mode === 'pwm'
          ? t('sampling_pwm.statusPwm', { duty: present(pwmDuty(duty, 1), 2) })
          : isQuant
            ? t('sampling_pwm.statusQuant', { delta: present(delta, 3), n: 2 ** bits })
            : isR2r
              ? t('sampling_pwm.statusR2r', {
                  bits: binary,
                  vo: present(voDac, 2),
                  vref: present(vref, 0),
                })
              : t('sampling_pwm.statusNyquist', {
                  fs: present(fs, 0),
                  nyq: present(nyq, 0),
                  ok: ok ? t('regions.nyquistOk') : t('regions.aliasing'),
                })}
      </PhysStatus>
      {mode === 'pwm' ? (
        <svg viewBox="0 0 420 90" className="h-auto w-full" role="img" aria-label={t('sampling_pwm.ariaPwm')}>
          <path
            d={`M20 70 H${20 + duty * 380} V30 H${20 + 380} V70`}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2}
          />
          <circle cx={20 + (time % 1) * 380} cy={on ? 30 : 70} r={4} fill={ORANGE} />
        </svg>
      ) : isR2r ? (
        <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('sampling_pwm.ariaR2r')}>
          {Array.from({ length: bits }, (_, i) => {
            const bit = (clampedCode >> (bits - 1 - i)) & 1;
            const x = 30 + i * 90;
            return (
              <g key={i}>
                <rect x={x} y={20} width={54} height={36} fill={bit ? TEAL : MUTED} opacity={0.85} />
                <text x={x + 8} y={42} fontSize={12} fill="white">
                  b{i + 1}={bit}
                </text>
                <text x={x + 8} y={72} fontSize={10} fill={MUTED}>
                  1/{2 ** (i + 1)}
                </text>
                <rect x={x + 16} y={84} width={22} height={10} fill={ORANGE} />
                <text x={x + 12} y={110} fontSize={10} fill={MUTED}>
                  2R
                </text>
              </g>
            );
          })}
          <text x={30} y={132} fontSize={11} fill={ACCENT}>
            Vo
          </text>
          <path d={`M300 120 V${120 + Math.max(-80, Math.min(80, voDac * 8))}`} stroke={ACCENT} strokeWidth={8} />
        </svg>
      ) : (
        <svg viewBox="0 0 420 90" className="h-auto w-full" role="img" aria-label={t('sampling_pwm.aria')}>
          {Array.from({ length: 2 ** Math.min(bits, 5) }, (_, i) => (
            <line
              key={i}
              x1={20}
              y1={80 - (i / (2 ** Math.min(bits, 5) - 1)) * 60}
              x2={400}
              y2={80 - (i / (2 ** Math.min(bits, 5) - 1)) * 60}
              stroke={MUTED}
              opacity={0.5}
            />
          ))}
        </svg>
      )}
      <ControlsStack>
        {mode === 'pwm' ? (
          <SliderRow label={t('sliders.duty')} value={duty} min={0.05} max={0.95} step={0.01} onChange={setDuty} />
        ) : isQuant ? (
          <SliderRow label={t('sliders.bits')} value={bits} min={2} max={8} step={1} onChange={setBits} />
        ) : isR2r ? (
          <>
            <SliderRow
              label={t('sliders.bits')}
              value={bits}
              min={2}
              max={6}
              step={1}
              onChange={(n) => {
                setBits(n);
                setCode((prev) => Math.min(prev, 2 ** n - 1));
              }}
            />
            <SliderRow label={t('sliders.code')} value={clampedCode} min={0} max={maxCode} step={1} onChange={setCode} />
          </>
        ) : (
          <>
            <SliderRow label={t('sliders.fmax')} value={fmax} min={200} max={2000} step={50} onChange={setFmax} />
            <SliderRow label={t('sliders.fs')} value={fs} min={500} max={6000} step={50} onChange={setFs} />
          </>
        )}
      </ControlsStack>
    </VizPanel>
  );
}

const GUIDE_KEYS = ['dc', 'transient', 'rlc', 'phasors', 'filter', 'diode', 'opamp', 'ff'] as const;
type GuideKey = (typeof GUIDE_KEYS)[number];

export function ElectronicaGuideViz() {
  const t = useTranslations('vizElectronica');
  const [selected, setSelected] = useState<GuideKey | null>(null);
  return (
    <VizPanel caption={elecCaption(t, 'electronics_guide')}>
      <ElecGuide type="electronics_guide" />
      <div className="mt-3 grid gap-2 sm:grid-cols-2" role="group" aria-label={t('electronics_guide.caption')}>
        {GUIDE_KEYS.map((key) => (
          <VizButton
            key={key}
            active={selected === key}
            pressed={selected === key}
            onClick={() => setSelected(key)}
          >
            {t(`electronics_guide.${key}`)}
          </VizButton>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed" aria-live="polite">
        {selected ? t(`electronics_guide.results.${selected}`) : t('electronics_guide.waiting')}
      </p>
    </VizPanel>
  );
}
