'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ACCENT, MUTED, ORANGE, TEAL } from '@/components/physics/viz/physPlot';
import { ElecGuide, elecCaption, PlayRow, PhysStatus, useRafPlay } from './elecChrome';
import {
  currentDivider,
  dampedOmega,
  dampingRatio,
  dampingRegion,
  firstOrder,
  loadedDivider,
  maxPower,
  nortonCurrentThroughLoad,
  rcTau,
  rlTau,
  seriesAlpha,
  seriesCriticalR,
  theveninLoadVoltage,
  timeDisplayScale,
  voltageDivider,
  omega0,
} from './elecMath';

type Props = { mode?: string };

export function VoltageDividerViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const isCurrent = mode === 'current';
  const [vi, setVi] = useState(12);
  const [itMa, setItMa] = useState(6);
  const [r1, setR1] = useState(2000);
  const [r2, setR2] = useState(1000);
  const [rl, setRl] = useState(2000);
  const voOpen = voltageDivider(vi, r1, r2);
  const voLoad = loadedDivider(vi, r1, r2, rl);
  const vo = mode === 'loaded' ? voLoad : voOpen;
  const it = itMa * 1e-3;
  const i1 = currentDivider(it, r1, r2);
  const i2 = it - i1;
  const maxV = Math.max(vi, 1);

  return (
    <VizPanel caption={elecCaption(t, 'voltage_divider', mode ?? 'unloaded')}>
      <ElecGuide type="voltage_divider" mode={mode ?? 'unloaded'} />
      <PhysStatus id={uid}>
        {isCurrent
          ? t('voltage_divider.statusI', {
              i1: present(i1 * 1e3, 3),
              i2: present(i2 * 1e3, 3),
              it: present(itMa, 3),
            })
          : t('voltage_divider.statusVo', {
              vo: present(vo, 3),
              open: present(voOpen, 3),
            })}
      </PhysStatus>
      <svg
        viewBox="0 0 420 160"
        className="h-auto w-full"
        role="img"
        aria-label={isCurrent ? t('voltage_divider.ariaCurrent') : t('voltage_divider.aria')}
      >
        {isCurrent ? (
          <>
            <rect x={24} y={50} width={28} height={60} fill={ORANGE} />
            <text x={18} y={42} fontSize={11} fill={ORANGE}>
              IT
            </text>
            <path d="M52 80 H120" stroke={ACCENT} strokeWidth={2} fill="none" />
            <rect x={120} y={24} width={18} height={50} fill={TEAL} />
            <text x={144} y={40} fontSize={11} fill={MUTED}>
              R1
            </text>
            <rect x={120} y={90} width={18} height={50} fill={TEAL} />
            <text x={144} y={118} fontSize={11} fill={MUTED}>
              R2
            </text>
            <path d="M129 24 H220 V140 H129" stroke={ACCENT} strokeWidth={2} fill="none" />
            <path d="M129 74 H220 M129 90 H220" stroke={ACCENT} strokeWidth={2} fill="none" />
            <path d={`M300 140 V${140 - (i1 / Math.max(it, 1e-9)) * 100}`} stroke={TEAL} strokeWidth={8} />
            <text x={312} y={36} fontSize={11} fill={TEAL}>
              I1
            </text>
            <path d={`M360 140 V${140 - (i2 / Math.max(it, 1e-9)) * 100}`} stroke={ORANGE} strokeWidth={8} />
            <text x={372} y={36} fontSize={11} fill={ORANGE}>
              I2
            </text>
          </>
        ) : (
          <>
            <rect x={30} y={60} width={22} height={40} fill={ORANGE} />
            <path d="M52 80 H120" stroke={ACCENT} strokeWidth={2} fill="none" />
            <rect x={120} y={40} width={18} height={80} fill={TEAL} />
            <text x={145} y={50} fontSize={11} fill={MUTED}>
              R1
            </text>
            <path d="M129 120 V140 H220 V120" stroke={ACCENT} strokeWidth={2} fill="none" />
            <rect x={211} y={40} width={18} height={80} fill={TEAL} />
            <text x={236} y={50} fontSize={11} fill={MUTED}>
              R2
            </text>
            {mode === 'loaded' ? (
              <>
                <rect x={280} y={40} width={18} height={80} fill={ORANGE} opacity={0.7} />
                <text x={304} y={50} fontSize={11} fill={MUTED}>
                  RL
                </text>
                <path d="M229 40 H289" stroke={ACCENT} strokeWidth={2} fill="none" />
                <path d="M229 120 H289" stroke={ACCENT} strokeWidth={2} fill="none" />
              </>
            ) : null}
            <circle cx={229} cy={40} r={4} fill={ACCENT} />
            <path d={`M360 140 V${140 - (vo / maxV) * 100}`} stroke={ACCENT} strokeWidth={8} />
            <text x={372} y={36} fontSize={11} fill={ACCENT}>
              Vo
            </text>
          </>
        )}
      </svg>
      <ControlsStack>
        {isCurrent ? (
          <SliderRow label={t('sliders.it')} value={itMa} min={1} max={20} step={0.5} onChange={setItMa} />
        ) : (
          <SliderRow label={t('sliders.vi')} value={vi} min={1} max={24} step={0.5} onChange={setVi} />
        )}
        <SliderRow label={t('sliders.r1')} value={r1} min={200} max={8000} step={50} onChange={setR1} />
        <SliderRow label={t('sliders.r2')} value={r2} min={200} max={8000} step={50} onChange={setR2} />
        {mode === 'loaded' ? (
          <SliderRow label={t('sliders.rl')} value={rl} min={200} max={8000} step={50} onChange={setRl} />
        ) : null}
      </ControlsStack>
    </VizPanel>
  );
}

export function TheveninNortonViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [vth, setVth] = useState(10);
  const [rth, setRth] = useState(50);
  const [rl, setRl] = useState(50);
  const inort = rth === 0 ? 0 : vth / rth;
  const vl = theveninLoadVoltage(vth, rth, rl);
  const il = nortonCurrentThroughLoad(inort, rth, rl);
  const pmax = maxPower(vth, rth);
  const p = (vl * vl) / Math.max(rl, 1e-9);

  return (
    <VizPanel caption={elecCaption(t, 'thevenin_norton', mode)}>
      <ElecGuide type="thevenin_norton" mode={mode} />
      <PhysStatus id={uid}>
        {t('thevenin_norton.status', {
          vl: present(vl, 3),
          il: present(il * 1e3, 3),
          p: present(p * 1e3, 3),
          pmax: present(pmax * 1e3, 3),
        })}
      </PhysStatus>
      <svg viewBox="0 0 420 130" className="h-auto w-full" role="img" aria-label={t('thevenin_norton.aria')}>
        <rect x={40} y={45} width={28} height={48} fill={ORANGE} />
        <text x={36} y={38} fontSize={11} fill={ORANGE}>
          VTh
        </text>
        <rect x={140} y={52} width={70} height={22} fill={TEAL} />
        <text x={150} y={48} fontSize={11} fill={MUTED}>
          RTh
        </text>
        <rect x={280} y={40} width={22} height={70} fill={ACCENT} />
        <text x={308} y={78} fontSize={11} fill={MUTED}>
          RL
        </text>
        <path d="M68 69 H140 M210 63 H280 M291 110 H68 V69" stroke={ACCENT} strokeWidth={2} fill="none" />
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.vth')} value={vth} min={1} max={20} step={0.5} onChange={setVth} />
        <SliderRow label={t('sliders.rth')} value={rth} min={5} max={200} step={1} onChange={setRth} />
        <SliderRow label={t('sliders.rl')} value={rl} min={5} max={200} step={1} onChange={setRl} />
      </ControlsStack>
    </VizPanel>
  );
}

export function RcTransientViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const isRl = mode?.startsWith('rl');
  const discharge = mode === 'discharge' || mode === 'rl_discharge';
  const [r, setR] = useState(1000);
  const [c, setC] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const tau = isRl ? rlTau(c * 1e-3, r) : rcTau(r, c * 1e-6);
  const tmax = 5 * Math.max(tau, 1e-6);
  const timeScale = timeDisplayScale(tau);
  useRafPlay(playing, setTime, { min: 0, max: tmax, speed: tmax / 4, loop: true });
  const vInf = discharge ? 0 : 5;
  const v0 = discharge ? 5 : 0;
  const y = firstOrder(vInf, v0, time, tau);
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const ti = (i / 80) * tmax;
      const yi = firstOrder(vInf, v0, ti, tau);
      out.push(`${40 + (ti / tmax) * 340},${120 - (yi / 5) * 90}`);
    }
    return out.join(' ');
  }, [discharge, tau, tmax, v0, vInf]);

  return (
    <VizPanel caption={elecCaption(t, 'rc_transient', mode)}>
      <ElecGuide type="rc_transient" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <PhysStatus id={uid}>
        {t('rc_transient.status', {
          t: present(time * timeScale.scale, 2),
          tau: present(tau * timeScale.scale, 2),
          unit: timeScale.unit,
          y: present(y, 3),
        })}
      </PhysStatus>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('rc_transient.aria')}>
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={40 + (time / tmax) * 340} cy={120 - (y / 5) * 90} r={4} fill={ORANGE} />
        <line
          x1={40 + (tau / tmax) * 340}
          y1={20}
          x2={40 + (tau / tmax) * 340}
          y2={120}
          stroke={TEAL}
          strokeDasharray="4 4"
        />
        <text x={40 + (tau / tmax) * 340 + 4} y={18} fontSize={11} fill={TEAL}>
          τ
        </text>
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.r')} value={r} min={200} max={5000} step={50} onChange={setR} />
        <SliderRow
          label={isRl ? t('sliders.l') : t('sliders.c')}
          value={c}
          min={0.2}
          max={10}
          step={0.1}
          onChange={setC}
        />
      </ControlsStack>
    </VizPanel>
  );
}

export function RlcDampingViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const l = 1e-3;
  const c = 1e-6;
  const rCrit = seriesCriticalR(l, c);
  const [r, setR] = useState(mode === 'under' ? 20 : mode === 'critical' ? rCrit : 200);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const w0 = omega0(l, c);
  const alpha = seriesAlpha(r, l);
  const zeta = dampingRatio(alpha, w0);
  const region = dampingRegion(zeta);
  const wd = dampedOmega(w0, zeta);
  const tmax = 0.008;
  useRafPlay(playing, setTime, { min: 0, max: tmax, speed: tmax / 5, loop: true });

  function yOf(ti: number): number {
    if (zeta > 1.02) {
      const s1 = -alpha + Math.sqrt(alpha * alpha - w0 * w0);
      const s2 = -alpha - Math.sqrt(alpha * alpha - w0 * w0);
      const a = s2 / (s2 - s1);
      const b = 1 - a;
      return a * Math.exp(s1 * ti) + b * Math.exp(s2 * ti);
    }
    if (zeta >= 0.98) return (1 + alpha * ti) * Math.exp(-alpha * ti);
    return Math.exp(-alpha * ti) * Math.cos(wd * ti);
  }

  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 100; i += 1) {
      const ti = (i / 100) * tmax;
      out.push(`${30 + (ti / tmax) * 360},${80 - yOf(ti) * 50}`);
    }
    return out.join(' ');
  }, [alpha, tmax, w0, wd, zeta]);

  const y = yOf(time);
  const label =
    region === 'over' ? t('regions.over') : region === 'critical' ? t('regions.critical') : t('regions.under');

  return (
    <VizPanel caption={elecCaption(t, 'rlc_damping', mode)}>
      <ElecGuide type="rlc_damping" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <PhysStatus id={uid}>
        {t('rlc_damping.status', { zeta: present(zeta, 3), label, w0: present(w0, 1) })}
      </PhysStatus>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('rlc_damping.aria')}>
        <line x1={30} y1={80} x2={390} y2={80} stroke={MUTED} />
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={2} />
        <circle cx={30 + (time / tmax) * 360} cy={80 - y * 50} r={4} fill={ORANGE} />
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.r')} value={r} min={5} max={400} step={0.1} onChange={setR} />
      </ControlsStack>
    </VizPanel>
  );
}
