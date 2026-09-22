/**
 * Interactive viz for Física Electrónica.
 * Formula-hosted anchors + section 18 approach guide.
 */

export type ElectronicaSectionViz = {
  type: string;
  concept: string;
  mode?: string;
};

function v(type: string, concept: string, mode?: string): ElectronicaSectionViz {
  return mode ? { type, concept, mode } : { type, concept };
}

export const ELECTRONICA_VIZ_BY_FORMULA_ID: Record<string, ElectronicaSectionViz> = {
  'DIV-001': v('voltage_divider', 'Vo vs R2 en el divisor descargado', 'unloaded'),
  'DIV-002': v('voltage_divider', 'Corriente por cada rama del divisor', 'current'),
  'DIV-003': v('voltage_divider', 'Carga RL en paralelo con R2 baja Vo', 'loaded'),
  'DIV-006': v('thevenin_norton', 'Red sustituida por VTh y RTh', 'vth'),
  'DIV-007': v('thevenin_norton', 'RTh vista desde los bornes en vacío', 'rth'),
  'DIV-008': v('thevenin_norton', 'Fuente de corriente Norton IN', 'in'),
  'DIV-009': v('thevenin_norton', 'RN = RTh en el equivalente Norton', 'rn'),
  'DIV-010': v('thevenin_norton', 'VTh = IN RN', 'equiv'),
  'TRN-001': v('rc_transient', 'Respuesta completa v∞+(v0−v∞)e^(−t/τ)', 'general'),
  'TRN-002': v('rc_transient', 'Carga exponencial del capacitor', 'charge'),
  'TRN-003': v('rc_transient', 'Descarga exponencial del capacitor', 'discharge'),
  'TRN-005': v('rc_transient', 'La corriente RL interpola i0 e i∞ con τ', 'rl_general'),
  'TRN-006': v('rc_transient', 'Carga de corriente del inductor', 'rl_charge'),
  'TRN-007': v('rc_transient', 'Descarga de corriente del inductor', 'rl_discharge'),
  'RLC-004': v('rlc_damping', 'Sobreamortiguado: dos exponenciales', 'over'),
  'RLC-005': v('rlc_damping', 'Crítico: frontera sin oscilación', 'critical'),
  'RLC-006': v('rlc_damping', 'Subamortiguado: oscilación que decae', 'under'),
  'FAS-001': v('phasor_diagram', 'Sinusoide y fasor giratorio', 'sine'),
  'FAS-003': v('phasor_diagram', 'RMS como longitud del fasor', 'rms'),
  'FAS-008': v('impedance_triangle', 'Z=R+jX es el cateto R y el cateto X', 'z'),
  'FAS-009': v('impedance_triangle', 'Y = 1/Z como admitancia', 'y'),
  'PAC-005': v('impedance_triangle', 'Triángulo P, Q, S', 'power'),
  'PAC-008': v('resonance_curve', 'Resonancia serie: |Z| mínimo en ω0', 'series'),
  'PAC-009': v('resonance_curve', 'Resonancia paralelo: |Z| máximo en ω0', 'parallel'),
  'FIL-001': v('bode_filter', 'Pasa-bajos RC: |H| y corte', 'lp_rc'),
  'FIL-002': v('bode_filter', 'fc = 1/(2π RC) en el Bode', 'fc'),
  'FIL-003': v('bode_filter', 'Pasa-altos RC', 'hp_rc'),
  'FIL-004': v('bode_filter', 'Pasa-bajos RL', 'lp_rl'),
  'DIO-003': v('diode_iv', 'Curva de Shockley I(v)', 'shockley'),
  'DIO-005': v('diode_iv', 'Umbral ~0.7 V del silicio', 'threshold'),
  'DIO-006': v('diode_iv', 'Media onda: solo alternancias positivas', 'half'),
  'DIO-007': v('diode_iv', 'Onda completa: ambas alternancias', 'full'),
  'BJT-005': v('bjt_load_line', 'Región activa en la recta de carga', 'active'),
  'BJT-006': v('bjt_load_line', 'Corte: IC ≈ 0', 'cutoff'),
  'BJT-007': v('bjt_load_line', 'Saturación: VCE sat', 'sat'),
  'BJT-008': v('bjt_load_line', 'Recta de carga y punto Q', 'loadline'),
  'OPA-004': v('opamp_circuit', 'Inversor: nudo virtual a tierra', 'inv'),
  'OPA-005': v('opamp_circuit', 'No inversor: ganancia 1+Rf/Rg', 'ninv'),
  'OPA-006': v('opamp_circuit', 'Seguidor: ganancia 1', 'buffer'),
  'OPA-009': v('opamp_circuit', 'Integrador: rampa de salida', 'int'),
  'LGC-001': v('cmos_vtc', 'Niveles VOH VOL VIH VIL', 'levels'),
  'LGC-002': v('cmos_vtc', 'Margen de ruido alto NMH', 'nmh'),
  'LGC-007': v('cmos_vtc', 'Curva de transferencia CMOS', 'vtc'),
  'SEQ-003': v('flip_flop_timing', 'Flip-flop D muestreado por el reloj', 'dff'),
  'SEQ-006': v('flip_flop_timing', 'Ventana de setup antes del flanco', 'setup'),
  'SEQ-007': v('flip_flop_timing', 'Hold después del flanco', 'hold'),
  'ADC-001': v('sampling_pwm', 'Muestreo por encima de Nyquist', 'nyquist'),
  'ADC-003': v('sampling_pwm', 'Escalones de cuantización Δ', 'quant'),
  'ADC-005': v('sampling_pwm', 'Ciclo útil PWM ton/T', 'pwm'),
  'ADC-006': v('sampling_pwm', 'DAC R-2R: pesos binarios', 'r2r'),
};

export const ELECTRONICA_VIZ_BY_SECTION_NUMBER: Record<string, ElectronicaSectionViz> = {
  '18': v('electronics_guide', 'Elegir el bloque de fórmulas según la señal del circuito'),
};

export function electronicaVizForFormulaId(formulaId: string): ElectronicaSectionViz | undefined {
  return ELECTRONICA_VIZ_BY_FORMULA_ID[formulaId];
}

export function electronicaVizForSectionNumber(number: string): ElectronicaSectionViz | undefined {
  return ELECTRONICA_VIZ_BY_SECTION_NUMBER[number];
}
