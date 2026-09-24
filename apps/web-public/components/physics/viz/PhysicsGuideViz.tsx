'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { Link } from '@/i18n/navigation';
import { formulaHref, sectionHref } from '@/lib/subjects';
import { PhysGuide, PhysStatus } from './physChrome';

type FormulaPick = { id: string; when: string };
type GuideLeaf = {
  id: string;
  section: string;
  slug: string;
  keywords: string;
  formulas: FormulaPick[];
};
type GuideBranch = { id: string; leaves: GuideLeaf[] };

const TREE: GuideBranch[] = [
  {
    id: 'motion',
    leaves: [
      {
        id: 'cin',
        section: 'Cinemática 1D',
        slug: 'cinematica-1d',
        keywords: 'MRU, MRUA, caída libre, velocidad, aceleración',
        formulas: [
          { id: 'CIN-004', when: 'velocidad constante o posición lineal en el tiempo' },
          { id: 'CIN-006', when: 'aceleración constante y ecuaciones x(t), v(t)' },
          { id: 'CIN-012', when: 'caída libre o lanzamiento vertical 1D' },
        ],
      },
      {
        id: 'mov',
        section: 'Movimiento 2D y 3D',
        slug: 'movimiento-2d-3d',
        keywords: 'proyectil, alcance, altura máxima, velocidad relativa',
        formulas: [
          { id: 'MOV-014', when: 'lanzamiento en dos dimensiones sin resistencia' },
          { id: 'MOV-015', when: 'velocidad de un cuerpo respecto de otro marco' },
        ],
      },
      {
        id: 'cir',
        section: 'Movimiento circular',
        slug: 'movimiento-circular',
        keywords: 'curva, periodo, ω, aceleración centrípeta',
        formulas: [
          { id: 'CIR-006', when: 'relación v = ωr en trayectoria circular' },
          { id: 'CIR-008', when: 'fuerza o aceleración hacia el centro de la curva' },
        ],
      },
    ],
  },
  {
    id: 'forces',
    leaves: [
      {
        id: 'new',
        section: 'Leyes de Newton',
        slug: 'leyes-de-newton',
        keywords: 'fuerza, rozamiento, plano inclinado, tensión, peso',
        formulas: [
          { id: 'NEW-001', when: 'ΣF = ma con fuerzas conocidas' },
          { id: 'NEW-005', when: 'fricción estática o cinética' },
          { id: 'NEW-006', when: 'componentes en plano inclinado' },
        ],
      },
      {
        id: 'equ',
        section: 'Equilibrio y elasticidad',
        slug: 'equilibrio-elasticidad',
        keywords: 'equilibrio estático, viga, resorte, Hooke',
        formulas: [
          { id: 'EQU-002', when: 'Στ = 0 en cuerpo rígido en reposo' },
          { id: 'EQU-005', when: 'deformación elástica F = kx' },
        ],
      },
    ],
  },
  {
    id: 'conservation',
    leaves: [
      {
        id: 'ene',
        section: 'Trabajo, energía y potencia',
        slug: 'trabajo-energia-potencia',
        keywords: 'trabajo, energía cinética, potencial, conservación',
        formulas: [
          { id: 'ENE-002', when: 'trabajo de fuerza constante W = Fd cosθ' },
          { id: 'ENE-010', when: 'energía cinética K = ½mv²' },
          { id: 'ENE-011', when: 'conservación K + U si no hay disipación' },
        ],
      },
      {
        id: 'mom',
        section: 'Momento, impulso y colisiones',
        slug: 'momento-impulso-colisiones',
        keywords: 'choque, impulso, antes/después, centro de masa',
        formulas: [
          { id: 'MOM-005', when: 'impulso J = FΔt o cambio de momento' },
          { id: 'MOM-006', when: 'colisión 1D elástica o inelástica' },
          { id: 'MOM-007', when: 'centro de masa de un sistema' },
        ],
      },
    ],
  },
  {
    id: 'rotation',
    leaves: [
      {
        id: 'rot',
        section: 'Rotación',
        slug: 'rotacion',
        keywords: 'torque, inercia, rodadura, L = Iω',
        formulas: [
          { id: 'ROT-005', when: 'momento de inercia de partículas o cuerpos simples' },
          { id: 'ROT-010', when: 'torque τ = rF sinθ' },
          { id: 'ROT-013', when: 'momento angular L = Iω' },
        ],
      },
    ],
  },
  {
    id: 'fluids',
    leaves: [
      {
        id: 'flu',
        section: 'Mecánica de fluidos',
        slug: 'mecanica-de-fluidos',
        keywords: 'presión, flotación, caudal, Bernoulli',
        formulas: [
          { id: 'FLU-003', when: 'presión hidrostática P = P₀ + ρgh' },
          { id: 'FLU-007', when: 'caudal Q = Av' },
          { id: 'FLU-009', when: 'ecuación de Bernoulli en tubería' },
        ],
      },
    ],
  },
  {
    id: 'waves',
    leaves: [
      {
        id: 'ond',
        section: 'Ondas',
        slug: 'ondas',
        keywords: 'λ, f, interferencia, superposición, cuerda',
        formulas: [
          { id: 'OND-001', when: 'v = λf en onda armónica' },
          { id: 'OND-008', when: 'suma de dos ondas en un punto' },
          { id: 'OND-009', when: 'interferencia por diferencia de camino' },
        ],
      },
      {
        id: 'son',
        section: 'Sonido',
        slug: 'sonido',
        keywords: 'Doppler, batidos, tubo resonante',
        formulas: [
          { id: 'SON-004', when: 'frecuencia observada con fuente u observador en movimiento' },
          { id: 'SON-005', when: 'batidos entre dos frecuencias cercanas' },
          { id: 'SON-006', when: 'modos en tubo abierto-abierto' },
        ],
      },
    ],
  },
  {
    id: 'heat',
    leaves: [
      {
        id: 'ter',
        section: 'Termodinámica',
        slug: 'termodinamica',
        keywords: 'gas ideal, calor, trabajo, primera ley, Carnot',
        formulas: [
          { id: 'TER-010', when: 'estado de gas ideal PV = nRT' },
          { id: 'TER-015', when: 'trabajo W = ∫P dV en diagrama P–V' },
          { id: 'TER-016', when: 'primera ley ΔU = Q − W' },
          { id: 'TER-019', when: 'eficiencia de máquina térmica' },
        ],
      },
    ],
  },
  {
    id: 'circuits',
    leaves: [
      {
        id: 'ele',
        section: 'Electricidad básica',
        slug: 'electricidad-basica',
        keywords: 'Coulomb, Ohm, serie, paralelo, capacitor',
        formulas: [
          { id: 'ELE-002', when: 'fuerza entre cargas puntuales' },
          { id: 'ELE-009', when: 'ley de Ohm V = IR' },
          { id: 'ELE-014', when: 'resistencias en serie' },
          { id: 'ELE-020', when: 'energía almacenada U = ½CV²' },
        ],
      },
    ],
  },
];

export function PhysicsGuideViz({ mode }: { mode?: string }) {
  const tr = useTranslations('vizFisica.l7.guia');
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [leafId, setLeafId] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  const branch = TREE.find((b) => b.id === branchId) ?? null;
  const leaf = branch?.leaves.find((l) => l.id === leafId) ?? null;
  const options = leaf ? [] : branch ? branch.leaves : TREE;
  const optionCount = options.length;

  const reset = useCallback(() => {
    setBranchId(null);
    setLeafId(null);
    setFocusIdx(0);
  }, []);

  const goBack = useCallback(() => {
    if (leafId) setLeafId(null);
    else if (branchId) setBranchId(null);
    setFocusIdx(0);
  }, [branchId, leafId]);

  const selectOption = useCallback(
    (opt: GuideBranch | GuideLeaf) => {
      if (!branch) {
        setBranchId((opt as GuideBranch).id);
        setFocusIdx(0);
        return;
      }
      if (!leaf) {
        setLeafId((opt as GuideLeaf).id);
        setFocusIdx(0);
      }
    },
    [branch, leaf],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'Home') {
        e.preventDefault();
        reset();
      } else if (!leaf && optionCount > 0) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setFocusIdx((i) => (i + 1) % optionCount);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setFocusIdx((i) => (i - 1 + optionCount) % optionCount);
        } else if (e.key === 'Enter' && options[focusIdx]) {
          e.preventDefault();
          selectOption(options[focusIdx] as GuideBranch & GuideLeaf);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusIdx, goBack, leaf, optionCount, options, reset, selectOption]);

  const pathLabel = leaf
    ? `${tr(`branch.${branchId}`)} → ${leaf.section}`
    : branch
      ? tr(`branch.${branchId}`)
      : tr('start');

  return (
    <VizPanel>
      <div className="space-y-4" ref={listRef}>
        <PhysGuide type="approach_guide" mode={mode} />
        <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">{tr('prompt')}</p>
        <ButtonRow>
          <VizButton onClick={goBack} disabled={!branchId}>{tr('back')}</VizButton>
          <VizButton onClick={reset}>{tr('reset')}</VizButton>
        </ButtonRow>
        {!leaf ? (
          <div className="flex flex-wrap gap-2" role="listbox" aria-label={tr('choices')}>
            {options.map((opt, i) => {
              const id = 'id' in opt && 'leaves' in opt ? opt.id : (opt as GuideLeaf).id;
              const label = branch
                ? (opt as GuideLeaf).section
                : tr(`branch.${id}`);
              return (
                <VizButton
                  key={id}
                  active={i === focusIdx}
                  onClick={() => selectOption(opt as GuideBranch & GuideLeaf)}
                  aria-selected={i === focusIdx}
                >
                  {label}
                </VizButton>
              );
            })}
          </div>
        ) : null}
        {leaf ? (
          <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--formula-bg)] p-4">
            <p className="text-sm text-[var(--fg-muted)]">
              <span className="font-semibold uppercase tracking-wider">{tr('keywords')}: </span>
              {leaf.keywords}
            </p>
            <p className="text-sm font-medium">
              {tr('section')}:{' '}
              <Link href={sectionHref('fisica-basica', leaf.slug) as '/'} prefetch={false} className="text-[var(--accent-strong)] underline-offset-2 hover:underline">
                {leaf.section}
              </Link>
            </p>
            <ul className="space-y-2">
              {leaf.formulas.map((f) => (
                <li key={f.id} className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm">
                  <Link href={formulaHref('fisica-basica', f.id) as '/'} prefetch={false} className="font-mono font-semibold text-[var(--accent-strong)] underline-offset-2 hover:underline">
                    {f.id}
                  </Link>
                  <p className="mt-1 text-[var(--fg-muted)]">{f.when}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : branch ? (
          <p className="text-sm text-[var(--fg-muted)]">{tr('pickSection')}</p>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">{tr('pickTopic')}</p>
        )}
        <details className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
          <summary className="cursor-pointer font-medium">{tr('textVersion')}</summary>
          <p className="mt-2 text-[var(--fg-muted)]">{tr('textHelp')}</p>
          <p className="mt-2 font-mono text-xs">{pathLabel}</p>
          {leaf ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              {leaf.formulas.map((f) => (
                <li key={f.id}>{f.id}: {f.when}</li>
              ))}
            </ol>
          ) : null}
        </details>
        <PhysStatus id={uid}>{pathLabel}</PhysStatus>
      </div>
    </VizPanel>
  );
}
