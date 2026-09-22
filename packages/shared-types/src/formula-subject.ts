/** Infer catalog subject from a stable formula code prefix. */
export function inferSubjectSlugForFormulaId(formulaId: string): string | null {
  const code = formulaId.trim().toUpperCase();
  if (code.startsWith('DIF-')) return 'calculo-diferencial';
  if (code.startsWith('INT-')) return 'calculo-ii';
  if (code.startsWith('ALG-')) return 'algebra';
  if (
    /^(DIV|REA|TRN|RLC|FAS|PAC|FIL|XFR|DIO|BJT|FET|OPA|LGC|CMB|SEQ|ADC)-/.test(code)
  ) {
    return 'fisica-electronica';
  }
  if (
    /^(VEC|CIN|MOV|NEW|CIR|TRA|ENE|MOM|ROT|EQU|GRA|FLU|OSC|OND|SON|TER|ELE|CON)-/.test(code)
  ) {
    return 'fisica-basica';
  }
  return null;
}
