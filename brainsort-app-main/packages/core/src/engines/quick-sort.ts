import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class QuickSortEngine implements SortEngine {
  name = 'Quick Sort';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Si low < high', indent: 0 },
      { line: 2, text: 'pivotIndex = particionar(arreglo, low, high)', indent: 1 },
      { line: 3, text: 'QuickSort(arreglo, low, pivotIndex - 1)', indent: 1 },
      { line: 4, text: 'QuickSort(arreglo, pivotIndex + 1, high)', indent: 1 },
      { line: 5, text: 'Comparar arreglo[j] con pivote', indent: 2 },
      { line: 6, text: 'Intercambiar menores hacia la izquierda', indent: 2 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const array = [...data];
    const steps: SimulationStep[] = [];
    let stepCount = 1;

    const push = (tipoOperacion: SimulationStep['tipoOperacion'], indicesActivos: number[], lineaPseudocodigo: number) => {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion,
        indicesActivos,
        estadoArray: [...array],
        lineaPseudocodigo,
      });
    };

    const partition = (low: number, high: number) => {
      const pivot = array[high];
      let i = low - 1;

      for (let j = low; j < high; j++) {
        push('comparacion', [j, high], 5);
        if (array[j] <= pivot) {
          i++;
          [array[i], array[j]] = [array[j], array[i]];
          push('intercambio', [i, j], 6);
        }
      }

      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      push('intercambio', [i + 1, high], 2);
      return i + 1;
    };

    const quickSort = (low: number, high: number) => {
      if (low < high) {
        const pivotIndex = partition(low, high);
        quickSort(low, pivotIndex - 1);
        quickSort(pivotIndex + 1, high);
      }
    };

    quickSort(0, array.length - 1);
    push('final', Array.from({ length: array.length }, (_, index) => index), 1);

    return steps;
  }
}
