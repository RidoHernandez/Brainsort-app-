import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class SelectionSortEngine implements SortEngine {
  name = 'Selection Sort';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Para i = 0 hasta n-1', indent: 0 },
      { line: 2, text: 'minIdx = i', indent: 1 },
      { line: 3, text: 'Para j = i+1 hasta n', indent: 1 },
      { line: 4, text: 'Si arreglo[j] < arreglo[minIdx]', indent: 2 },
      { line: 5, text: 'minIdx = j', indent: 3 },
      { line: 6, text: 'Intercambiar arreglo[i] y arreglo[minIdx]', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        // Line 4: SI arreglo[j] < arreglo[minIdx]
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, minIdx],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });

        if (array[j] < array[minIdx]) {
          // Line 5: minIdx = j
          minIdx = j;
        }
      }

      // Line 6: INTERCAMBIAR(arreglo[i], arreglo[minIdx])
      if (minIdx !== i) {
        const temp = array[i];
        array[i] = array[minIdx];
        array[minIdx] = temp;

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'intercambio',
          indicesActivos: [i, minIdx],
          estadoArray: [...array],
          lineaPseudocodigo: 6,
        });
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: Array.from({ length: n }, (_, index) => index),
      estadoArray: [...array],
      lineaPseudocodigo: 1,
    });

    return steps;
  }
}
