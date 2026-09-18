import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  hasCorruptLocalizedLatex,
  localizeCalculoDiferencialLatexText,
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
    assert.match(en, /\\text\{ or \}f\(a\)/);
    assert.equal(hasCorruptLocalizedLatex(en), false);
  });
});
