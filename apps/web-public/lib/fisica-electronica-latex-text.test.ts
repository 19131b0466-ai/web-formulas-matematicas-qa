import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { localizeFisicaElectronicaLatexText } from './fisica-electronica-latex-text';

describe('localizeFisicaElectronicaLatexText', () => {
  it('translates \\text{carga} and \\text{descarga}', () => {
    const latex = 'v_{\\text{carga}}=V(1-e^{-t/\\tau})\\quad v_{\\text{descarga}}=Ve^{-t/\\tau}';
    const en = localizeFisicaElectronicaLatexText(latex, 'en');
    assert.match(en, /\\text\{charge\}/);
    assert.match(en, /\\text\{discharge\}/);
  });

  it('leaves Spanish unchanged', () => {
    const latex = '\\text{fasor}';
    assert.equal(localizeFisicaElectronicaLatexText(latex, 'es'), latex);
  });

  it('localizes CMB-009 Karnaugh groups without corrupting the word', () => {
    const latex = 'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}';
    const en = localizeFisicaElectronicaLatexText(latex, 'en');
    assert.match(en, /\\text\{groups of \}/);
    assert.match(en, /\\text\{ cells\}/);
    assert.doesNotMatch(en, /grupors|grupoders|grupous|grupos de/);
    const de = localizeFisicaElectronicaLatexText(latex, 'de');
    assert.match(de, /\\text\{Gruppen von \}/);
    const fr = localizeFisicaElectronicaLatexText(latex, 'fr');
    assert.match(fr, /\\text\{groupes de \}/);
    const pt = localizeFisicaElectronicaLatexText(latex, 'pt');
    assert.match(pt, /\\text\{ células\}/);
    assert.doesNotMatch(pt, /\\text\{ celdas\}/);
  });

  it('localizes \\mathrm switch regions and \\operatorname{índice}', () => {
    const bjt =
      '\\mathrm{estado}=\\begin{cases}\\mathrm{corte}&I_B=0\\\\\\mathrm{saturación}&I_B\\ge I_C/\\beta_f\\end{cases}';
    const enBjt = localizeFisicaElectronicaLatexText(bjt, 'en');
    assert.match(enBjt, /\\mathrm\{state\}/);
    assert.match(enBjt, /\\mathrm\{cutoff\}/);
    assert.match(enBjt, /\\mathrm\{saturation\}/);
    const enc = localizeFisicaElectronicaLatexText('\\operatorname{índice}(D_i=1)', 'en');
    assert.match(enc, /\\operatorname\{index\}/);
    assert.doesNotMatch(enc, /índice/);
  });
});
