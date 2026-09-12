import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class HeapSortEngine implements SortEngine {
  name = 'Heap Sort';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Construir max-heap', indent: 0 },
      { line: 2, text: 'Para fin = n-1 hasta 1', indent: 0 },
      { line: 3, text: 'Intercambiar arreglo[0] con arreglo[fin]', indent: 1 },
      { line: 4, text: 'heapify(arreglo, 0, fin)', indent: 1 },
      { line: 5, text: 'Comparar nodo con sus hijos', indent: 2 },
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

    const heapify = (heapSize: number, root: number) => {
      let largest = root;
      const left = root * 2 + 1;
      const right = root * 2 + 2;

      if (left < heapSize) {
        push('comparacion', [largest, left], 5);
        if (array[left] > array[largest]) largest = left;
      }

      if (right < heapSize) {
        push('comparacion', [largest, right], 5);
        if (array[right] > array[largest]) largest = right;
      }

      if (largest !== root) {
        [array[root], array[largest]] = [array[largest], array[root]];
        push('intercambio', [root, largest], 4);
        heapify(heapSize, largest);
      }
    };

    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--) {
      heapify(array.length, i);
    }

    for (let end = array.length - 1; end > 0; end--) {
      [array[0], array[end]] = [array[end], array[0]];
      push('intercambio', [0, end], 3);
      heapify(end, 0);
    }

    push('final', Array.from({ length: array.length }, (_, index) => index), 1);
    return steps;
  }
}
