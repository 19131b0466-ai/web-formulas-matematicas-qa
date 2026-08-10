'use client';

import { useId, useMemo, useState } from 'react';
import { ControlsStack, SliderRow, VizPanel } from './controls';

const N_MIN = 1;
const N_MAX = 6;

function FactorBlock({ variant }: { variant: 'n' | 'm' }) {
  const isN = variant === 'n';
  return (
    <span
      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border-2 px-2 font-mono text-base font-semibold ${
        isN
          ? 'border-solid border-[var(--accent-strong)] bg-[var(--accent-soft)]'
          : 'border-dashed border-[var(--fg)] bg-[color-mix(in_oklab,teal_18%,transparent)]'
      }`}
      aria-hidden
    >
      a
    </span>
  );
}

function FactorSequence({
  count,
  variant,
  withDots,
}: {
  count: number;
  variant: 'n' | 'm';
  withDots?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-y-2">
      {Array.from({ length: count }, (_, i) => (
        <span key={`${variant}-${i}`} className="inline-flex items-center">
          {i > 0 ? (
            <span className="px-0.5 font-mono text-[var(--fg-muted)]" aria-hidden>
              ·
            </span>
          ) : null}
          <FactorBlock variant={variant} />
        </span>
      ))}
      {withDots ? (
        <span className="px-1 font-mono text-[var(--fg-muted)]" aria-hidden>
          ⋯
        </span>
      ) : null}
    </div>
  );
}

/**
 * Product of powers with equal base: a^n · a^m = a^{n+m} (ALG-POT-001).
 * Each tile is an explicit factor `a`; groups multiply, then merge.
 */
export function PowerProductViz() {
  const [n, setN] = useState(3);
  const [m, setM] = useState(2);
  const guideId = useId();
  const statusId = useId();

  const total = n + m;

  const ariaStatus = useMemo(
    () =>
      [
        `Primera potencia: a elevado a ${n}, formada por ${n} factores a.`,
        `Segunda potencia: a elevado a ${m}, formada por ${m} factores a.`,
        `Producto: ${total} factores a, equivalente a a elevado a ${total}.`,
      ].join(' '),
    [n, m, total],
  );

  const expand = (k: number) =>
    Array.from({ length: k }, (_, i) => (
      <span key={i}>
        {i > 0 ? ' · ' : ''}
        a
      </span>
    ));

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Cada bloque representa un factor <span className="font-mono">a</span>. Al multiplicar
            ambas potencias reunimos los <span className="font-mono">n</span> factores del primer
            grupo y los <span className="font-mono">m</span> del segundo. En total hay{' '}
            <span className="font-mono">n+m</span> factores <span className="font-mono">a</span>.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Esta regla se aplica porque las dos potencias tienen la misma base. Por eso se suman los
            exponentes; no se están sumando las potencias.
          </p>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
          Misma base · todos los factores son a
        </p>

        <div className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_65%,var(--bg-elevated))] px-3 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">{n} factores</p>
              <p className="mb-2 font-mono text-sm">
                a<sup>{n}</sup> = {expand(n)}
              </p>
              <FactorSequence count={n} variant="n" />
            </div>

            <div
              className="flex shrink-0 items-center justify-center px-2 font-mono text-2xl font-semibold"
              aria-label="multiplicado por"
            >
              ×
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-xs font-semibold text-[var(--fg-muted)]">{m} factores</p>
              <p className="mb-2 font-mono text-sm">
                a<sup>{m}</sup> = {expand(m)}
              </p>
              <FactorSequence count={m} variant="m" />
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[var(--fg-muted)]" aria-hidden>
          ↓ reunir todos los factores ↓
        </p>

        <div className="rounded-xl border border-[var(--border)] px-3 py-4">
          <p className="mb-3 font-mono text-sm text-[var(--fg)]">
            (a · ⋯ · a)<span className="text-[var(--fg-muted)]">ₙ</span>
            {' · '}
            (a · ⋯ · a)<span className="text-[var(--fg-muted)]">ₘ</span>
          </p>

          <div className="flex flex-wrap items-center gap-y-2">
            {Array.from({ length: n }, (_, i) => (
              <span key={`rn-${i}`} className="inline-flex items-center">
                {i > 0 ? <span className="px-0.5 font-mono text-[var(--fg-muted)]">·</span> : null}
                <FactorBlock variant="n" />
              </span>
            ))}
            <span
              className="mx-1.5 inline-block h-8 w-0.5 shrink-0 bg-[var(--fg-muted)] opacity-50"
              aria-hidden
              title="separación de origen n | m"
            />
            {Array.from({ length: m }, (_, i) => (
              <span key={`rm-${i}`} className="inline-flex items-center">
                {i > 0 ? <span className="px-0.5 font-mono text-[var(--fg-muted)]">·</span> : null}
                <FactorBlock variant="m" />
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--fg-muted)]">
            <span>
              borde sólido · <span className="font-mono">n = {n}</span> factores
            </span>
            <span>
              borde discontinuo · <span className="font-mono">m = {m}</span> factores
            </span>
          </div>
          <p className="mt-2 font-mono text-sm">
            {n} + {m} = {total} factores
          </p>
          <p className="mt-1 font-mono text-lg font-semibold">
            a<sup>{total}</sup>
          </p>
        </div>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_70%,var(--bg-elevated))] px-3 py-2 font-mono text-sm leading-relaxed"
          aria-live="polite"
        >
          <p>
            a<sup>{n}</sup> · a<sup>{m}</sup> = a<sup>
              {n}+{m}
            </sup>{' '}
            = a<sup>{total}</sup>
          </p>
          <p className="mt-1 text-[var(--fg-muted)]">
            a<sup>n</sup> · a<sup>m</sup> = a<sup>n+m</sup>
          </p>
        </div>

        <p className="sr-only">{ariaStatus}</p>

        <p className="text-xs leading-relaxed text-[var(--fg-muted)]">
          Cuidado: en general <span className="font-mono">aⁿ + aᵐ ≠ aⁿ⁺ᵐ</span>. Aquí se{' '}
          <em>multiplican</em> potencias de la misma base; por eso se suman los exponentes.
        </p>

        <ControlsStack>
          <SliderRow
            label="n"
            ariaLabel={`Exponente n, actualmente ${n}`}
            value={n}
            min={N_MIN}
            max={N_MAX}
            step={1}
            onChange={(val) => setN(Math.round(Math.min(N_MAX, Math.max(N_MIN, val))))}
          />
          <SliderRow
            label="m"
            ariaLabel={`Exponente m, actualmente ${m}`}
            value={m}
            min={N_MIN}
            max={N_MAX}
            step={1}
            onChange={(val) => setM(Math.round(Math.min(N_MAX, Math.max(N_MIN, val))))}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
