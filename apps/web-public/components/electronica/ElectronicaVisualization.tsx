'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

export type ElecVizType =
  | 'voltage_divider'
  | 'thevenin_norton'
  | 'rc_transient'
  | 'rlc_damping'
  | 'phasor_diagram'
  | 'impedance_triangle'
  | 'resonance_curve'
  | 'bode_filter'
  | 'diode_iv'
  | 'bjt_load_line'
  | 'opamp_circuit'
  | 'cmos_vtc'
  | 'flip_flop_timing'
  | 'sampling_pwm'
  | 'electronics_guide';

type VizProps = { mode?: string };

type Props = {
  type: ElecVizType | string;
  concept?: string;
  mode?: string;
  formulaId?: string;
};

function viz(loader: () => Promise<{ default: ComponentType<VizProps> }>) {
  return dynamic(loader, {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]" />
    ),
  });
}

const VoltageDividerViz = viz(() =>
  import('./AnalogNetworkViz').then((m) => ({ default: m.VoltageDividerViz })),
);
const TheveninNortonViz = viz(() =>
  import('./AnalogNetworkViz').then((m) => ({ default: m.TheveninNortonViz })),
);
const RcTransientViz = viz(() =>
  import('./AnalogNetworkViz').then((m) => ({ default: m.RcTransientViz })),
);
const RlcDampingViz = viz(() =>
  import('./AnalogNetworkViz').then((m) => ({ default: m.RlcDampingViz })),
);
const PhasorDiagramViz = viz(() =>
  import('./AcFilterViz').then((m) => ({ default: m.PhasorDiagramViz })),
);
const ImpedanceTriangleViz = viz(() =>
  import('./AcFilterViz').then((m) => ({ default: m.ImpedanceTriangleViz })),
);
const ResonanceCurveViz = viz(() =>
  import('./AcFilterViz').then((m) => ({ default: m.ResonanceCurveViz })),
);
const BodeFilterViz = viz(() =>
  import('./AcFilterViz').then((m) => ({ default: m.BodeFilterViz })),
);
const DiodeIvViz = viz(() => import('./DeviceViz').then((m) => ({ default: m.DiodeIvViz })));
const BjtLoadLineViz = viz(() => import('./DeviceViz').then((m) => ({ default: m.BjtLoadLineViz })));
const OpampCircuitViz = viz(() => import('./DeviceViz').then((m) => ({ default: m.OpampCircuitViz })));
const CmosVtcViz = viz(() => import('./DigitalViz').then((m) => ({ default: m.CmosVtcViz })));
const FlipFlopTimingViz = viz(() =>
  import('./DigitalViz').then((m) => ({ default: m.FlipFlopTimingViz })),
);
const SamplingPwmViz = viz(() => import('./DigitalViz').then((m) => ({ default: m.SamplingPwmViz })));
const ElectronicaGuideViz = viz(() =>
  import('./DigitalViz').then((m) => ({ default: m.ElectronicaGuideViz })),
);

export function ElectronicaVisualization({ type, concept, mode }: Props) {
  const t = useTranslations('seo');
  let body: ReactNode;

  switch (type) {
    case 'voltage_divider':
      body = <VoltageDividerViz mode={mode} />;
      break;
    case 'thevenin_norton':
      body = <TheveninNortonViz mode={mode} />;
      break;
    case 'rc_transient':
      body = <RcTransientViz mode={mode} />;
      break;
    case 'rlc_damping':
      body = <RlcDampingViz mode={mode} />;
      break;
    case 'phasor_diagram':
      body = <PhasorDiagramViz mode={mode} />;
      break;
    case 'impedance_triangle':
      body = <ImpedanceTriangleViz mode={mode} />;
      break;
    case 'resonance_curve':
      body = <ResonanceCurveViz mode={mode} />;
      break;
    case 'bode_filter':
      body = <BodeFilterViz mode={mode} />;
      break;
    case 'diode_iv':
      body = <DiodeIvViz mode={mode} />;
      break;
    case 'bjt_load_line':
      body = <BjtLoadLineViz mode={mode} />;
      break;
    case 'opamp_circuit':
      body = <OpampCircuitViz mode={mode} />;
      break;
    case 'cmos_vtc':
      body = <CmosVtcViz mode={mode} />;
      break;
    case 'flip_flop_timing':
      body = <FlipFlopTimingViz mode={mode} />;
      break;
    case 'sampling_pwm':
      body = <SamplingPwmViz mode={mode} />;
      break;
    case 'electronics_guide':
      body = <ElectronicaGuideViz />;
      break;
    default:
      body = (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm text-[var(--fg-muted)]">
          {t('comingSoonViz', { type: concept ? `${type}: ${concept}` : type })}
        </div>
      );
  }

  return (
    <section className="animate-rise" style={{ animationDelay: '90ms' }}>
      {body}
    </section>
  );
}
