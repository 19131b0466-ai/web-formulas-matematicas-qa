import { describe, expect, it } from 'vitest';
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
    expect(absorbFaqLine(acc, '**Pregunta:** ¿Cuál es la fórmula?')).toBe(true);
    expect(absorbFaqLine(acc, '**Respuesta:** Y = σ/ε')).toBe(true);
    expect(acc.items).toHaveLength(1);
    expect(acc.items[0]!.question).toBe('¿Cuál es la fórmula?');
    expect(acc.items[0]!.answer).toBe('Y = σ/ε');
  });

  it('parses unit lines into conventions', () => {
    const conventions: string[] = [];
    expect(absorbUnitLine(conventions, '**Unidad:** Pa = N/m²')).toBe(true);
    expect(conventions).toEqual(['Pa = N/m²']);
  });

  it('parses editorial metadata fields', () => {
    const draft = createEditorialDraft();
    expect(absorbEditorialLine(draft, '**Derivación:** Sustituyendo σ=F/A')).toBe(true);
    expect(absorbEditorialLine(draft, '**Notaciones equivalentes:** módulo de Young; E')).toBe(true);
    expect(draft.derivation?.includes('σ')).toBe(true);
    expect(draft.equivalentNotations).toEqual(['módulo de Young', 'E']);
  });

  it('parses search alias lines', () => {
    const draft = createEditorialDraft();
    expect(
      absorbEditorialLine(draft, '**Alias de búsqueda:** Young modulus formula; módulo de Young fórmula'),
    ).toBe(true);
    expect(draft.searchAliases).toEqual(['Young modulus formula', 'módulo de Young fórmula']);
  });

  it('parses common error lines', () => {
    const draft = createEditorialDraft();
    expect(
      absorbEditorialLine(
        draft,
        '**Errores comunes:** olvidar la carga del divisor; mezclar RMS con pico',
      ),
    ).toBe(true);
    expect(draft.commonErrors).toEqual([
      'olvidar la carga del divisor',
      'mezclar RMS con pico',
    ]);
  });

  it('does not split common errors on |S| bars', () => {
    const draft = createEditorialDraft();
    expect(
      absorbEditorialLine(
        draft,
        '**Errores comunes:** tomar |S| como P; olvidar el factor cos θ; aplicar resonancia serie a un paralelo',
      ),
    ).toBe(true);
    expect(draft.commonErrors).toEqual([
      'tomar |S| como P',
      'olvidar el factor cos θ',
      'aplicar resonancia serie a un paralelo',
    ]);
  });
});
