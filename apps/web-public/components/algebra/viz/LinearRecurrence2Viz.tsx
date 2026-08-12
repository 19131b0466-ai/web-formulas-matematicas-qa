'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from './controls';
import { formatRecurrence, present, snap, yExtent } from './sequencePlot';

/**
 * Linear recurrence of order 2: a_n = b a_{n-1} + c a_{n-2} (ALG-SEC-007).
 */
export function LinearRecurrence2Viz() {
  const [a0, setA0] = useState(1);
  const [a1, setA1] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(1);
  const [N, setN] = useState(12);
  const [sel, setSel] = useState(6);
  const [visible, setVisible] = useState(12);
  const [showChar, setShowChar] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const terms = useMemo(() => {
    const arr = [a0, a1];
    for (let n = 2; n <= N; n++) {
      arr.push(b * arr[n - 1]! + c * arr[n - 2]!);
    }
    return arr;
  }, [a0, a1, b, c, N]);

  const shown = Math.min(visible, N + 1);
  const shownTerms = terms.slice(0, shown);
  const k = Math.min(Math.max(2, sel), shown - 1);
  const an = terms[k]!;
  const an1 = terms[k - 1]!;
  const an2 = terms[k - 2]!;
  const contrib1 = b * an1;
  const contrib2 = c * an2;
  const { yMin, yMax } = yExtent(shownTerms);

  const W = 420;
  const H = 260;
  const M = { l: 40, r: 16, t: 16, b: 28 };
  const plotW = W - M.l - M.r;
  const plotH = H - M.t - M.b;
  const toX = (n: number) => M.l + (n / Math.max(1, shown - 1)) * plotW;
  const toY = (y: number) => M.t + ((yMax - y) / (yMax - yMin || 1)) * plotH;
  const y0 = toY(0);

  // Characteristic equation r² - b r - c = 0
  const disc = b * b + 4 * c;
  let rootsLabel = '';
  let r1 = NaN;
  let r2 = NaN;
  if (disc > 1e-9) {
    r1 = (b + Math.sqrt(disc)) / 2;
    r2 = (b - Math.sqrt(disc)) / 2;
    rootsLabel = 'Dos raíces reales distintas';
  } else if (Math.abs(disc) <= 1e-9) {
    r1 = b / 2;
    r2 = r1;
    rootsLabel = 'Una raíz real doble';
  } else {
    const re = b / 2;
    const im = Math.sqrt(-disc) / 2;
    rootsLabel = `Dos raíces complejas: ${present(re)}±${present(im)}i`;
  }

  const nextTerm = () => {
    setVisible((v) => Math.min(N + 1, Math.max(2, v) + 1));
    setSel((s) => Math.min(N, Math.max(2, Math.min(s + 1, shown))));
  };

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Una recurrencia de orden 2 construye cada término utilizando los dos anteriores.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia a₀, a₁, b y c, y selecciona un término para ver exactamente cómo se obtiene de los
            dos anteriores.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="font-mono text-base font-semibold">aₙ=b aₙ₋₁+c aₙ₋₂</p>
          <p className="mt-1 font-mono text-sm text-[var(--accent-strong)]">{formatRecurrence(b, c)}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            a₀={present(a0)} · a₁={present(a1)}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            <line x1={M.l} y1={y0} x2={W - M.r} y2={y0} stroke="currentColor" opacity={0.3} />
            <line x1={M.l} y1={M.t} x2={M.l} y2={H - M.b} stroke="currentColor" opacity={0.35} />
            <text x={W - M.r} y={H - 8} textAnchor="end" fontSize={11} opacity={0.7}>n</text>
            <text x={M.l + 6} y={M.t + 12} fontSize={11} opacity={0.7}>aₙ</text>

            {shownTerms.map((y, n) => {
              if (n === 0) return null;
              return (
                <line
                  key={`seg-${n}`}
                  x1={toX(n - 1)}
                  y1={toY(shownTerms[n - 1]!)}
                  x2={toX(n)}
                  y2={toY(y)}
                  stroke="currentColor"
                  strokeWidth={1.1}
                  opacity={0.35}
                />
              );
            })}

            {/* dependency arrows for selected term */}
            {k >= 2 ? (
              <>
                <line
                  x1={toX(k - 1)}
                  y1={toY(an1)}
                  x2={toX(k)}
                  y2={toY(an)}
                  stroke="teal"
                  strokeWidth={1.8}
                  markerEnd="url(#arrowTeal)"
                  opacity={0.85}
                />
                <line
                  x1={toX(k - 2)}
                  y1={toY(an2)}
                  x2={toX(k)}
                  y2={toY(an)}
                  stroke="orange"
                  strokeWidth={1.8}
                  opacity={0.85}
                />
                <defs>
                  <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="teal" />
                  </marker>
                </defs>
              </>
            ) : null}

            {shownTerms.map((y, n) => {
              const x = toX(n);
              const py = toY(y);
              const isSel = n === k;
              const isPrev = n === k - 1 || n === k - 2;
              const fill = isSel ? 'var(--accent-strong)' : isPrev ? (n === k - 1 ? 'teal' : 'orange') : 'var(--accent-strong)';
              const opacity = isSel || isPrev || n < 2 ? 1 : 0.55;
              return (
                <g
                  key={n}
                  style={{ cursor: n >= 2 ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (n >= 2) setSel(n);
                  }}
                >
                  <title>
                    {`n=${n}\naₙ=${present(y)}${n >= 2 ? `\naₙ=b·aₙ₋₁+c·aₙ₋₂` : ''}`}
                  </title>
                  <circle cx={x} cy={py} r={isSel ? 7 : isPrev ? 6 : 4.5} fill={fill} opacity={opacity} />
                  {(n === 0 || n === shown - 1 || n % Math.ceil(shown / 6) === 0 || isSel) && (
                    <text x={x} y={H - 10} textAnchor="middle" fontSize={9} opacity={0.5}>
                      {n}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </section>

        {k >= 2 ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p className="font-semibold text-[var(--accent-strong)]">
              a<sub>{k}</sub> = b·a<sub>{k - 1}</sub> + c·a<sub>{k - 2}</sub>
            </p>
            <p className="mt-1">
              <span className="text-teal">b·a<sub>{k - 1}</sub>={present(b)}·{present(an1)}={present(contrib1)}</span>
              {' · '}
              <span className="text-orange">c·a<sub>{k - 2}</sub>={present(c)}·{present(an2)}={present(contrib2)}</span>
            </p>
            <p className="mt-1">
              a<sub>{k}</sub>={present(contrib1)}{contrib2 >= 0 ? '+' : ''}{present(contrib2)}=
              <span className="font-semibold text-[var(--accent-strong)]">{present(an)}</span>
            </p>
          </section>
        ) : null}

        {showChar ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p className="font-semibold">r² − b r − c = 0</p>
            <p>
              r² − ({present(b)})r − ({present(c)}) = 0
            </p>
            <p className="mt-1">{rootsLabel}</p>
            {Number.isFinite(r1) && disc >= -1e-9 ? (
              <>
                <p>
                  r₁={present(r1)}
                  {Math.abs(r1 - r2) > 1e-9 ? ` · r₂=${present(r2)}` : ''}
                </p>
                {Math.abs(r1 - r2) > 1e-9 ? (
                  <p className="text-[var(--fg-muted)]">aₙ = A r₁ⁿ + B r₂ⁿ</p>
                ) : (
                  <p className="text-[var(--fg-muted)]">aₙ = (A + B n) r₁ⁿ</p>
                )}
              </>
            ) : (
              <p className="text-[var(--fg-muted)]">{rootsLabel}</p>
            )}
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm" aria-live="polite">
          {k >= 2
            ? `a${k}=${present(an)} · a${k}=${formatRecurrence(b, c).replace('aₙ', `a${k}`)} · N=${N}`
            : `${formatRecurrence(b, c)} · ${shown} términos mostrados`}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton onClick={nextTerm}>Siguiente término</VizButton>
            <VizButton onClick={() => setVisible(N + 1)}>Mostrar todos</VizButton>
            <VizButton active={showChar} onClick={() => setShowChar((v) => !v)}>
              Ver ecuación característica
            </VizButton>
          </ButtonRow>
          <ToggleRow label="Ver ecuación característica" checked={showChar} onChange={setShowChar} />
          <SliderRow label="a₀" value={a0} min={-5} max={5} step={0.5} onChange={(v) => setA0(snap(v, -5, 5, 0.5))} />
          <SliderRow label="a₁" value={a1} min={-5} max={5} step={0.5} onChange={(v) => setA1(snap(v, -5, 5, 0.5))} />
          <SliderRow label="b" value={b} min={-3} max={3} step={0.1} onChange={(v) => setB(snap(v, -3, 3, 0.1))} />
          <SliderRow label="c" value={c} min={-3} max={3} step={0.1} onChange={(v) => setC(snap(v, -3, 3, 0.1))} />
          <SliderRow
            label="N"
            value={N}
            min={5}
            max={30}
            step={1}
            onChange={(v) => {
              const nn = Math.round(v);
              setN(nn);
              setVisible(nn + 1);
            }}
          />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
