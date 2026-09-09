'use client';

import { useId, useState } from 'react';
import { ButtonRow, VizButton, VizPanel } from '@/components/algebra/viz/controls';
import { Link } from '@/i18n/navigation';
import { sectionHref } from '@/lib/subjects';
import { PhysGuide, PhysStatus } from './physChrome';

const SIGNALS: Array<{ id: string; signal: string; section: string; slug: string }> = [
  { id: 'vec', signal: 'Componentes, magnitud, producto punto o cruz, vector unitario', section: 'Vectores', slug: 'vectores' },
  { id: 'cin', signal: 'Posición, velocidad o aceleración en línea recta; caída libre 1D', section: 'Cinemática 1D', slug: 'cinematica-1d' },
  { id: 'mov', signal: 'Proyectil, alcance, altura máxima, tiempo de vuelo', section: 'Movimiento 2D y 3D', slug: 'movimiento-2d-3d' },
  { id: 'new', signal: 'Fuerzas, diagrama de cuerpo libre, plano inclinado, fricción, tensión', section: 'Leyes de Newton', slug: 'leyes-de-newton' },
  { id: 'cir', signal: 'Curva, v = ω r, aceleración centrípeta, periodo de rotación', section: 'Movimiento circular', slug: 'movimiento-circular' },
  { id: 'ene', signal: 'Trabajo, energía cinética/potencial, potencia, conservación de energía', section: 'Trabajo, energía y potencia', slug: 'trabajo-energia-potencia' },
  { id: 'mom', signal: 'Choque, impulso, antes/después, conservación del momento', section: 'Momento, impulso y colisiones', slug: 'momento-impulso-colisiones' },
  { id: 'rot', signal: 'Disco, rueda, torque, momento de inercia, L = Iω', section: 'Rotación', slug: 'rotacion' },
  { id: 'equ', signal: 'Equilibrio estático, centro de masa, resorte (Hooke) sin oscilar', section: 'Equilibrio y elasticidad', slug: 'equilibrio-elasticidad' },
  { id: 'gra', signal: 'Gravedad entre masas, órbitas, satélites, velocidad de escape', section: 'Gravitación', slug: 'gravitacion' },
  { id: 'flu', signal: 'Presión, flotación, caudal, Bernoulli', section: 'Mecánica de fluidos', slug: 'mecanica-de-fluidos' },
  { id: 'osc', signal: 'Resorte o péndulo, periodo, frecuencia, movimiento armónico', section: 'Oscilaciones', slug: 'oscilaciones' },
  { id: 'ond', signal: 'Onda viajera, longitud de onda, interferencia, intensidad', section: 'Ondas', slug: 'ondas' },
  { id: 'son', signal: 'Sonido, batidos, efecto Doppler, nivel en decibelios', section: 'Sonido', slug: 'sonido' },
  { id: 'ter', signal: 'Calor, temperatura, gas ideal, primera ley, máquinas térmicas', section: 'Termodinámica', slug: 'termodinamica' },
  { id: 'ele', signal: 'Carga, Coulomb, campo/potencial, Ohm, circuitos R, capacitores', section: 'Electricidad básica', slug: 'electricidad-basica' },
  { id: 'cst', signal: 'Necesitas g, G, ke, c u otra constante numérica', section: 'Constantes físicas', slug: 'constantes-fisicas' },
];

export function PhysicsGuideViz({ mode }: { mode?: string }) {
  const uid = useId();
  const [sel, setSel] = useState<string | null>(null);
  const picked = SIGNALS.find((s) => s.id === sel);

  return (
    <VizPanel>
      <div className="space-y-4">
        <PhysGuide type="approach_guide" mode={mode} />
        <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">Señal en el enunciado</p>
        <ButtonRow>
          {SIGNALS.map((s) => (
            <VizButton key={s.id} active={sel === s.id} onClick={() => setSel(s.id)}>
              {s.section}
            </VizButton>
          ))}
        </ButtonRow>
        {picked ? (
          <div className="rounded-lg border border-[var(--border)] px-3 py-3 text-sm">
            <p className="text-[var(--fg-muted)]">{picked.signal}</p>
            <p className="mt-2 font-medium">
              Enfoque:{' '}
              <Link
                href={sectionHref('fisica-basica', picked.slug) as '/'}
                className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
              >
                {picked.section}
              </Link>
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--fg-muted)]">Elige una señal, por ejemplo «proyectil, alcance».</p>
        )}
        <PhysStatus id={uid}>
          {picked ? `sección → ${picked.section}` : 'el enunciado ya apunta al bloque'}
        </PhysStatus>
      </div>
    </VizPanel>
  );
}
