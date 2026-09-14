import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  absorbEditorialLine,
  absorbFaqLine,
  absorbUnitLine,
  createEditorialDraft,
  createFaqAccumulator,
} from './formula-meta.js';

describe('formula-meta', () => {
  it('parses FAQ question and answer pairs', () => {
    const acc = createFaqAccumulator();
    assert.equal(absorbFaqLine(acc, '**Pregunta:** ¿Cuál es la fórmula?'), true);
    assert.equal(absorbFaqLine(acc, '**Respuesta:** Y = σ/ε'), true);
    assert.equal(acc.items.length, 1);
    assert.equal(acc.items[0]!.question, '¿Cuál es la fórmula?');
    assert.equal(acc.items[0]!.answer, 'Y = σ/ε');
  });

  it('parses unit lines into conventions', () => {
    const conventions: string[] = [];
    assert.equal(absorbUnitLine(conventions, '**Unidad:** Pa = N/m²'), true);
    assert.deepEqual(conventions, ['Pa = N/m²']);
  });

  it('parses editorial metadata fields', () => {
    const draft = createEditorialDraft();
    assert.equal(absorbEditorialLine(draft, '**Derivación:** Sustituyendo σ=F/A'), true);
    assert.equal(absorbEditorialLine(draft, '**Notaciones equivalentes:** módulo de Young; E'), true);
    assert.equal(draft.derivation?.includes('σ'), true);
    assert.deepEqual(draft.equivalentNotations, ['módulo de Young', 'E']);
  });

  it('parses search alias lines', () => {
    const draft = createEditorialDraft();
    assert.equal(
      absorbEditorialLine(draft, '**Alias de búsqueda:** Young modulus formula; módulo de Young fórmula'),
      true,
    );
    assert.deepEqual(draft.searchAliases, ['Young modulus formula', 'módulo de Young fórmula']);
  });
});
