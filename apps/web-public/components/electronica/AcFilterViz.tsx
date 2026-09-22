'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ControlsStack, SliderRow, VizPanel } from '@/components/algebra/viz/controls';
import { present } from '@/components/algebra/viz/vectorPlane';
import { ACCENT, MUTED, ORANGE, TEAL } from '@/components/physics/viz/physPlot';
import { ElecGuide, elecCaption, PlayRow, PhysStatus, useRafPlay } from './elecChrome';
import {
  admittanceAngle,
  admittanceMag,
  cutoffHz,
  gainDb,
  impedanceAngle,
  impedanceMag,
  parallelResonanceZ,
  rcHighPassMag,
  rcLowPassMag,
  rlCutoffHz,
  rlLowPassMag,
  rmsFromPeak,
  seriesResonanceZ,
} from './elecMath';

type Props = { mode?: string };

export function PhasorDiagramViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [vp, setVp] = useState(10);
  const [phiDeg, setPhiDeg] = useState(30);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const w = 2 * Math.PI;
  useRafPlay(playing, setTime, { min: 0, max: 1, speed: 0.4, loop: true });
  const phi = (phiDeg * Math.PI) / 180;
  const inst = vp * Math.cos(w * time + phi);
  const rms = rmsFromPeak(vp);
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const ti = i / 80;
      const yi = vp * Math.cos(w * ti + phi);
      out.push(`${30 + ti * 180},${70 - (yi / 12) * 50}`);
    }
    return out.join(' ');
  }, [phi, vp, w]);
  const ang = w * time + phi;
  const cx = 300;
  const cy = 70;
  const len = (rms / 12) * 50;

  return (
    <VizPanel caption={elecCaption(t, 'phasor_diagram', mode)}>
      <ElecGuide type="phasor_diagram" mode={mode} />
      <PlayRow playing={playing} onToggle={() => setPlaying((p) => !p)} />
      <PhysStatus id={uid}>
        {t('phasor_diagram.status', {
          v: present(inst, 2),
          rms: present(rms, 2),
          phi: present(phiDeg, 0),
        })}
      </PhysStatus>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('phasor_diagram.aria')}>
        <polyline points={pts} fill="none" stroke={TEAL} strokeWidth={2} />
        <circle cx={30 + time * 180} cy={70 - (inst / 12) * 50} r={3} fill={ORANGE} />
        <circle cx={cx} cy={cy} r={52} fill="none" stroke={MUTED} />
        <line x1={cx} y1={cy} x2={cx + 52} y2={cy} stroke={MUTED} />
        <line
          x1={cx}
          y1={cy}
          x2={cx + len * Math.cos(ang)}
          y2={cy - len * Math.sin(ang)}
          stroke={ACCENT}
          strokeWidth={3}
        />
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.vp')} value={vp} min={2} max={12} step={0.5} onChange={setVp} />
        <SliderRow label={t('sliders.phi')} value={phiDeg} min={-90} max={90} step={1} onChange={setPhiDeg} />
      </ControlsStack>
    </VizPanel>
  );
}

export function ImpedanceTriangleViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [r, setR] = useState(30);
  const [x, setX] = useState(40);
  const z = impedanceMag(r, x);
  const angZ = (impedanceAngle(r, x) * 180) / Math.PI;
  const yMag = admittanceMag(r, x);
  const angY = (admittanceAngle(r, x) * 180) / Math.PI;
  const s = Math.hypot(r, x);
  const p = r;
  const q = x;
  const isPower = mode === 'power';
  const isY = mode === 'y';
  const scale = isY ? 1800 : 2;
  const hx = isY ? (r / (r * r + x * x)) * scale : r * scale;
  const hy = isY ? (Math.abs(-x / (r * r + x * x))) * scale : Math.abs(x) * scale;
  const ySign = x === 0 ? 1 : x > 0 ? -1 : 1;

  return (
    <VizPanel caption={elecCaption(t, 'impedance_triangle', mode ?? 'z')}>
      <ElecGuide type="impedance_triangle" mode={mode ?? 'z'} />
      <PhysStatus id={uid}>
        {isPower
          ? t('impedance_triangle.statusPower', {
              p: present(p, 1),
              q: present(q, 1),
              s: present(s, 1),
            })
          : isY
            ? t('impedance_triangle.statusY', {
                y: present(yMag, 4),
                ang: present(angY, 1),
              })
            : t('impedance_triangle.statusZ', {
                z: present(z, 2),
                ang: present(angZ, 1),
              })}
      </PhysStatus>
      <svg viewBox="0 0 260 160" className="h-auto w-full max-w-sm" role="img" aria-label={t('impedance_triangle.aria')}>
        <polygon
          points={`40,130 ${40 + hx},130 ${40 + hx},${130 - hy * (isY ? ySign || 1 : 1)}`}
          fill="color-mix(in oklab, var(--accent) 18%, transparent)"
          stroke={ACCENT}
          strokeWidth={2}
        />
        <text x={40 + hx / 2} y={148} fontSize={11} fill={MUTED}>
          {isPower ? 'P' : isY ? 'G' : 'R'}
        </text>
        <text x={48 + hx} y={130 - hy} fontSize={11} fill={MUTED}>
          {isPower ? 'Q' : isY ? 'B' : 'X'}
        </text>
      </svg>
      <ControlsStack>
        <SliderRow
          label={isPower ? t('sliders.p') : t('sliders.r')}
          value={r}
          min={5}
          max={60}
          step={1}
          onChange={setR}
        />
        <SliderRow
          label={isPower ? t('sliders.q') : t('sliders.x')}
          value={x}
          min={-50}
          max={50}
          step={1}
          onChange={setX}
        />
      </ControlsStack>
    </VizPanel>
  );
}

export function ResonanceCurveViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const [r, setR] = useState(10);
  const l = 1e-3;
  const c = 1e-6;
  const w0 = 1 / Math.sqrt(l * c);
  const series = mode !== 'parallel';
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const w = w0 * (0.2 + (i / 80) * 2.4);
      const z = series ? seriesResonanceZ(r, w, l, c) : parallelResonanceZ(Math.max(r, 1), w, l, c);
      const zMax = series ? 200 : 400;
      out.push(`${30 + (i / 80) * 360},${120 - (Math.min(z, zMax) / zMax) * 90}`);
    }
    return out.join(' ');
  }, [r, series, w0]);

  return (
    <VizPanel caption={elecCaption(t, 'resonance_curve', series ? 'series' : 'parallel')}>
      <ElecGuide type="resonance_curve" mode={series ? 'series' : 'parallel'} />
      <PhysStatus id={uid}>
        {t('resonance_curve.status', { w0: present(w0, 0), r: present(r, 1) })}
      </PhysStatus>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('resonance_curve.aria')}>
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={2} />
        <line
          x1={30 + ((1 - 0.2) / 2.4) * 360}
          y1={20}
          x2={30 + ((1 - 0.2) / 2.4) * 360}
          y2={120}
          stroke={TEAL}
          strokeDasharray="4 4"
        />
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.r')} value={r} min={2} max={80} step={1} onChange={setR} />
      </ControlsStack>
    </VizPanel>
  );
}

export function BodeFilterViz({ mode }: Props) {
  const t = useTranslations('vizElectronica');
  const uid = useId();
  const isRl = mode === 'lp_rl';
  const high = mode === 'hp_rc';
  const [r, setR] = useState(isRl ? 100 : 1000);
  const [c, setC] = useState(1);
  const [lMh, setLMh] = useState(15.9);
  const cap = c * 1e-6;
  const l = lMh * 1e-3;
  const fc = isRl ? rlCutoffHz(r, l) : cutoffHz(r, cap);
  const pts = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i <= 80; i += 1) {
      const f = fc * 10 ** ((i / 80) * 3 - 1.5);
      const w = 2 * Math.PI * f;
      const mag = isRl
        ? rlLowPassMag(w, r, l)
        : high
          ? rcHighPassMag(w, r, cap)
          : rcLowPassMag(w, r, cap);
      const db = Math.max(-40, Math.min(5, gainDb(mag)));
      out.push(`${30 + (i / 80) * 360},${30 + ((5 - db) / 45) * 90}`);
    }
    return out.join(' ');
  }, [cap, fc, high, isRl, l, r]);

  return (
    <VizPanel caption={elecCaption(t, 'bode_filter', mode ?? 'lp_rc')}>
      <ElecGuide type="bode_filter" mode={mode ?? 'lp_rc'} />
      <PhysStatus id={uid}>
        {t('bode_filter.status', {
          fc: present(fc, 1),
          mag: present(1 / Math.SQRT2, 3),
          db: present(gainDb(1 / Math.SQRT2), 2),
        })}
      </PhysStatus>
      <svg viewBox="0 0 420 140" className="h-auto w-full" role="img" aria-label={t('bode_filter.aria')}>
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth={2} />
        <line x1={210} y1={20} x2={210} y2={120} stroke={ORANGE} strokeDasharray="4 4" />
        <text x={214} y={18} fontSize={11} fill={ORANGE}>
          fc
        </text>
      </svg>
      <ControlsStack>
        <SliderRow label={t('sliders.r')} value={r} min={isRl ? 20 : 200} max={isRl ? 2000 : 8000} step={isRl ? 10 : 50} onChange={setR} />
        {isRl ? (
          <SliderRow label={t('sliders.l')} value={lMh} min={1} max={80} step={0.1} onChange={setLMh} />
        ) : (
          <SliderRow label={t('sliders.c')} value={c} min={0.1} max={5} step={0.1} onChange={setC} />
        )}
      </ControlsStack>
    </VizPanel>
  );
}
