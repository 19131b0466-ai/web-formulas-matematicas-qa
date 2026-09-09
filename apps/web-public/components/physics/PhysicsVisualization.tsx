'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type Props = {
  type: string;
  concept?: string;
  mode?: string;
  formulaId?: string;
};

type VizProps = { mode?: string };

function viz(loader: () => Promise<{ default: ComponentType<VizProps> }>) {
  return dynamic(loader, {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-[var(--border)] bg-[var(--formula-bg)]" />
    ),
  });
}

const VectorMagnitudeViz = viz(() =>
  import('./viz/VectorMagnitudeViz').then((m) => ({ default: m.VectorMagnitudeViz })),
);
const UnitVectorPhysicsViz = viz(() =>
  import('./viz/UnitVectorPhysicsViz').then((m) => ({ default: m.UnitVectorPhysicsViz })),
);
const VectorDecompositionViz = viz(() =>
  import('./viz/VectorDecompositionViz').then((m) => ({ default: m.VectorDecompositionViz })),
);
const VectorAdditionViz = viz(() =>
  import('./viz/VectorAdditionViz').then((m) => ({ default: m.VectorAdditionViz })),
);
const DotProductPhysicsViz = viz(() =>
  import('./viz/DotProductPhysicsViz').then((m) => ({ default: m.DotProductPhysicsViz })),
);
const CrossProductViz = viz(() =>
  import('./viz/CrossProductViz').then((m) => ({ default: m.CrossProductViz })),
);
const Kinematics1DViz = viz(() =>
  import('./viz/Kinematics1DViz').then((m) => ({ default: m.Kinematics1DViz })),
);
const FreeFallViz = viz(() => import('./viz/FreeFallViz').then((m) => ({ default: m.FreeFallViz })));
const VelocityAcceleration2DViz = viz(() =>
  import('./viz/VelocityAcceleration2DViz').then((m) => ({ default: m.VelocityAcceleration2DViz })),
);
const ProjectileMotionViz = viz(() =>
  import('./viz/ProjectileMotionViz').then((m) => ({ default: m.ProjectileMotionViz })),
);
const RelativeVelocityViz = viz(() =>
  import('./viz/RelativeVelocityViz').then((m) => ({ default: m.RelativeVelocityViz })),
);
const NewtonSecondLawViz = viz(() =>
  import('./viz/NewtonSecondLawViz').then((m) => ({ default: m.NewtonSecondLawViz })),
);
const NewtonThirdLawViz = viz(() =>
  import('./viz/NewtonThirdLawViz').then((m) => ({ default: m.NewtonThirdLawViz })),
);
const FrictionViz = viz(() => import('./viz/FrictionViz').then((m) => ({ default: m.FrictionViz })));
const HookeViz = viz(() => import('./viz/HookeViz').then((m) => ({ default: m.HookeViz })));
const InclinedPlaneViz = viz(() =>
  import('./viz/InclinedPlaneViz').then((m) => ({ default: m.InclinedPlaneViz })),
);
const CircularMotionViz = viz(() =>
  import('./viz/CircularMotionViz').then((m) => ({ default: m.CircularMotionViz })),
);
const MomentOfInertiaViz = viz(() =>
  import('./viz/MomentOfInertiaViz').then((m) => ({ default: m.MomentOfInertiaViz })),
);
const TorqueViz = viz(() => import('./viz/TorqueViz').then((m) => ({ default: m.TorqueViz })));
const RollingViz = viz(() => import('./viz/RollingViz').then((m) => ({ default: m.RollingViz })));
const AngularMomentumViz = viz(() =>
  import('./viz/AngularMomentumViz').then((m) => ({ default: m.AngularMomentumViz })),
);
const WorkConstantViz = viz(() =>
  import('./viz/WorkConstantViz').then((m) => ({ default: m.WorkConstantViz })),
);
const WorkVariablePhysicsViz = viz(() =>
  import('./viz/WorkVariablePhysicsViz').then((m) => ({ default: m.WorkVariablePhysicsViz })),
);
const PotentialForceViz = viz(() =>
  import('./viz/PotentialForceViz').then((m) => ({ default: m.PotentialForceViz })),
);
const MechanicalEnergyViz = viz(() =>
  import('./viz/MechanicalEnergyViz').then((m) => ({ default: m.MechanicalEnergyViz })),
);
const ImpulseMomentumViz = viz(() =>
  import('./viz/ImpulseMomentumViz').then((m) => ({ default: m.ImpulseMomentumViz })),
);
const Collision1DViz = viz(() =>
  import('./viz/Collision1DViz').then((m) => ({ default: m.Collision1DViz })),
);
const CenterOfMassViz = viz(() =>
  import('./viz/CenterOfMassViz').then((m) => ({ default: m.CenterOfMassViz })),
);
const BeamEquilibriumViz = viz(() =>
  import('./viz/BeamEquilibriumViz').then((m) => ({ default: m.BeamEquilibriumViz })),
);
const YoungModulusViz = viz(() =>
  import('./viz/YoungModulusViz').then((m) => ({ default: m.YoungModulusViz })),
);
const GravitationViz = viz(() =>
  import('./viz/GravitationViz').then((m) => ({ default: m.GravitationViz })),
);
const OrbitViz = viz(() => import('./viz/OrbitViz').then((m) => ({ default: m.OrbitViz })));
const HydrostaticViz = viz(() =>
  import('./viz/HydrostaticViz').then((m) => ({ default: m.HydrostaticViz })),
);
const PascalViz = viz(() => import('./viz/PascalViz').then((m) => ({ default: m.PascalViz })));
const ArchimedesViz = viz(() =>
  import('./viz/ArchimedesViz').then((m) => ({ default: m.ArchimedesViz })),
);
const BernoulliViz = viz(() =>
  import('./viz/BernoulliViz').then((m) => ({ default: m.BernoulliViz })),
);
const SHMViz = viz(() => import('./viz/SHMViz').then((m) => ({ default: m.SHMViz })));
const PendulumViz = viz(() => import('./viz/PendulumViz').then((m) => ({ default: m.PendulumViz })));
const TravelingWaveViz = viz(() =>
  import('./viz/TravelingWaveViz').then((m) => ({ default: m.TravelingWaveViz })),
);
const StandingWaveViz = viz(() =>
  import('./viz/StandingWaveViz').then((m) => ({ default: m.StandingWaveViz })),
);
const InterferenceViz = viz(() =>
  import('./viz/InterferenceViz').then((m) => ({ default: m.InterferenceViz })),
);
const DopplerViz = viz(() => import('./viz/DopplerViz').then((m) => ({ default: m.DopplerViz })));
const BeatsViz = viz(() => import('./viz/BeatsViz').then((m) => ({ default: m.BeatsViz })));
const ResonanceTubeViz = viz(() =>
  import('./viz/ResonanceTubeViz').then((m) => ({ default: m.ResonanceTubeViz })),
);
const ThermalExpansionViz = viz(() =>
  import('./viz/ThermalExpansionViz').then((m) => ({ default: m.ThermalExpansionViz })),
);
const PVProcessViz = viz(() =>
  import('./viz/PVProcessViz').then((m) => ({ default: m.PVProcessViz })),
);
const HeatEngineViz = viz(() =>
  import('./viz/HeatEngineViz').then((m) => ({ default: m.HeatEngineViz })),
);
const CoulombFieldViz = viz(() =>
  import('./viz/CoulombFieldViz').then((m) => ({ default: m.CoulombFieldViz })),
);
const ResistorNetworkViz = viz(() =>
  import('./viz/ResistorNetworkViz').then((m) => ({ default: m.ResistorNetworkViz })),
);
const KirchhoffViz = viz(() =>
  import('./viz/KirchhoffViz').then((m) => ({ default: m.KirchhoffViz })),
);
const ParallelPlateViz = viz(() =>
  import('./viz/ParallelPlateViz').then((m) => ({ default: m.ParallelPlateViz })),
);
const PhysicsGuideViz = viz(() =>
  import('./viz/PhysicsGuideViz').then((m) => ({ default: m.PhysicsGuideViz })),
);

export function PhysicsVisualization({ type, concept, mode }: Props) {
  const t = useTranslations('seo');
  let body: ReactNode;

  switch (type) {
    case 'vector_magnitude':
      body = <VectorMagnitudeViz mode={mode} />;
      break;
    case 'unit_vector':
      body = <UnitVectorPhysicsViz mode={mode} />;
      break;
    case 'vector_decomposition':
      body = <VectorDecompositionViz mode={mode} />;
      break;
    case 'vector_addition':
      body = <VectorAdditionViz mode={mode} />;
      break;
    case 'dot_product':
      body = <DotProductPhysicsViz mode={mode} />;
      break;
    case 'cross_product':
      body = <CrossProductViz mode={mode} />;
      break;
    case 'kinematics_1d':
      body = <Kinematics1DViz mode={mode} />;
      break;
    case 'free_fall':
      body = <FreeFallViz mode={mode} />;
      break;
    case 'velocity_accel_2d':
      body = <VelocityAcceleration2DViz mode={mode} />;
      break;
    case 'projectile_motion':
      body = <ProjectileMotionViz mode={mode} />;
      break;
    case 'relative_velocity':
      body = <RelativeVelocityViz mode={mode} />;
      break;
    case 'newton_second':
      body = <NewtonSecondLawViz mode={mode} />;
      break;
    case 'newton_third':
      body = <NewtonThirdLawViz mode={mode} />;
      break;
    case 'friction':
      body = <FrictionViz mode={mode} />;
      break;
    case 'hooke':
      body = <HookeViz mode={mode} />;
      break;
    case 'inclined_plane':
      body = <InclinedPlaneViz mode={mode} />;
      break;
    case 'circular_motion':
      body = <CircularMotionViz mode={mode} />;
      break;
    case 'moment_of_inertia':
      body = <MomentOfInertiaViz mode={mode} />;
      break;
    case 'torque':
      body = <TorqueViz mode={mode} />;
      break;
    case 'rolling':
      body = <RollingViz mode={mode} />;
      break;
    case 'angular_momentum':
      body = <AngularMomentumViz mode={mode} />;
      break;
    case 'work_constant':
      body = <WorkConstantViz mode={mode} />;
      break;
    case 'work_variable':
      body = <WorkVariablePhysicsViz mode={mode} />;
      break;
    case 'potential_force':
      body = <PotentialForceViz mode={mode} />;
      break;
    case 'mechanical_energy':
      body = <MechanicalEnergyViz mode={mode} />;
      break;
    case 'impulse_momentum':
      body = <ImpulseMomentumViz mode={mode} />;
      break;
    case 'collision_1d':
      body = <Collision1DViz mode={mode} />;
      break;
    case 'center_of_mass':
      body = <CenterOfMassViz mode={mode} />;
      break;
    case 'beam_equilibrium':
      body = <BeamEquilibriumViz mode={mode} />;
      break;
    case 'young_modulus':
      body = <YoungModulusViz mode={mode} />;
      break;
    case 'gravitation':
      body = <GravitationViz mode={mode} />;
      break;
    case 'orbit':
      body = <OrbitViz mode={mode} />;
      break;
    case 'hydrostatic':
      body = <HydrostaticViz mode={mode} />;
      break;
    case 'pascal':
      body = <PascalViz mode={mode} />;
      break;
    case 'archimedes':
      body = <ArchimedesViz mode={mode} />;
      break;
    case 'bernoulli':
      body = <BernoulliViz mode={mode} />;
      break;
    case 'shm':
      body = <SHMViz mode={mode} />;
      break;
    case 'pendulum':
      body = <PendulumViz mode={mode} />;
      break;
    case 'traveling_wave':
      body = <TravelingWaveViz mode={mode} />;
      break;
    case 'standing_wave':
      body = <StandingWaveViz mode={mode} />;
      break;
    case 'interference':
      body = <InterferenceViz mode={mode} />;
      break;
    case 'doppler':
      body = <DopplerViz mode={mode} />;
      break;
    case 'beats':
      body = <BeatsViz mode={mode} />;
      break;
    case 'resonance_tube':
      body = <ResonanceTubeViz mode={mode} />;
      break;
    case 'thermal_expansion':
      body = <ThermalExpansionViz mode={mode} />;
      break;
    case 'pv_process':
      body = <PVProcessViz mode={mode} />;
      break;
    case 'heat_engine':
      body = <HeatEngineViz mode={mode} />;
      break;
    case 'coulomb_field':
      body = <CoulombFieldViz mode={mode} />;
      break;
    case 'resistor_network':
      body = <ResistorNetworkViz mode={mode} />;
      break;
    case 'kirchhoff':
      body = <KirchhoffViz mode={mode} />;
      break;
    case 'parallel_plate':
      body = <ParallelPlateViz mode={mode} />;
      break;
    case 'approach_guide':
      body = <PhysicsGuideViz mode={mode} />;
      break;
    default:
      body = (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--formula-bg)] px-4 py-3 text-sm text-[var(--fg-muted)]">
          {t('comingSoonViz', { type: concept ? `${type}: ${concept}` : type })}
        </div>
      );
  }

  return (
    <section className="animate-rise" style={{ animationDelay: '90ms' }}>
      {body}
    </section>
  );
}
