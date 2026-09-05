'use client';

import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, ControlsStack, SliderRow, ToggleRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { fmt } from './calcMath';

type CaseId = 'asin' | 'atan' | 'asec';

const CASES: { id: CaseId; label: string }[] = [
  { id: 'asin', label: '√(a² − x²)' },
  { id: 'atan', label: '√(a² + x²)' },
  { id: 'asec', label: '√(x² − a²)' },
];

const W = 460;
const H = 300;

export function TrigSubstitutionViz() {
  const statusId = useId();
  const t = useTranslations('vizCalc');
  const [caseId, setCaseId] = useState<CaseId>('asin');
  const [a, setA] = useState(2);
  const [theta, setTheta] = useState(0.7);
  const [showAngle, setShowAngle] = useState(true);
  const [showAlgebra, setShowAlgebra] = useState(true);

  const thetaMax = caseId === 'asin' ? Math.PI / 2 - 0.02 : Math.PI / 2 - 0.08;
  const th = Math.min(theta, thetaMax);

  const model = useMemo(() => {
    const s = Math.sin(th);
    const c = Math.cos(th);
    const t = Math.tan(th);
    if (caseId === 'asin') {
      const x = a * s;
      const adj = a * c;
      return {
        hyp: a,
        opp: x,
        adj,
        x,
        dx: `a cos(θ) dθ`,
        subst: 'x = a sen(θ)',
        radical: '√(a² − x²) = a cos(θ)',
        algebra: '√(a² − a² sen²θ) = a √(1 − sen²θ) = a cos(θ)',
        restriction: 'θ ∈ [0, π/2],  x ∈ [0, a]',
        labels: { hyp: 'a', opp: 'x', adj: '√(a²−x²)' },
      };
    }
    if (caseId === 'atan') {
      const x = a * t;
      const hyp = a / c;
      return {
        hyp,
        opp: x,
        adj: a,
        x,
        dx: 'a sec²(θ) dθ',
        subst: 'x = a tan(θ)',
        radical: '√(a² + x²) = a sec(θ)',
        algebra: '√(a² + a² tan²θ) = a √(1 + tan²θ) = a sec(θ)',
        restriction: 'θ ∈ [0, π/2),  x ≥ 0',
        labels: { hyp: '√(a²+x²)', opp: 'x', adj: 'a' },
      };
    }
    const sec = 1 / c;
    const x = a * sec;
    const opp = a * t;
    return {
      hyp: x,
      opp,
      adj: a,
      x,
      dx: 'a sec(θ) tan(θ) dθ',
      subst: 'x = a sec(θ)',
      radical: '√(x² − a²) = a tan(θ)',
      algebra: '√(a² sec²θ − a²) = a √(sec²θ − 1) = a tan(θ)',
      restriction: 'θ ∈ [0, π/2),  x ≥ a > 0',
      labels: { hyp: 'x', opp: '√(x²−a²)', adj: 'a' },
    };
  }, [a, caseId, th]);

  const origin = { x: 70, y: 250 };
  const scale = 160 / Math.max(model.hyp, model.adj, 1);
  const right = origin.x + model.adj * scale;
  const top = origin.y - model.opp * scale;
  const apex = { x: right, y: origin.y };
  const peak = { x: right, y: top };
  const left = origin;

  const arcR = 28;
  const thetaDeg = (th * 180) / Math.PI;

  return (
    <VizPanel>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium leading-relaxed text-[var(--fg)]">{t('trig.idea')}</p>
          <p className="mt-1 text-sm text-[var(--fg-muted)]">{t('trig.note')}</p>
        </div>

        <ButtonRow>
          {CASES.map((c) => (
            <VizButton key={c.id} active={caseId === c.id} onClick={() => setCaseId(c.id)}>
              {c.label}
            </VizButton>
          ))}
        </ButtonRow>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-xl" role="img" aria-labelledby={statusId}>
            {caseId === 'asin' ? (
              <path
                d={`M${left.x},${origin.y} A${a * scale},${a * scale},0,0,0,${left.x + a * scale * Math.cos(0)},${origin.y - a * scale}`}
                fill="none"
                stroke="var(--accent-strong)"
                opacity={0.25}
                strokeWidth={1.5}
              />
            ) : null}
            <polygon
              points={`${left.x},${left.y} ${apex.x},${apex.y} ${peak.x},${peak.y}`}
              fill="var(--accent-strong)"
              fillOpacity={0.08}
              stroke="var(--accent-strong)"
              strokeWidth={2}
            />
            <rect x={apex.x - 12} y={apex.y - 12} width={12} height={12} fill="none" stroke="currentColor" opacity={0.55} />
            {showAngle ? (
              <path
                d={`M${left.x + arcR},${origin.y} A${arcR},${arcR},0,0,0,${left.x + arcR * Math.cos(th)},${origin.y - arcR * Math.sin(th)}`}
                fill="none"
                stroke="orange"
                strokeWidth={2}
              />
            ) : null}
            <text x={(left.x + apex.x) / 2} y={origin.y + 18} textAnchor="middle" fontSize={12} fill="currentColor">
              {model.labels.adj}
            </text>
            <text x={apex.x + 10} y={(origin.y + peak.y) / 2} fontSize={12} fill="currentColor">
              {model.labels.opp}
            </text>
            <text
              x={(left.x + peak.x) / 2 - 8}
              y={(origin.y + peak.y) / 2 - 8}
              fontSize={12}
              fill="currentColor"
            >
              {model.labels.hyp}
            </text>
            {showAngle ? (
              <text x={left.x + 34} y={origin.y - 10} fontSize={11} fill="orange">
                θ
              </text>
            ) : null}
          </svg>
        </div>

        <div
          id={statusId}
          className="rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] px-3 py-2 font-mono text-xs"
          aria-live="polite"
        >
          <p>{t('trig.subst')}: {model.subst}</p>
          <p>dx = {model.dx}</p>
          <p>√radical = {model.radical}</p>
          <p className="text-[var(--fg-muted)]">{t('trig.restriction')}: {model.restriction}</p>
          <p className="mt-1">
            a = {fmt(a, 2)} · θ = {fmt(th, 2)} rad ({fmt(thetaDeg, 1)}°) · x = {fmt(model.x)}
          </p>
        </div>

        {showAlgebra ? (
          <p className="rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-xs text-[var(--fg-muted)]">
            {model.algebra}
          </p>
        ) : null}

        <ControlsStack>
          <SliderRow label={`a = ${fmt(a, 1)}`} value={a} min={0.5} max={4} step={0.5} onChange={setA} />
          <SliderRow
            label={`θ = ${fmt(th, 2)}`}
            value={th}
            min={0.02}
            max={thetaMax}
            step={0.02}
            onChange={setTheta}
          />
          <ToggleRow label={t('trig.showAngle')} checked={showAngle} onChange={setShowAngle} />
          <ToggleRow label={t('trig.showAlgebra')} checked={showAlgebra} onChange={setShowAlgebra} />
        </ControlsStack>
      </div>
    </VizPanel>
  );
}
