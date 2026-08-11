'use client';

import { useId, useState } from 'react';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt } from './controls';

function present(n: number): string {
  return fmt(n, 0);
}

function power(varName: string, exp: number): string {
  if (exp === 0) return '';
  if (exp === 1) return varName;
  return `${varName}${toSup(exp)}`;
}

function toSup(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(n).split('').map((c) => map[c] ?? c).join('');
}

function monomial(vars: string[], alphas: number[]): string {
  const parts = vars.map((v, i) => power(v, alphas[i] ?? 0)).filter(Boolean);
  return parts.length ? parts.join('') : '1';
}

/**
 * Multiindex and total degree |α| (ALG-POL-008).
 */
export function MultiindexViz() {
  const [nVars, setNVars] = useState<2 | 3>(2);
  const [a1, setA1] = useState(3);
  const [a2, setA2] = useState(2);
  const [a3, setA3] = useState(1);
  const [coef, setCoef] = useState(1);
  const [showPoly, setShowPoly] = useState(false);
  const guideId = useId();
  const statusId = useId();

  const alphas = nVars === 2 ? [a1, a2] : [a1, a2, a3];
  const vars = nVars === 2 ? ['x', 'y'] : ['x', 'y', 'z'];
  const abs = alphas.reduce((s, v) => s + v, 0);
  const mono = monomial(vars, alphas);
  const withCoef = coef === 1 ? mono : coef === -1 && mono !== '1' ? `−${mono}` : `${present(coef)}${mono === '1' ? '' : mono}`;
  const alphaTuple = `(${alphas.join(',')})`;

  const polyTerms = [
    { c: 3, a: [3, 2] as number[], label: '3x³y²' },
    { c: 2, a: [2, 4] as number[], label: '2x²y⁴' },
    { c: 5, a: [1, 1] as number[], label: '5xy' },
  ];
  const polyDegrees = polyTerms.map((t) => t.a.reduce((s, v) => s + v, 0));
  const degP = Math.max(...polyDegrees);

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p id={guideId} className="text-sm font-medium leading-relaxed text-[var(--fg)]">
            Un multiíndice guarda los exponentes de un monomio. Por ejemplo, (3,2) representa x³y².
            El grado total se obtiene sumando sus componentes.
          </p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">
            Cambia los exponentes y observa cómo se actualizan el multiíndice, el monomio y su grado
            total. Cada componente indica el exponente de una variable.
          </p>
        </div>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-center">
          <p className="font-mono text-2xl font-semibold text-[var(--accent-strong)]">α={alphaTuple}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
            {alphas.map((v, i) => (
              <span key={i} className="font-mono">
                α<sub>{i + 1}</sub>={present(v)} → {power(vars[i], v) || `${vars[i]}⁰=1`}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-4 text-center space-y-2">
          <p className="font-mono text-lg">{alphaTuple}</p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono text-lg">
            x<sup>α</sup>={mono}
            {nVars === 2 && a1 === 3 && a2 === 2 ? ' (=x³y²)' : ''}
          </p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono text-lg">
            |α|={alphas.join('+')}={present(abs)}
          </p>
          <p className="text-[var(--fg-muted)]">↓</p>
          <p className="font-mono text-lg font-semibold">
            deg({withCoef})={present(abs)}
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
            Bloques = exponentes
          </p>
          <div className="flex flex-wrap items-end gap-4">
            {alphas.map((exp, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  {Array.from({ length: Math.max(exp, 0) }, (_, k) => (
                    <div
                      key={k}
                      className="flex h-8 w-8 items-center justify-center rounded border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-strong)_14%,transparent)] font-mono text-xs"
                    >
                      {vars[i]}
                    </div>
                  ))}
                  {exp === 0 ? (
                    <div className="flex h-8 items-center px-2 text-xs text-[var(--fg-muted)]">
                      (ausente)
                    </div>
                  ) : null}
                </div>
                <span className="font-mono text-xs text-[var(--fg-muted)]">
                  {present(exp)} = {exp > 0 ? Array(exp).fill('1').join('+') : '0'}
                </span>
              </div>
            ))}
            <div className="font-mono text-sm self-center">
              → |α|={alphas.join('+')}={present(abs)}
            </div>
          </div>
          {alphas.some((v) => v === 0) && abs > 0 ? (
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              Una componente igual a cero significa que esa variable no aparece explícitamente
              (porque {vars[alphas.findIndex((v) => v === 0)]}⁰=1).
            </p>
          ) : null}
          {abs === 0 ? (
            <p className="mt-2 text-xs text-[var(--fg-muted)]">
              α=(0,…,0) da el monomio constante 1; deg(c)=0 para cualquier constante no nula.
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-[var(--border)] px-3 py-3 text-sm">
          <p className="font-mono">|α|=∑ αᵢ · para dos variables |α|=α₁+α₂</p>
          <p className="mt-1 text-[var(--fg-muted)]">
            El coeficiente no afecta al grado: deg({coef}·{mono === '1' ? '1' : mono})={present(abs)}.
          </p>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            En general: α=(α₁,…,αₙ), x<sup>α</sup>=x₁<sup>α₁</sup>⋯xₙ<sup>αₙ</sup>, |α|=α₁+⋯+αₙ.
          </p>
        </section>

        {showPoly ? (
          <section className="rounded-xl border border-[var(--border)] px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fg-muted)]">
              Del monomio al polinomio
            </p>
            <p className="mt-1 font-mono text-sm">P(x,y)=3x³y²+2x²y⁴+5xy</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {polyTerms.map((t, i) => {
                const deg = polyDegrees[i];
                const max = deg === degP;
                return (
                  <div
                    key={t.label}
                    className={`rounded-lg border px-2 py-2 text-sm ${max ? 'border-[var(--accent-strong)] bg-[color-mix(in_oklab,var(--accent-strong)_10%,transparent)]' : 'border-[var(--border)]'}`}
                  >
                    <p className="font-mono font-semibold">{t.label}</p>
                    <p className="font-mono text-xs">α=({t.a.join(',')})</p>
                    <p className="font-mono text-xs">|α|={deg}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-sm">
              deg P=max({polyDegrees.join(',')})={degP}
            </p>
            <p className="text-xs text-[var(--fg-muted)]">
              El grado total de un polinomio es el mayor grado total de sus monomios.
            </p>
          </section>
        ) : null}

        <div id={statusId} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-mono" aria-live="polite">
          α={alphaTuple} · x<sup>α</sup>={mono} · |α|={present(abs)}
        </div>

        <ControlsStack>
          <ButtonRow>
            <VizButton active={nVars === 2} onClick={() => setNVars(2)}>2 variables</VizButton>
            <VizButton active={nVars === 3} onClick={() => setNVars(3)}>3 variables</VizButton>
            <VizButton active={showPoly} onClick={() => setShowPoly((s) => !s)}>Polinomio ejemplo</VizButton>
          </ButtonRow>
          <SliderRow label="α₁" value={a1} min={0} max={6} step={1} onChange={setA1} />
          <SliderRow label="α₂" value={a2} min={0} max={6} step={1} onChange={setA2} />
          {nVars === 3 ? (
            <SliderRow label="α₃" value={a3} min={0} max={6} step={1} onChange={setA3} />
          ) : null}
          <SliderRow label="c (coef.)" value={coef} min={-5} max={7} step={1} onChange={setCoef} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
