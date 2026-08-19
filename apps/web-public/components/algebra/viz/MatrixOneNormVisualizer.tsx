'use client';

import { MatrixOrientedNormVisualizer } from './MatrixOrientedNormVisualizer';

const ONE_GUIDE = {
  idea: 'Vas a ver que la norma 1 de una matriz es la mayor suma absoluta de sus columnas.',
  tryIt: 'Edita las entradas de A y observa cómo cambia la suma de cada columna. La columna con mayor suma determina ‖A‖₁.',
};

const INF_GUIDE = {
  idea: 'Vas a ver que la norma infinito de una matriz es la mayor suma absoluta de sus filas.',
  tryIt: 'Edita las entradas de A y observa cómo cambia la suma de cada fila. La fila con mayor suma determina ‖A‖∞.',
};

export function MatrixOneNormVisualizer() {
  return (
    <MatrixOrientedNormVisualizer
      orientation="columns"
      guideIdea={ONE_GUIDE.idea}
      guideTryIt={ONE_GUIDE.tryIt}
    />
  );
}

export function InfinityMatrixNormVisualizer() {
  return (
    <MatrixOrientedNormVisualizer
      orientation="rows"
      guideIdea={INF_GUIDE.idea}
      guideTryIt={INF_GUIDE.tryIt}
    />
  );
}
