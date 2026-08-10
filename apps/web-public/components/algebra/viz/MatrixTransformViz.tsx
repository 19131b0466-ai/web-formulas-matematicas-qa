'use client';

import { useMemo, useState } from 'react';
import { useVizLabels } from '@/lib/viz-labels';
import type { MatrixTransformMode } from '@/lib/viz-modes';
import { ButtonRow, ControlsStack, SliderRow, VizButton, VizPanel, fmt, joinCaption } from './controls';
import {
  applyMat,
  det2,
  dot,
  eigen2,
  inv2,
  linspace,
  matMul,
  normalize,
  norm,
  scale,
  sub,
  transpose2,
  type Mat2,
  type Vec2,
} from './math2d';

type Props = { formulaId: string; idea?: string; mode?: string };

function SmallMatrixDisplay({ m, label }: { m: Mat2; label: string }) {
  return (
    <div className="text-center">
      <p className="mb-1 text-xs text-[var(--fg-muted)]">{label}</p>
      <div className="inline-grid grid-cols-2 gap-1 rounded border border-[var(--border)] p-1 font-mono text-sm">
        {m.flat().map((v, i) => (
          <span key={i} className="px-2 py-0.5 text-center">
            {fmt(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Thin QR via Gram–Schmidt on columns of A. */
function qr2(A: Mat2): { Q: Mat2; R: Mat2 } | null {
  const a1: Vec2 = { x: A[0][0], y: A[1][0] };
  const a2: Vec2 = { x: A[0][1], y: A[1][1] };
  if (norm(a1) < 1e-9) return null;
  const q1 = normalize(a1);
  const r12 = dot(q1, a2);
  const v2 = sub(a2, scale(q1, r12));
  if (norm(v2) < 1e-9) return null;
  const q2 = normalize(v2);
  const Q: Mat2 = [
    [q1.x, q2.x],
    [q1.y, q2.y],
  ];
  const R: Mat2 = [
    [dot(q1, a1), r12],
    [0, dot(q2, a2)],
  ];
  return { Q, R };
}

/** Build U, Σ, V from A via eigendecomposition of AᵀA (2×2). */
function svdFactors(A: Mat2): { U: Mat2; S: Mat2; Vt: Mat2; sigma: [number, number] } | null {
  const AtA = matMul(transpose2(A), A);
  const eig = eigen2(AtA);
  if (!eig) return null;
  const [l1, l2] = eig.values;
  const s1 = Math.sqrt(Math.max(0, l1));
  const s2 = Math.sqrt(Math.max(0, l2));
  const v1 = eig.vectors[0]!;
  const v2 = eig.vectors[1]!;
  const V: Mat2 = [
    [v1.x, v2.x],
    [v1.y, v2.y],
  ];
  const Vt = transpose2(V);
  const Av1 = applyMat(A, v1);
  const Av2 = applyMat(A, v2);
  const u1 = s1 > 1e-9 ? scale(Av1, 1 / s1) : { x: 1, y: 0 };
  const u2 = s2 > 1e-9 ? scale(Av2, 1 / s2) : { x: 0, y: 1 };
  const U: Mat2 = [
    [u1.x, u2.x],
    [u1.y, u2.y],
  ];
  const S: Mat2 = [
    [s1, 0],
    [0, s2],
  ];
  return { U, S, Vt, sigma: [s1, s2] };
}

export function MatrixTransformViz({ mode: modeProp }: Props) {
  const v = useVizLabels();
  const mode = (modeProp ?? 'map') as MatrixTransformMode;
  const [a11, setA11] = useState(1.2);
  const [a12, setA12] = useState(0.4);
  const [a21, setA21] = useState(0.3);
  const [a22, setA22] = useState(0.9);
  const [k, setK] = useState(1);
  const [showEigen, setShowEigen] = useState(mode === 'eigen' || mode === 'map');
  const [svdStep, setSvdStep] = useState(0);
  const [qrStep, setQrStep] = useState(0);

  const A = useMemo<Mat2>(
    () => [
      [a11, a12],
      [a21, a22],
    ],
    [a11, a12, a21, a22],
  );
  const det = det2(A);
  const eig = useMemo(() => eigen2(A), [A]);
  const Ainv = inv2(A);
  const AinvProduct: Mat2 | null = Ainv ? matMul(A, Ainv) : null;
  const qr = useMemo(() => qr2(A), [A]);
  const svd = useMemo(() => svdFactors(A), [A]);
  const sigma = useMemo<[number, number]>(() => svd?.sigma ?? [1, 1], [svd]);

  const W = 420;
  const H = 320;
  const ox = W / 2;
  const oy = H / 2;
  const S = 36;
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });

  // SVD stages: 0 unit, 1 Vᵀ, 2 ΣVᵀ, 3 UΣVᵀ = A
  const displayMat: Mat2 = useMemo(() => {
    if (mode === 'svd' && svd) {
      if (svdStep === 0)
        return [
          [1, 0],
          [0, 1],
        ];
      if (svdStep === 1) return svd.Vt;
      if (svdStep === 2) return matMul(svd.S, svd.Vt);
      return matMul(svd.U, matMul(svd.S, svd.Vt));
    }
    if (mode === 'low_rank' && svd) {
      const Sk: Mat2 = [
        [sigma[0]!, 0],
        [0, k >= 2 ? sigma[1]! : 0],
      ];
      return matMul(svd.U, matMul(Sk, svd.Vt));
    }
    if (mode === 'qr' && qr) {
      if (qrStep <= 1) return A;
      return qr.Q;
    }
    return A;
  }, [mode, A, svd, svdStep, k, sigma, qr, qrStep]);

  const grid = useMemo(() => {
    const lines: Array<[Vec2, Vec2]> = [];
    const M = displayMat;
    for (const t of linspace(-2.5, 2.5, 11)) {
      lines.push([applyMat(M, { x: t, y: -2.5 }), applyMat(M, { x: t, y: 2.5 })]);
      lines.push([applyMat(M, { x: -2.5, y: t }), applyMat(M, { x: 2.5, y: t })]);
    }
    return lines;
  }, [displayMat]);

  const col1: Vec2 = { x: A[0][0], y: A[1][0] };
  const col2: Vec2 = { x: A[0][1], y: A[1][1] };
  const q1 = qr ? { x: qr.Q[0][0], y: qr.Q[1][0] } : null;
  const q2 = qr ? { x: qr.Q[0][1], y: qr.Q[1][1] } : null;

  const e1 = applyMat(displayMat, { x: 1, y: 0 });
  const e2 = applyMat(displayMat, { x: 0, y: 1 });

  const svdLabel =
    mode === 'svd'
      ? svdStep === 0
        ? v.svdUnit
        : svdStep === 1
          ? v.svdRotate
          : svdStep === 2
            ? v.svdScale
            : v.svdCompose
      : '';

  const caption = joinCaption(
    `det=${fmt(det)}`,
    mode === 'svd' || mode === 'low_rank' ? `σ≈(${fmt(sigma[0]!)}, ${fmt(sigma[1]!)})` : undefined,
    mode === 'low_rank' ? (k <= 1 ? v.rank1Demo : v.rankFull) : undefined,
    svdLabel,
    mode === 'qr' && qr ? `QR · paso ${qrStep + 1}/3` : undefined,
  );

  return (
    <VizPanel caption={caption}>
      {mode === 'inverse' && Ainv ? (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <SmallMatrixDisplay m={A} label="A" />
          <span className="font-mono text-lg">·</span>
          <SmallMatrixDisplay m={Ainv} label="A⁻¹" />
          <span className="font-mono text-lg">=</span>
          {AinvProduct ? <SmallMatrixDisplay m={AinvProduct} label="≈ I" /> : null}
        </div>
      ) : null}
      {mode === 'inverse' && !Ainv ? (
        <p className="mb-3 text-sm text-[var(--fg-muted)]">{v.singularNoInv}</p>
      ) : null}

      {mode === 'qr' && qr ? (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <SmallMatrixDisplay m={A} label="A" />
          {qrStep >= 2 ? (
            <>
              <span className="font-mono text-lg">≈</span>
              <SmallMatrixDisplay m={qr.Q} label="Q" />
              <span className="font-mono text-lg">·</span>
              <SmallMatrixDisplay m={qr.R} label="R" />
            </>
          ) : null}
        </div>
      ) : null}

      {mode === 'svd' && svd ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
          <span>A = U Σ Vᵀ</span>
          {svdStep >= 3 ? (
            <>
              <SmallMatrixDisplay m={svd.U} label="U" />
              <SmallMatrixDisplay m={svd.S} label="Σ" />
              <SmallMatrixDisplay m={svd.Vt} label="Vᵀ" />
            </>
          ) : null}
        </div>
      ) : null}

      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img">
        <line x1={20} y1={oy} x2={W - 20} y2={oy} stroke="currentColor" opacity={0.2} />
        <line x1={ox} y1={20} x2={ox} y2={H - 20} stroke="currentColor" opacity={0.2} />
        {mode === 'svd' && svdStep === 0 ? (
          <circle cx={ox} cy={oy} r={S} fill="none" stroke="orange" opacity={0.8} />
        ) : null}
        {grid.map(([p, q], i) => {
          const P = to(p);
          const Q = to(q);
          return <line key={i} x1={P.x} y1={P.y} x2={Q.x} y2={Q.y} stroke="var(--accent-soft)" strokeWidth={1} />;
        })}
        <line x1={ox} y1={oy} x2={to(e1).x} y2={to(e1).y} stroke="var(--accent-strong)" strokeWidth={2.5} />
        <line x1={ox} y1={oy} x2={to(e2).x} y2={to(e2).y} stroke="teal" strokeWidth={2.5} />

        {mode === 'qr' ? (
          <>
            <line x1={ox} y1={oy} x2={to(col1).x} y2={to(col1).y} stroke="var(--accent-strong)" strokeWidth={2} opacity={0.45} />
            <line x1={ox} y1={oy} x2={to(col2).x} y2={to(col2).y} stroke="teal" strokeWidth={2} opacity={0.45} />
            {qrStep >= 1 && q1 ? (
              <line x1={ox} y1={oy} x2={to(q1).x} y2={to(q1).y} stroke="orange" strokeWidth={2.5} />
            ) : null}
            {qrStep >= 2 && q2 ? (
              <line x1={ox} y1={oy} x2={to(q2).x} y2={to(q2).y} stroke="orange" strokeWidth={2.5} strokeDasharray="4 2" />
            ) : null}
            <text x={24} y={28} fontSize={12} fill="currentColor">
              {qrStep === 0 ? 'columnas de A' : qrStep === 1 ? 'q₁ = a₁/‖a₁‖' : 'Q = [q₁ q₂], R = QᵀA'}
            </text>
          </>
        ) : null}

        {showEigen && eig && mode !== 'qr'
          ? eig.vectors.map((vec, i) => {
              const p = to({ x: vec.x * eig.values[i]!, y: vec.y * eig.values[i]! });
              return (
                <line key={i} x1={ox} y1={oy} x2={p.x} y2={p.y} stroke="orange" strokeWidth={2} strokeDasharray="4 2" />
              );
            })
          : null}

        {(mode === 'svd' && svdStep >= 2) || mode === 'low_rank' ? (
          <ellipse
            cx={ox}
            cy={oy}
            rx={Math.max(4, Math.abs(sigma[0]!) * S * (mode === 'low_rank' && k < 2 ? 1 : 1))}
            ry={Math.max(4, Math.abs(mode === 'low_rank' && k < 2 ? 0.05 : sigma[1]!) * S)}
            fill="none"
            stroke="orange"
            opacity={0.85}
            transform={
              mode === 'svd' && svdStep >= 3 && svd
                ? `rotate(${(-Math.atan2(svd.U[1][0]!, svd.U[0][0]!) * 180) / Math.PI} ${ox} ${oy})`
                : undefined
            }
          />
        ) : null}

        {mode === 'low_rank' ? (
          <>
            <text x={ox + Math.abs(sigma[0]!) * S + 4} y={oy - 4} fontSize={11} fill="orange">
              σ₁
            </text>
            {k >= 2 ? (
              <text x={ox + 4} y={oy - Math.abs(sigma[1]!) * S - 4} fontSize={11} fill="teal">
                σ₂
              </text>
            ) : null}
          </>
        ) : null}
      </svg>
      <ControlsStack>
        <SliderRow label="a₁₁" value={a11} min={-2} max={2.5} step={0.05} onChange={setA11} />
        <SliderRow label="a₁₂" value={a12} min={-2} max={2.5} step={0.05} onChange={setA12} />
        <SliderRow label="a₂₁" value={a21} min={-2} max={2.5} step={0.05} onChange={setA21} />
        <SliderRow label="a₂₂" value={a22} min={-2} max={2.5} step={0.05} onChange={setA22} />
        {mode === 'low_rank' ? (
          <SliderRow label="k" value={k} min={1} max={2} step={1} onChange={setK} />
        ) : null}
        <ButtonRow>
          {mode !== 'qr' && mode !== 'svd' ? (
            <VizButton active={showEigen} onClick={() => setShowEigen((s) => !s)}>
              {v.eigenvectors}
            </VizButton>
          ) : null}
          {mode === 'svd' ? (
            <VizButton onClick={() => setSvdStep((s) => (s + 1) % 4)}>
              {v.svdStep} {(svdStep % 4) + 1}/4
            </VizButton>
          ) : null}
          {mode === 'qr' ? (
            <VizButton onClick={() => setQrStep((s) => (s + 1) % 3)}>
              {v.qrStep} {(qrStep % 3) + 1}/3
            </VizButton>
          ) : null}
        </ButtonRow>
      </ControlsStack>
    </VizPanel>
  );
}
