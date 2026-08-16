'use client';

import { useId, useMemo, useState } from 'react';
import { ButtonRow, ControlsStack, ToggleRow, VizButton, VizPanel, joinCaption } from './controls';
import { presentLin } from './linAlg';
import { add, applyMat, inv2, matMul, scale, type Mat2, type Vec2 } from './math2d';
import { present } from './matrixGrid';
import {
  Badge,
  Chip,
  ChipRow,
  CollapsibleEdit,
  DET_EPS,
  GuideBlock,
  I2,
  Segmented,
  basisGridLines,
  det2,
  gridLines,
  matFromCols,
  nearZero,
} from './transformHelpers';
import {
  ArrowMarker,
  Axes,
  COLOR_U,
  COLOR_V,
  COLOR_W,
  VEC_H,
  VEC_W,
  clampVec,
  labelOffset,
  useVecDrag,
} from './vectorPlane';

const W = VEC_W;
const H = VEC_H;
const ox = W / 2;
const oy = H / 2;
const S = 36;
const CLAMP = 3.6;

type Tab = 'geo' | 'alg';
type Mode = 'moveX' | 'editB';
type BaseView = 'E' | 'B' | 'both';
type Direction = 'EtoB' | 'BtoE';

type PresetId = 'std' | 'rot' | 'obl' | 'scale' | 'bad' | null;

function matFromBasis(b1: Vec2, b2: Vec2): Mat2 {
  return matFromCols(b1, b2);
}

function fmtCoord(v: Vec2): string {
  return `(${presentLin(v.x)}, ${presentLin(v.y)})`;
}

function GridLayer({
  lines,
  stroke,
  opacity,
  dashed,
}: {
  lines: Array<[Vec2, Vec2]>;
  stroke: string;
  opacity: number;
  dashed?: boolean;
}) {
  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  return (
    <g opacity={opacity}>
      {lines.map(([a, b], i) => {
        const A = to(a);
        const B = to(b);
        return (
          <line
            key={i}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={stroke}
            strokeWidth={1}
            strokeDasharray={dashed ? '4 3' : undefined}
          />
        );
      })}
    </g>
  );
}

/**
 * Cambio de base: el vector geométrico x queda fijo; solo cambian las coordenadas.
 */
export function ChangeOfBasisViz() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [x, setX] = useState<Vec2>({ x: 3, y: 1 });
  const [b1, setB1] = useState<Vec2>({ x: 1, y: 1 });
  const [b2, setB2] = useState<Vec2>({ x: 1, y: -1 });
  const [c1, setC1] = useState<Vec2>({ x: 1, y: 0 });
  const [c2, setC2] = useState<Vec2>({ x: 0, y: 1 });
  const [tab, setTab] = useState<Tab>('geo');
  const [mode, setMode] = useState<Mode>('moveX');
  const [baseView, setBaseView] = useState<BaseView>('both');
  const [direction, setDirection] = useState<Direction>('EtoB');
  const [highlight, setHighlight] = useState<'E' | 'B'>('E');
  const [flashFixed, setFlashFixed] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [preset, setPreset] = useState<PresetId>(null);

  const B = useMemo(() => matFromBasis(b1, b2), [b1, b2]);
  const C = useMemo(() => matFromBasis(c1, c2), [c1, c2]);
  const detB = det2(B);
  const validB = Math.abs(detB) > DET_EPS;
  const Binv = useMemo(() => (validB ? inv2(B) : null), [B, validB]);
  const detC = det2(C);
  const validC = Math.abs(detC) > DET_EPS;
  const Cinv = useMemo(() => (validC ? inv2(C) : null), [C, validC]);

  const xE = x;
  const xB = Binv ? applyMat(Binv, x) : null;
  const xC = Cinv ? applyMat(Cinv, x) : null;
  const P_C_from_B = Cinv && validB ? matMul(Cinv, B) : null;

  const tipTail = xB
    ? { mid: scale(b1, xB.x), tip: add(scale(b1, xB.x), scale(b2, xB.y)) }
    : null;

  const to = (p: Vec2) => ({ x: ox + p.x * S, y: oy - p.y * S });
  const px = to(x);
  const pb1 = to(b1);
  const pb2 = to(b2);
  const pe1 = to({ x: 1, y: 0 });
  const pe2 = to({ x: 0, y: 1 });

  const dragX = useVecDrag((p) => setX(clampVec(p, CLAMP)), S, { x: ox, y: oy });
  const dragB1 = useVecDrag((p) => {
    setB1(clampVec(p, CLAMP));
    setPreset(null);
  }, S, { x: ox, y: oy });
  const dragB2 = useVecDrag((p) => {
    setB2(clampVec(p, CLAMP));
    setPreset(null);
  }, S, { x: ox, y: oy });

  const applyPreset = (id: PresetId) => {
    setPreset(id);
    if (id === 'std') {
      setB1({ x: 1, y: 0 });
      setB2({ x: 0, y: 1 });
      // keep x fixed
    } else if (id === 'rot') {
      setB1({ x: 1, y: 1 });
      setB2({ x: -1, y: 1 });
    } else if (id === 'obl') {
      setB1({ x: 1, y: 0 });
      setB2({ x: 1, y: 1 });
      setX({ x: 3, y: 1 });
    } else if (id === 'scale') {
      setB1({ x: 2, y: 0 });
      setB2({ x: 0, y: 0.5 });
      setX({ x: 4, y: 1 }); // [x]_B = (2, 2)
    } else if (id === 'bad') {
      setB1({ x: 1, y: 1 });
      setB2({ x: 2, y: 2 });
    }
  };

  const switchToB = () => {
    setHighlight('B');
    setBaseView('B');
    setFlashFixed(true);
    window.setTimeout(() => setFlashFixed(false), 1800);
  };

  const switchToE = () => {
    setHighlight('E');
    setBaseView('E');
    setFlashFixed(true);
    window.setTimeout(() => setFlashFixed(false), 1800);
  };

  const showEGrid = baseView === 'E' || baseView === 'both';
  const showBGrid = (baseView === 'B' || baseView === 'both') && (validB || !nearZero(b1) || !nearZero(b2));

  const caption = joinCaption(
    validB
      ? `[x]_E = ${fmtCoord(xE)} · [x]_B = ${fmtCoord(xB!)}`
      : `[x]_E = ${fmtCoord(xE)} · base B inválida ✕`,
    'El vector geométrico no cambia',
  );

  return (
    <VizPanel title="Cambio de base" caption={caption}>
      <div className="space-y-3">
        <GuideBlock
          idea="Es el mismo vector x con distintas coordenadas: [x]_E vs [x]_B. [x]_E = B [x]_B y [x]_B = B⁻¹ [x]_E."
          tryIt="Cambia de base con el botón: la geometría de x no se mueve; solo cambia el sistema de coordenadas."
          concept="Cambiar de base cambia la descripción del vector, no el vector geométrico."
        />

        <p className="rounded-md border border-[var(--border)] bg-[color-mix(in_oklab,var(--accent-soft)_25%,transparent)] px-2.5 py-1.5 text-xs text-[var(--fg-muted)]">
          Cambiar de base cambia la descripción del vector, no el vector geométrico.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { id: 'geo', label: 'Geométrica' },
              { id: 'alg', label: 'Algebraica' },
            ]}
            value={tab}
            onChange={(id) => setTab(id as Tab)}
          />
          <Segmented
            options={[
              { id: 'E', label: 'E' },
              { id: 'B', label: 'B' },
              { id: 'both', label: 'Ambas' },
            ]}
            value={baseView}
            onChange={(id) => setBaseView(id as BaseView)}
          />
          <Segmented
            options={[
              { id: 'moveX', label: 'Mover x' },
              { id: 'editB', label: 'Editar base B' },
            ]}
            value={mode}
            onChange={(id) => setMode(id as Mode)}
          />
        </div>

        <ChipRow>
          <Chip active={preset === 'std'} onClick={() => applyPreset('std')}>
            Estándar
          </Chip>
          <Chip active={preset === 'rot'} onClick={() => applyPreset('rot')}>
            Rotada
          </Chip>
          <Chip active={preset === 'obl'} onClick={() => applyPreset('obl')}>
            Oblicua
          </Chip>
          <Chip active={preset === 'scale'} onClick={() => applyPreset('scale')}>
            Escalada
          </Chip>
          <Chip active={preset === 'bad'} onClick={() => applyPreset('bad')}>
            Inválida
          </Chip>
        </ChipRow>

        <div className="flex flex-wrap items-center gap-2">
          <ButtonRow>
            {highlight === 'E' ? (
              <VizButton onClick={switchToB}>Cambiar a base B</VizButton>
            ) : (
              <VizButton onClick={switchToE}>Volver a base E</VizButton>
            )}
          </ButtonRow>
          <Badge tone={validB ? 'ok' : 'bad'}>
            {validB ? 'B invertible' : 'B inválida ✕'}
          </Badge>
          {flashFixed ? (
            <span className="text-xs font-semibold" style={{ color: 'orange' }}>
              El vector x no cambió
            </span>
          ) : null}
        </div>

        <div className="rounded-lg border border-[var(--border)] px-3 py-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
            Mismo vector
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className={highlight === 'E' ? 'font-bold' : ''} style={highlight === 'E' ? { color: 'orange' } : undefined}>
                [x]_E = {fmtCoord(xE)}
              </span>
              <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                x = {presentLin(xE.x)} e₁ + {presentLin(xE.y)} e₂
              </p>
            </div>
            <div>
              {validB && xB ? (
                <>
                  <span className={highlight === 'B' ? 'font-bold' : ''} style={highlight === 'B' ? { color: 'orange' } : undefined}>
                    [x]_B = {fmtCoord(xB)}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--fg-muted)]">
                    x = {presentLin(xB.x)} b₁ + {presentLin(xB.y)} b₂
                  </p>
                </>
              ) : (
                <span className="font-medium text-rose-700 dark:text-rose-300">
                  [x]_B no definido (sin B⁻¹) ✕
                </span>
              )}
            </div>
          </div>
        </div>

        {tab === 'geo' ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full touch-none rounded-xl border border-[var(--border)]"
            role="img"
            aria-label="Cambio de base: mismo vector x"
            onPointerMove={(e) => {
              dragX.onPointerMove(e);
              dragB1.onPointerMove(e);
              dragB2.onPointerMove(e);
            }}
            onPointerUp={() => {
              dragX.onPointerUp();
              dragB1.onPointerUp();
              dragB2.onPointerUp();
            }}
          >
            <defs>
              <ArrowMarker id={`${uid}-u`} color={COLOR_U} />
              <ArrowMarker id={`${uid}-v`} color={COLOR_V} />
              <ArrowMarker id={`${uid}-w`} color={COLOR_W} />
              <ArrowMarker id={`${uid}-e`} color="var(--fg-muted)" />
            </defs>
            <Axes W={W} H={H} ox={ox} oy={oy} S={S} xLabel="e₁" yLabel="e₂" />

            {showEGrid ? (
              <GridLayer
                lines={gridLines(I2, 3, 9)}
                stroke="var(--fg-muted)"
                opacity={baseView === 'both' ? 0.2 : 0.28}
                dashed
              />
            ) : null}

            {showBGrid ? (
              validB ? (
                <GridLayer
                  lines={basisGridLines(b1, b2, 3)}
                  stroke={COLOR_W}
                  opacity={baseView === 'both' ? 0.4 : 0.55}
                />
              ) : (
                // Collapse to line when dependent
                (() => {
                  const dir = !nearZero(b1) ? b1 : b2;
                  const n = Math.hypot(dir.x, dir.y) || 1;
                  const u = { x: (dir.x / n) * 4, y: (dir.y / n) * 4 };
                  const a = to({ x: -u.x, y: -u.y });
                  const b = to(u);
                  return (
                    <line
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={COLOR_W}
                      strokeWidth={6}
                      opacity={0.2}
                      strokeLinecap="round"
                    />
                  );
                })()
              )
            ) : null}

            {/* e1, e2 faint when highlighting E or both */}
            {(baseView === 'E' || baseView === 'both') && (
              <>
                <line x1={ox} y1={oy} x2={pe1.x} y2={pe1.y} stroke="var(--fg-muted)" strokeWidth={1.5} strokeDasharray="3 3" markerEnd={`url(#${uid}-e)`} opacity={0.5} />
                <line x1={ox} y1={oy} x2={pe2.x} y2={pe2.y} stroke="var(--fg-muted)" strokeWidth={1.5} strokeDasharray="3 3" markerEnd={`url(#${uid}-e)`} opacity={0.5} />
              </>
            )}

            {/* b1, b2 */}
            {!nearZero(b1) ? (
              <line
                x1={ox}
                y1={oy}
                x2={pb1.x}
                y2={pb1.y}
                stroke={COLOR_U}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-u)`}
              />
            ) : null}
            {!nearZero(b2) ? (
              <line
                x1={ox}
                y1={oy}
                x2={pb2.x}
                y2={pb2.y}
                stroke={COLOR_V}
                strokeWidth={2.4}
                markerEnd={`url(#${uid}-v)`}
              />
            ) : null}
            <text x={labelOffset(b1, pb1, ox, oy, 14).x} y={labelOffset(b1, pb1, ox, oy, 14).y} fontSize={12} fontWeight={700} fill={COLOR_U} textAnchor="middle">
              b₁
            </text>
            <text x={labelOffset(b2, pb2, ox, oy, 14).x} y={labelOffset(b2, pb2, ox, oy, 14).y} fontSize={12} fontWeight={700} fill={COLOR_V} textAnchor="middle">
              b₂
            </text>

            {/* Tip-to-tail decomposition in B */}
            {highlight === 'B' && tipTail && validB && xB ? (
              <>
                <line
                  x1={ox}
                  y1={oy}
                  x2={to(tipTail.mid).x}
                  y2={to(tipTail.mid).y}
                  stroke={COLOR_U}
                  strokeWidth={2}
                  opacity={0.85}
                />
                <line
                  x1={to(tipTail.mid).x}
                  y1={to(tipTail.mid).y}
                  x2={to(tipTail.tip).x}
                  y2={to(tipTail.tip).y}
                  stroke={COLOR_V}
                  strokeWidth={2}
                  opacity={0.85}
                />
                <text
                  x={(ox + to(tipTail.mid).x) / 2}
                  y={(oy + to(tipTail.mid).y) / 2 - 8}
                  fontSize={10}
                  fill={COLOR_U}
                >
                  α b₁
                </text>
                <text
                  x={(to(tipTail.mid).x + to(tipTail.tip).x) / 2 + 6}
                  y={(to(tipTail.mid).y + to(tipTail.tip).y) / 2}
                  fontSize={10}
                  fill={COLOR_V}
                >
                  β b₂
                </text>
              </>
            ) : null}

            {/* Fixed geometric x */}
            {!nearZero(x) ? (
              <line
                x1={ox}
                y1={oy}
                x2={px.x}
                y2={px.y}
                stroke={COLOR_W}
                strokeWidth={3}
                markerEnd={`url(#${uid}-w)`}
              />
            ) : null}
            <circle cx={px.x} cy={px.y} r={6} fill={COLOR_W} />
            <text
              x={labelOffset(x, px, ox, oy, 16).x}
              y={labelOffset(x, px, ox, oy, 16).y}
              fontSize={13}
              fontWeight={700}
              fill={COLOR_W}
              textAnchor="middle"
            >
              x
            </text>

            {mode === 'moveX' ? (
              <circle
                cx={px.x}
                cy={px.y}
                r={12}
                fill="transparent"
                stroke={COLOR_W}
                strokeOpacity={0.4}
                style={{ cursor: 'grab' }}
                {...dragX}
              />
            ) : (
              <>
                <circle
                  cx={pb1.x}
                  cy={pb1.y}
                  r={9}
                  fill={COLOR_U}
                  fillOpacity={0.2}
                  stroke={COLOR_U}
                  style={{ cursor: 'grab' }}
                  {...dragB1}
                />
                <circle
                  cx={pb2.x}
                  cy={pb2.y}
                  r={9}
                  fill={COLOR_V}
                  fillOpacity={0.2}
                  stroke={COLOR_V}
                  style={{ cursor: 'grab' }}
                  {...dragB2}
                />
              </>
            )}
          </svg>
        ) : (
          <div className="space-y-3 rounded-xl border border-[var(--border)] px-3 py-3 font-mono text-sm">
            <p>
              B = [b₁ b₂] = [[
              {present(B[0][0])}, {present(B[0][1])}], [{present(B[1][0])}, {present(B[1][1])}]]
            </p>
            <p>
              [x]_E = {fmtCoord(xE)}
              {validB && xB ? (
                <>
                  {' · '}
                  [x]_B = {fmtCoord(xB)}
                </>
              ) : (
                <span className="text-rose-700 dark:text-rose-300"> · [x]_B ✕</span>
              )}
            </p>
            <div className="border-t border-[var(--border)] pt-2 text-xs leading-relaxed text-[var(--fg-muted)]">
              <p>[x]_E = B [x]_B</p>
              <p>[x]_B = B⁻¹ [x]_E {validB ? '' : '(no existe)'}</p>
              {validB && xB ? (
                <p className="mt-1" style={{ color: 'orange' }}>
                  Comprobación: B [x]_B = {fmtCoord(applyMat(B, xB))} ≈ [x]_E
                </p>
              ) : null}
            </div>
          </div>
        )}

        <ControlsStack>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--fg-muted)]">Dirección</span>
            <Segmented
              options={[
                { id: 'EtoB', label: 'E → B' },
                { id: 'BtoE', label: 'B → E' },
              ]}
              value={direction}
              onChange={(id) => setDirection(id as Direction)}
            />
          </div>
          <div className="rounded-md border border-[var(--border)] px-2.5 py-2 font-mono text-xs text-[var(--fg-muted)]">
            {direction === 'EtoB' ? (
              validB && Binv ? (
                <p>
                  [x]_B = B⁻¹ [x]_E · B⁻¹ ≈ [[
                  {present(Binv[0][0])}, {present(Binv[0][1])}], [{present(Binv[1][0])},{' '}
                  {present(Binv[1][1])}]]
                </p>
              ) : (
                <p className="text-rose-700 dark:text-rose-300">B⁻¹ no existe ✕</p>
              )
            ) : (
              <p>
                [x]_E = B [x]_B · B = [[
                {present(B[0][0])}, {present(B[0][1])}], [{present(B[1][0])}, {present(B[1][1])}]]
              </p>
            )}
          </div>

          <ToggleRow
            label="Avanzado: segunda base C (B → C)"
            checked={advanced}
            onChange={setAdvanced}
          />
          {advanced ? (
            <div className="space-y-2 rounded-md border border-[var(--border)] px-2.5 py-2 text-xs">
              <p className="text-[var(--fg-muted)]">
                C = [c₁ c₂] · P<sub>C←B</sub> = C⁻¹ B
              </p>
              <div className="flex flex-wrap gap-3 font-mono">
                <label className="flex items-center gap-1">
                  c₁x
                  <input
                    type="number"
                    step={0.1}
                    value={c1.x}
                    onChange={(e) => setC1({ ...c1, x: Number(e.target.value) })}
                    className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
                  />
                </label>
                <label className="flex items-center gap-1">
                  c₁y
                  <input
                    type="number"
                    step={0.1}
                    value={c1.y}
                    onChange={(e) => setC1({ ...c1, y: Number(e.target.value) })}
                    className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
                  />
                </label>
                <label className="flex items-center gap-1">
                  c₂x
                  <input
                    type="number"
                    step={0.1}
                    value={c2.x}
                    onChange={(e) => setC2({ ...c2, x: Number(e.target.value) })}
                    className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
                  />
                </label>
                <label className="flex items-center gap-1">
                  c₂y
                  <input
                    type="number"
                    step={0.1}
                    value={c2.y}
                    onChange={(e) => setC2({ ...c2, y: Number(e.target.value) })}
                    className="w-16 rounded border border-[var(--border)] bg-[var(--bg)] px-1 py-0.5"
                  />
                </label>
              </div>
              {P_C_from_B && xC ? (
                <p className="font-mono text-[var(--fg)]">
                  [x]_C = {fmtCoord(xC)} · P<sub>C←B</sub> = [[
                  {present(P_C_from_B[0][0])}, {present(P_C_from_B[0][1])}], [
                  {present(P_C_from_B[1][0])}, {present(P_C_from_B[1][1])}]]
                </p>
              ) : (
                <p className="text-rose-700 dark:text-rose-300">
                  C o B no invertible — no hay P<sub>C←B</sub>
                </p>
              )}
            </div>
          ) : null}
        </ControlsStack>

        <CollapsibleEdit
          label="Editar valores numéricos"
          open={editOpen}
          onToggle={() => setEditOpen((o) => !o)}
        >
          <div className="grid gap-2 sm:grid-cols-3 font-mono text-xs">
            <label className="flex flex-col gap-1">
              x₁ (E)
              <input
                type="number"
                step={0.1}
                value={x.x}
                onChange={(e) => setX({ ...x, x: Number(e.target.value) })}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              x₂ (E)
              <input
                type="number"
                step={0.1}
                value={x.y}
                onChange={(e) => setX({ ...x, y: Number(e.target.value) })}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
            <div />
            <label className="flex flex-col gap-1">
              b₁₁
              <input
                type="number"
                step={0.1}
                value={b1.x}
                onChange={(e) => {
                  setB1({ ...b1, x: Number(e.target.value) });
                  setPreset(null);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              b₂₁
              <input
                type="number"
                step={0.1}
                value={b1.y}
                onChange={(e) => {
                  setB1({ ...b1, y: Number(e.target.value) });
                  setPreset(null);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
            <div />
            <label className="flex flex-col gap-1">
              b₁₂
              <input
                type="number"
                step={0.1}
                value={b2.x}
                onChange={(e) => {
                  setB2({ ...b2, x: Number(e.target.value) });
                  setPreset(null);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
            <label className="flex flex-col gap-1">
              b₂₂
              <input
                type="number"
                step={0.1}
                value={b2.y}
                onChange={(e) => {
                  setB2({ ...b2, y: Number(e.target.value) });
                  setPreset(null);
                }}
                className="rounded border border-[var(--border)] bg-[var(--bg)] px-2 py-1"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-[var(--fg-muted)]">
            La geometría no cambia; cambia el sistema de coordenadas.
          </p>
        </CollapsibleEdit>
      </div>
    </VizPanel>
  );
}
