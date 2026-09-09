/**
 * Interactive viz for Física Básica.
 *
 * Formula-hosted: one defining ID (same idea as calculo-viz).
 * Section-hosted: only chapter 18 (approach guide — no single formula).
 *
 * IDs are matched with exact equality. Never use includes() — physics VEC-001
 * is not algebra ALG-VEC-001.
 */

export type FisicaSectionViz = {
  type: string;
  concept: string;
  mode?: string;
};

function v(type: string, concept: string, mode?: string): FisicaSectionViz {
  return mode ? { type, concept, mode } : { type, concept };
}

export const FISICA_VIZ_BY_FORMULA_ID: Record<string, FisicaSectionViz> = {
  // 1. Vectores
  'VEC-001': v('vector_magnitude', 'Módulo |A| como longitud de la flecha'),
  'VEC-002': v('unit_vector', 'Vector unitario: misma dirección, longitud 1'),
  'VEC-003': v('vector_decomposition', 'Componentes Ax = A cos θ, Ay = A sen θ'),
  'VEC-004': v('vector_addition', 'Suma de vectores: punta-cola y paralelogramo'),
  'VEC-005': v('dot_product', 'Producto escalar y proyección'),
  'VEC-006': v('cross_product', 'Producto vectorial: área del paralelogramo'),

  // 2. Cinemática 1D
  'CIN-001': v('kinematics_1d', 'Desplazamiento Δx = xf − xi', 'displacement'),
  'CIN-002': v('kinematics_1d', 'Velocidad media como pendiente de la cuerda', 'avg_velocity'),
  'CIN-003': v('kinematics_1d', 'Rapidez media vs desplazamiento', 'avg_speed'),
  'CIN-004': v('kinematics_1d', 'Velocidad instantánea: tangente a x(t)', 'inst_velocity'),
  'CIN-005': v('kinematics_1d', 'Aceleración media como pendiente de v(t)', 'avg_accel'),
  'CIN-006': v('kinematics_1d', 'Aceleración instantánea: tangente a v(t)', 'inst_accel'),
  'CIN-007': v('kinematics_1d', 'MRU: x = x0 + vt', 'mru'),
  'CIN-008': v('kinematics_1d', 'MRUA: v = v0 + at', 'mrua_v'),
  'CIN-009': v('kinematics_1d', 'MRUA: x = x0 + v0 t + ½ a t²', 'mrua_x'),
  'CIN-010': v('kinematics_1d', 'Torricelli: vf² = v0² + 2 a Δx', 'torricelli'),
  'CIN-011': v('kinematics_1d', 'Δx = ((v0+vf)/2) t', 'mrua_avg'),
  'CIN-012': v('kinematics_1d', 'v(t) = v(t0) + ∫ a dτ', 'var_a'),
  'CIN-013': v('kinematics_1d', 'x(t) = x(t0) + ∫ v dτ', 'var_v'),
  'CIN-014': v('free_fall', 'Caída libre: vy = v0y − g t', 'velocity'),
  'CIN-015': v('free_fall', 'Caída libre: y = y0 + v0y t − ½ g t²', 'position'),
  'CIN-016': v('free_fall', 'Caída libre: vy² = v0y² − 2 g Δy', 'torricelli'),
  'CIN-017': v('free_fall', 'Altura máxima Δh = v0² / (2g)', 'hmax'),
  'CIN-018': v('free_fall', 'Tiempo de subida t = v0 / g', 't_up'),
  'CIN-019': v('free_fall', 'Tiempo de vuelo t = 2 v0 / g', 't_flight'),

  // 3. Movimiento 2D
  'MOV-001': v('vector_decomposition', 'Vector posición r = x î + y ĵ', 'position'),
  'MOV-002': v('velocity_accel_2d', 'Desplazamiento vectorial Δr = rf − ri', 'displacement'),
  'MOV-003': v('velocity_accel_2d', 'Velocidad media vectorial Δr / Δt', 'avg_velocity'),
  'MOV-004': v('velocity_accel_2d', 'Velocidad instantánea tangente a la trayectoria', 'inst_velocity'),
  'MOV-005': v('velocity_accel_2d', 'Aceleración vectorial: normal y tangencial', 'acceleration'),
  'MOV-006': v('projectile_motion', 'Componentes de v0: v0 cos θ, v0 sen θ', 'components'),
  'MOV-007': v('projectile_motion', 'Proyectil: x = (v0 cos θ) t', 'x'),
  'MOV-008': v('projectile_motion', 'Proyectil: y = (v0 sen θ) t − ½ g t²', 'y'),
  'MOV-009': v('projectile_motion', 'Proyectil: vy = v0 sen θ − g t', 'vy'),
  'MOV-010': v('projectile_motion', 'Proyectil: vx = v0 cos θ constante', 'vx'),
  'MOV-011': v('projectile_motion', 'Tiempo hasta la cima t = v0 sen θ / g', 'tmax'),
  'MOV-012': v('projectile_motion', 'Altura máxima H = v0² sen²θ / (2g)', 'hmax'),
  'MOV-013': v('projectile_motion', 'Tiempo de vuelo t = 2 v0 sen θ / g', 'tflight'),
  'MOV-014': v('projectile_motion', 'Alcance R = v0² sen(2θ) / g', 'range'),
  'MOV-015': v('relative_velocity', 'Velocidad relativa vP/A = vP/B + vB/A'),

  // 4. Newton
  'NEW-001': v('newton_second', 'Primera ley: si ΣF = 0, a = 0', 'inertia'),
  'NEW-002': v('newton_second', 'Segunda ley: ΣF = m a'),
  'NEW-003': v('newton_third', 'Tercera ley: acción y reacción en cuerpos distintos'),
  'NEW-004': v('newton_second', 'Peso Fg = m g', 'weight'),
  'NEW-005': v('friction', 'Fricción cinética fk = μk N', 'kinetic'),
  'NEW-006': v('friction', 'Fricción estática fs ≤ μs N'),
  'NEW-007': v('hooke', 'Ley de Hooke Fx = −k x'),
  'NEW-008': v('inclined_plane', 'Componentes del peso en un plano inclinado'),

  // 5. Circular
  'CIR-001': v('circular_motion', 'Desplazamiento angular Δθ', 'dtheta'),
  'CIR-002': v('circular_motion', 'Velocidad angular media Δθ / Δt', 'omega_avg'),
  'CIR-003': v('circular_motion', 'Velocidad angular instantánea ω = dθ/dt', 'omega'),
  'CIR-004': v('circular_motion', 'v = ω r', 'v_omega_r'),
  'CIR-005': v('circular_motion', 'ω = 2π f = 2π / T', 'omega_freq'),
  'CIR-006': v('circular_motion', 'Aceleración centrípeta ac = v²/r'),
  'CIR-007': v('circular_motion', 'Fuerza centrípeta neta Fc = m ac', 'Fc'),
  'CIR-008': v('circular_motion', 'Aceleración tangencial at = α r', 'tangential'),

  // 6. Energía
  'ENE-001': v('work_constant', 'Trabajo de fuerza constante W = F · d'),
  'ENE-002': v('work_variable', 'Trabajo variable: área bajo F(x)'),
  'ENE-003': v('mechanical_energy', 'Energía cinética K = ½ m v²', 'kinetic'),
  'ENE-004': v('mechanical_energy', 'Energía potencial gravitatoria Ug = m g y', 'grav'),
  'ENE-005': v('mechanical_energy', 'Energía potencial elástica Us = ½ k x²', 'spring'),
  'ENE-006': v('potential_force', 'Trabajo conservativo Wc = −ΔU', 'conservative_work'),
  'ENE-007': v('mechanical_energy', 'Teorema trabajo-energía Wneto = ΔK', 'work_energy'),
  'ENE-008': v('potential_force', 'Fuerza conservativa Fx = −dU/dx'),
  'ENE-009': v('mechanical_energy', 'Energía mecánica Emec = K + U', 'total'),
  'ENE-010': v('mechanical_energy', 'Conservación de energía mecánica'),
  'ENE-011': v('mechanical_energy', 'ΔEmec = Wnc', 'nonconservative'),
  'ENE-012': v('mechanical_energy', 'Trabajo de la fricción Wf = −fk d', 'friction_work'),
  'ENE-013': v('work_constant', 'Potencia media P = W / Δt', 'power_avg'),
  'ENE-014': v('work_constant', 'Potencia instantánea P = F · v', 'power_inst'),

  // 7. Momento
  'MOM-001': v('impulse_momentum', 'Momento lineal p = m v', 'p'),
  'MOM-002': v('impulse_momentum', 'ΣF = dp/dt', 'F_dpdt'),
  'MOM-003': v('impulse_momentum', 'Impulso J = ∫ F dt', 'J'),
  'MOM-004': v('impulse_momentum', 'Teorema impulso-momento J = Δp'),
  'MOM-005': v('collision_1d', 'Conservación del momento lineal', 'conservation'),
  'MOM-006': v('collision_1d', 'Colisión perfectamente inelástica', 'inelastic'),
  'MOM-007': v('collision_1d', 'Colisión elástica 1D'),
  'MOM-008': v('center_of_mass', 'Centro de masa ponderado por masa'),
  'MOM-009': v('center_of_mass', 'Velocidad del centro de masa', 'v_cm'),

  // 8. Rotación
  'ROT-001': v('circular_motion', 'Aceleración angular α = dω/dt', 'alpha'),
  'ROT-002': v('circular_motion', 'ωf = ω0 + α t', 'omega_alpha'),
  'ROT-003': v('circular_motion', 'θ = θ0 + ω0 t + ½ α t²', 'theta_alpha'),
  'ROT-004': v('circular_motion', 'ωf² = ω0² + 2 α Δθ', 'ang_torricelli'),
  'ROT-005': v('moment_of_inertia', 'I = Σ mi ri²'),
  'ROT-006': v('moment_of_inertia', 'I = ∫ r² dm', 'continuous'),
  'ROT-007': v('moment_of_inertia', 'Teorema de ejes paralelos I = ICM + M d²', 'parallel_axis'),
  'ROT-008': v('cross_product', 'Torque τ = r × F', 'torque'),
  'ROT-009': v('torque', 'Segunda ley de la rotación Στ = I α'),
  'ROT-010': v('rolling', 'Energía cinética de rotación ½ I ω²', 'krot'),
  'ROT-011': v('rolling', 'Rodadura sin deslizamiento vCM = R ω'),
  'ROT-012': v('cross_product', 'Momento angular L = r × p', 'angular_momentum'),
  'ROT-013': v('angular_momentum', 'L = I ω para eje fijo', 'L_Iomega'),
  'ROT-014': v('angular_momentum', 'Στext = dL/dt', 'tau_dL'),
  'ROT-015': v('angular_momentum', 'Conservación de L: Ii ωi = If ωf'),

  // 9. Equilibrio
  'EQU-001': v('newton_second', 'Equilibrio traslacional ΣF = 0', 'inertia'),
  'EQU-002': v('beam_equilibrium', 'Equilibrio rotacional Στ = 0'),
  'EQU-003': v('young_modulus', 'Esfuerzo normal σ = F⊥ / A', 'stress'),
  'EQU-004': v('young_modulus', 'Deformación longitudinal ε = ΔL / L0', 'strain'),
  'EQU-005': v('young_modulus', 'Módulo de Young Y = σ / ε'),

  // 10. Gravitación
  'GRA-001': v('gravitation', 'Ley de gravitación F = G m1 m2 / r²'),
  'GRA-002': v('gravitation', 'Campo gravitatorio g = G M / r²', 'field'),
  'GRA-003': v('orbit', 'Energía potencial U = −G M m / r', 'U'),
  'GRA-005': v('orbit', 'Velocidad orbital circular v = √(GM/r)'),
  'GRA-006': v('orbit', 'Periodo orbital T² ∝ r³', 'period'),
  'GRA-007': v('orbit', 'Velocidad de escape √(2GM/R)', 'escape'),
  'GRA-008': v('orbit', 'Energía de órbita circular E = −GMm/(2r)', 'E'),

  // 11. Fluidos
  'FLU-002': v('hydrostatic', 'Presión P = F⊥ / A', 'pressure'),
  'FLU-003': v('hydrostatic', 'Presión hidrostática P = P0 + ρ g h'),
  'FLU-004': v('hydrostatic', 'Diferencia de presión ρ g Δy', 'difference'),
  'FLU-005': v('pascal', 'Principio de Pascal: F1/A1 = F2/A2'),
  'FLU-006': v('archimedes', 'Empuje de Arquímedes = peso del fluido desplazado'),
  'FLU-007': v('bernoulli', 'Caudal Q = A v', 'Q'),
  'FLU-008': v('bernoulli', 'Continuidad A1 v1 = A2 v2', 'continuity'),
  'FLU-009': v('bernoulli', 'Ecuación de Bernoulli'),
  'FLU-010': v('bernoulli', 'Ley de Torricelli v = √(2 g h)', 'torricelli'),
  'FLU-011': v('bernoulli', 'Flujo másico ṁ = ρ A v', 'mass_flow'),

  // 12. Oscilaciones
  'OSC-001': v('shm', 'Periodo y frecuencia f = 1/T', 'Tf'),
  'OSC-002': v('shm', 'Frecuencia angular ω = 2π f', 'omega'),
  'OSC-003': v('shm', 'Posición en MAS x = A cos(ωt + φ)'),
  'OSC-004': v('shm', 'Aceleración a = −ω² x', 'a'),
  'OSC-005': v('shm', 'Velocidad en MAS', 'v'),
  'OSC-006': v('shm', 'ω = √(k/m) masa-resorte', 'omega_spring'),
  'OSC-007': v('shm', 'T = 2π √(m/k)', 'period_spring'),
  'OSC-008': v('shm', 'Energía del MAS ½ k A²', 'energy'),
  'OSC-009': v('shm', 'vmax = A ω', 'vmax'),
  'OSC-010': v('shm', 'amax = A ω²', 'amax'),
  'OSC-011': v('pendulum', 'Péndulo: ω = √(g/L)', 'omega'),
  'OSC-012': v('pendulum', 'Péndulo: T = 2π √(L/g)'),

  // 13–14. Ondas y sonido
  'OND-001': v('traveling_wave', 'v = λ f', 'v_lambda_f'),
  'OND-002': v('traveling_wave', 'Periodo T = 1/f', 'T'),
  'OND-003': v('traveling_wave', 'Número de onda k = 2π/λ', 'k'),
  'OND-004': v('traveling_wave', 'ω = 2π f; v = ω/k', 'omega'),
  'OND-005': v('traveling_wave', 'Onda armónica viajera y(x,t)'),
  'OND-007': v('standing_wave', 'Modos de una cuerda fija-fija'),
  'OND-008': v('interference', 'Superposición y1 + y2', 'superposition'),
  'OND-009': v('interference', 'Interferencia: Δr en múltiplos de λ'),
  'SON-001': v('traveling_wave', 'Velocidad del sonido v = λ f', 'v_lambda_f'),
  'SON-004': v('doppler', 'Efecto Doppler f′ = f (v ± vo)/(v ∓ vs)'),
  'SON-005': v('beats', 'Batidos fbat = |f1 − f2|'),
  'SON-006': v('resonance_tube', 'Tubo abierto: fn = n v / (2L)'),
  'SON-007': v('resonance_tube', 'Tubo cerrado: n impar, v/(4L)', 'closed'),

  // 15. Termodinámica
  'TER-003': v('thermal_expansion', 'Dilatación lineal ΔL = α L0 ΔT'),
  'TER-004': v('thermal_expansion', 'Dilatación superficial ≈ 2α', 'area'),
  'TER-005': v('thermal_expansion', 'Dilatación volumétrica β ≈ 3α', 'volume'),
  'TER-010': v('pv_process', 'Gas ideal PV = n R T', 'ideal_gas'),
  'TER-011': v('pv_process', 'Ley combinada PV/T constante', 'combined'),
  'TER-014': v('pv_process', 'U = (3/2) n R T (monoatómico)', 'U'),
  'TER-015': v('pv_process', 'Trabajo termodinámico ∫ P dV', 'work'),
  'TER-016': v('pv_process', 'Primera ley ΔU = Q − W'),
  'TER-017': v('pv_process', 'Proceso isotérmico', 'isothermal'),
  'TER-018': v('pv_process', 'Proceso adiabático PV^γ', 'adiabatic'),
  'TER-019': v('heat_engine', 'Eficiencia η = W / QH'),
  'TER-020': v('heat_engine', 'Carnot ηC = 1 − TC/TH', 'carnot'),

  // 16. Electricidad
  'ELE-002': v('coulomb_field', 'Ley de Coulomb F = ke |q1 q2| / r²'),
  'ELE-003': v('coulomb_field', 'Campo eléctrico E = F/q', 'field'),
  'ELE-004': v('coulomb_field', 'Fuerza F = q E', 'force_on_q'),
  'ELE-007': v('coulomb_field', 'Campo uniforme |ΔV| = E d', 'uniform'),
  'ELE-009': v('resistor_network', 'Ley de Ohm V = I R', 'ohm'),
  'ELE-010': v('resistor_network', 'R = ρ L / A', 'resistivity'),
  'ELE-014': v('resistor_network', 'Resistencias en serie'),
  'ELE-015': v('resistor_network', 'Resistencias en paralelo', 'parallel'),
  'ELE-016': v('kirchhoff', 'Primera ley: Σ I = 0 en un nudo'),
  'ELE-017': v('kirchhoff', 'Segunda ley: Σ ΔV = 0 en una malla', 'loop'),
  'ELE-018': v('parallel_plate', 'Capacitancia C = Q / V', 'C_QV'),
  'ELE-019': v('parallel_plate', 'Capacitor de placas C = ε0 A / d'),
  'ELE-020': v('parallel_plate', 'Energía U = ½ C V²', 'energy'),
};

export const FISICA_VIZ_BY_SECTION_NUMBER: Record<string, FisicaSectionViz> = {
  '18': v('approach_guide', 'Elegir el bloque de fórmulas según la señal del enunciado'),
};

export function fisicaVizForFormulaId(formulaId: string): FisicaSectionViz | undefined {
  return FISICA_VIZ_BY_FORMULA_ID[formulaId];
}

export function fisicaVizForSectionNumber(number: string): FisicaSectionViz | undefined {
  return FISICA_VIZ_BY_SECTION_NUMBER[number];
}
