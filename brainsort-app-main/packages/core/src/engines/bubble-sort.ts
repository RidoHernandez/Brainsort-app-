import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class BubbleSortEngine implements SortEngine {
  name = 'Bubble Sort';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Para i = 0 hasta n-1', indent: 0 },
      { line: 2, text: 'Para j = 0 hasta n-i-1', indent: 1 },
      { line: 3, text: 'Si array[j] > array[j+1]', indent: 2 },
      { line: 4, text: 'Intercambiar array[j] y array[j+1]', indent: 3 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Line 3: SI arreglo[j] > arreglo[j+1]
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, j + 1],
          estadoArray: [...array],
          lineaPseudocodigo: 3,
        });

        if (array[j] > array[j + 1]) {
          // Line 4: INTERCAMBIAR(arreglo[j], arreglo[j+1])
          const temp = array[j];
          array[j] = array[j + 1];
          array[j + 1] = temp;

          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'intercambio',
            indicesActivos: [j, j + 1],
            estadoArray: [...array],
            lineaPseudocodigo: 4,
          });
        }
      }
    }

    // Paso final final para marcar todo como verde (finalizados)
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
