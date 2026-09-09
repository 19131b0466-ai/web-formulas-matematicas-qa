'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, VizButton } from '@/components/algebra/viz/controls';
import { physCopy } from './physCopy';

export function PhysGuide({ type, mode }: { type: string; mode?: string }) {
  const { idea, tryIt } = physCopy(type, mode);
  return (
    <div>
      <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{idea}</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--fg-muted)]">{tryIt}</p>
    </div>
  );
}

export function PhysStatus({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div
      id={id}
      className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs leading-relaxed"
      aria-live="polite"
    >
      {children}
    </div>
  );
}

export function PlayRow({
  playing,
  onToggle,
  extra,
}: {
  playing: boolean;
  onToggle: () => void;
  extra?: ReactNode;
}) {
  const t = useTranslations('vizFisica');
  return (
    <ButtonRow>
      <VizButton onClick={onToggle} active={playing}>
        {playing ? t('pause') : t('play')}
      </VizButton>
      {extra}
    </ButtonRow>
  );
}

/** Advance `t` while playing. Caller owns state. */
export function useRafPlay(
  playing: boolean,
  setT: (updater: (prev: number) => number) => void,
  opts: { min: number; max: number; speed: number; loop?: boolean },
) {
  const { min, max, speed, loop = true } = opts;
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setT((prev) => {
        const next = prev + dt * speed;
        if (next >= max) return loop ? min : max;
        if (next < min) return min;
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, setT, min, max, speed, loop]);
}
