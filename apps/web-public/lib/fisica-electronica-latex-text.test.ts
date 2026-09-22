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
});
