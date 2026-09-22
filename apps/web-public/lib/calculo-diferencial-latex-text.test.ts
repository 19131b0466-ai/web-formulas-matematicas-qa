import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasCorruptLocalizedLatex,
  localizeCalculoDiferencialLatexText,
  localizeCalculoDiferencialVariables,
  CALCULUS_DIFF_VARIABLE_MEANINGS,
} from './calculo-diferencial-latex-text';

const DIF096 =
  "f''(c)=0\\text{ o no existe, y }f''\\text{ cambia de signo en }c \\Rightarrow (c,f(c))\\text{ punto de inflexión}";

const DIF103 = "f(x)\\approx f(a)+f'(a)(x-a)\\quad\\text{cuando }x\\approx a";

const DIF032 =
  '\\text{Discontinuidad removible en }a:\\ \\lim_{x\\to a}f(x)=L\\neq f(a)\\ \\text{ o }f(a)\\text{ no definido}';

describe('localizeCalculoDiferencialLatexText', () => {
  it('does not corrupt inflection point text (DIF-096)', () => {
    for (const locale of ['en', 'de', 'fr', 'it', 'pt'] as const) {
      const out = localizeCalculoDiferencialLatexText(DIF096, locale);
      assert.equal(hasCorruptLocalizedLatex(out), false);
      assert.match(out, /inflex|inflection|fless|inflexão|Wendepunkt/i);
    }
  });

  it('translates cuando in DIF-103', () => {
    assert.match(localizeCalculoDiferencialLatexText(DIF103, 'en'), /\\text\{when \}/);
    assert.match(localizeCalculoDiferencialLatexText(DIF103, 'de'), /\\text\{wenn \}/);
    assert.match(localizeCalculoDiferencialLatexText(DIF103, 'es'), /\\text\{cuando \}/);
  });

  it('keeps spacing before f(a) in DIF-032', () => {
    const en = localizeCalculoDiferencialLatexText(DIF032, 'en');
    assert.match(en, /\\text\{ or \}\\,f\(a\)/);
    assert.equal(hasCorruptLocalizedLatex(en), false);
  });

  it('keeps leading space so DIF-126 is not glued to x=a', () => {
    const latex =
      'x=a\\text{ asíntota vertical de }f \\Leftrightarrow \\lim_{x\\to a^+}f(x)=\\pm\\infty\\ \\text{o}\\ \\lim_{x\\to a^-}f(x)=\\pm\\infty';
    const en = localizeCalculoDiferencialLatexText(latex, 'en');
    assert.match(en, /\\text\{ is a vertical asymptote of \}/);
    assert.doesNotMatch(en, /a\\text\{vertical/);
    assert.doesNotMatch(en, /a\\text\{is a vertical/);
    const de = localizeCalculoDiferencialLatexText(latex, 'de');
    assert.match(de, /\\text\{ ist eine vertikale Asymptote von \}/);
  });

  it('translates isolated o in DIF-091', () => {
    const latex = "f'(c)=0\\ \\text{o}\\ f'(c)\\text{ no existe}";
    const en = localizeCalculoDiferencialLatexText(latex, 'en');
    assert.match(en, /\\text\{or\}/);
    assert.doesNotMatch(en, /\\text\{o\}/);
  });

  it('uses in a punctured neighborhood in DIF-114 (EN)', () => {
    const latex =
      "\\lim_{x\\to a}\\frac{f(x)}{g(x)}=\\lim_{x\\to a}\\frac{f'(x)}{g'(x)},\\qquad f,g\\text{ derivables en un entorno perforado de }a";
    const en = localizeCalculoDiferencialLatexText(latex, 'en');
    assert.match(en, /differentiable in a punctured neighborhood of/);
    assert.doesNotMatch(en, /on to neighborhood/);
  });

  it('translates o in DIF-116 indeterminate form', () => {
    const latex = '0\\cdot\\infty:\\quad f\\cdot g=\\frac{f}{1/g}\\ \\text{o}\\ \\frac{g}{1/f}';
    const en = localizeCalculoDiferencialLatexText(latex, 'en');
    assert.match(en, /\\text\{or\}/);
    assert.doesNotMatch(en, /\\text\{o\}/);
  });

  it('does not splice o inside grupos (CMB-009)', () => {
    const latex = 'F_{\\min}=\\sum\\text{grupos de }2^m\\text{ celdas}';
    for (const locale of ['en', 'de', 'fr', 'it', 'pt'] as const) {
      const out = localizeCalculoDiferencialLatexText(latex, locale);
      assert.doesNotMatch(out, /grupors|grupoders|grupous/);
      assert.match(out, /\\text\{grupos de \}/);
    }
  });
});

const SYMBOL_MEANINGS = [
  'Variable independiente',
  'Tiempo (interpretación física)',
  'Posición o longitud de arco',
  'Velocidad o función auxiliar',
  'Punto o constante real',
  'Extremo de intervalo o constante',
  'Punto intermedio (TVM, Rolle)',
  'Incremento en la definición de derivada',
  'Función',
  'Segunda función o composición interna',
  "Derivada de \\(f\\)",
  "Segunda derivada de \\(f\\)",
  'Orden de derivada o exponente',
  'Constante real',
  'Radio en definición ε-δ',
  'Tolerancia en definición ε-δ',
  'Valor del límite',
  'Variable auxiliar (cadena, sustitución)',
  'Variable dependiente',
  'Diferencial de \\(y\\)',
  'Diferencial de \\(x\\)',
  'Diferencial de \\(u\\)',
  'Ángulo o parámetro',
  'Constante pi',
  'Base del logaritmo natural',
  'Logaritmo natural',
];

describe('localizeCalculoDiferencialVariables', () => {
  it('covers every Cálculo Diferencial symbol meaning', () => {
    for (const meaning of SYMBOL_MEANINGS) {
      assert.ok(CALCULUS_DIFF_VARIABLE_MEANINGS[meaning]?.en, `missing EN map for ${meaning}`);
      assert.ok(CALCULUS_DIFF_VARIABLE_MEANINGS[meaning]?.it, `missing IT map for ${meaning}`);
    }
  });

  it('translates QA residual glosses in EN and IT', () => {
    const raw =
      '\\(b\\): Extremo de intervalo o constante; \\(\\delta\\): Radio en definición ε-δ; \\(h\\): Incremento en la definición de derivada; \\(\\pi\\): Constante pi; \\(t\\): Tiempo (interpretación física); \\(s\\): Posición o longitud de arco; \\(v\\): Velocidad o función auxiliar; \\(c\\): Punto intermedio (TVM, Rolle); \\(e\\): Base del logaritmo natural';
    const en = localizeCalculoDiferencialVariables(raw, 'en');
    assert.match(en, /Interval endpoint or constant/);
    assert.match(en, /Radius in the ε-δ definition/);
    assert.match(en, /Increment in the derivative definition/);
    assert.match(en, /Pi constant/);
    assert.match(en, /Time \(physical interpretation\)/);
    assert.match(en, /Position or arc length/);
    assert.match(en, /Velocity or auxiliary function/);
    assert.match(en, /Intermediate point \(MVT, Rolle\)/);
    assert.match(en, /Base of the natural logarithm/);
    assert.doesNotMatch(en, /Extremo de intervalo/);

    const it = localizeCalculoDiferencialVariables(raw, 'it');
    assert.match(it, /teorema del valore medio/);
    assert.match(it, /Base del logaritmo naturale/);
    assert.doesNotMatch(it, /Punto intermedio \(TVM, Rolle\)/);
    assert.doesNotMatch(it, /Base del logaritmo natural;/);
  });

  it('falls back to content-i18n dictionary', () => {
    const out = localizeCalculoDiferencialVariables('\\(z\\): Glosa inventada', 'en', {
      'Glosa inventada': 'Invented gloss',
    });
    assert.equal(out, '\\(z\\): Invented gloss');
  });
});
