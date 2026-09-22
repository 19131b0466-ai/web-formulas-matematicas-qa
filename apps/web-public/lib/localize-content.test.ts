import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { localizeContent } from './localize-content';

describe('localizeContent (Física Electrónica)', () => {
  it('translates constraint strings from the phrase dictionary', async () => {
    const data = {
      constraints: [
        'NPN de señal salvo indicación; respetar la región (activa, corte, saturación).',
        'Lógica combinacional sin memoria; hazards dependen del retardo de puertas.',
        'Régimen sinusoidal permanente; fasores RMS salvo que se indique pico.',
      ],
    };
    const en = await localizeContent(data, 'en');
    assert.match(en.constraints[0]!, /Small-signal NPN/);
    assert.match(en.constraints[1]!, /Combinational logic/);
    assert.match(en.constraints[2]!, /Sinusoidal steady state/);
    const de = await localizeContent(data, 'de');
    assert.match(de.constraints[0]!, /NPN-Kleinsignal/);
  });

  it('translates common-error fragments, not only the joined line', async () => {
    const data = {
      commonErrors: [
        'confundir 0⁺ con 0⁻',
        'usar τ=L/R en un RC o τ=RC en un RL',
        'olvidar el valor de asentamiento',
      ],
    };
    const en = await localizeContent(data, 'en');
    assert.match(en.commonErrors[0]!, /confusing 0⁺ with 0⁻/i);
    assert.doesNotMatch(en.commonErrors.join(' '), /confundir/);
  });

  it('localizes CMB-009 without corrupting grupos', async () => {
    const data = { latex: 'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}' };
    const en = await localizeContent(data, 'en');
    assert.doesNotMatch(en.latex, /grupors|grupoders|grupous/);
    assert.match(en.latex, /\\text\{groups of \}/);
    const de = await localizeContent(data, 'de');
    assert.doesNotMatch(de.latex, /grupoders/);
    assert.match(de.latex, /\\text\{Gruppen von \}/);
  });

  it('translates worked examples and keeps \\tau', async () => {
    const data = {
      workedExample:
        'Con \\(x(0^+)=0\\), \\(x(\\infty)=10\\,\\mathrm V\\) y \\(\\tau=1\\,\\mathrm{ms}\\), \\(x(\\tau)=10(1-e^{-1})=6.32\\,\\mathrm V\\).',
    };
    const en = await localizeContent(data, 'en');
    assert.match(en.workedExample, /^With /);
    assert.match(en.workedExample, /\\tau/);
    assert.doesNotMatch(en.workedExample, / y /);
    const adc = await localizeContent(
      {
        workedExample:
          'Para un DAC R-2R de 3 bits, código \\(101\\) y \\(V_{\\mathrm{ref}}=8\\,\\mathrm V\\), \\(v_o=-8(1/2+1/8)=-5\\,\\mathrm V\\).',
      },
      'en',
    );
    assert.match(adc.workedExample, /^For a 3-bit R-2R DAC/);
  });
});
