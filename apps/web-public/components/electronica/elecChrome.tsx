'use client';

import { useTranslations } from 'next-intl';
import { PlayRow, PhysStatus, useRafPlay } from '@/components/physics/viz/physChrome';

const MODE_KEYS: Record<string, string[]> = {
  voltage_divider: ['unloaded', 'loaded', 'current'],
  impedance_triangle: ['z', 'y', 'power'],
  bode_filter: ['lp_rc', 'fc', 'hp_rc', 'lp_rl'],
  opamp_circuit: ['inv', 'ninv', 'buffer', 'int'],
  sampling_pwm: ['nyquist', 'quant', 'pwm', 'r2r'],
  resonance_curve: ['series', 'parallel'],
};

export function ElecGuide({ type, mode }: { type: string; mode?: string }) {
  const t = useTranslations('vizElectronica');
  const useMode = Boolean(mode && MODE_KEYS[type]?.includes(mode));
  const idea = t(useMode ? `${type}.${mode}.idea` : `${type}.idea`);
  const tryIt = t(useMode ? `${type}.${mode}.tryIt` : `${type}.tryIt`);
  return (
    <div>
      <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{idea}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">{tryIt}</p>
    </div>
  );
}

export function elecCaption(t: (key: string) => string, type: string, mode?: string): string {
  const useMode = Boolean(mode && MODE_KEYS[type]?.includes(mode));
  return t(useMode ? `${type}.${mode}.caption` : `${type}.caption`);
}

export { PlayRow, PhysStatus, useRafPlay };
