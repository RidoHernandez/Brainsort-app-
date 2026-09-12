import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class PriorityQueueEngine implements SortEngine {
  name = 'Priority Queue';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'insertar(elemento, prioridad)', indent: 0 },
      { line: 2, text: 'subir hasta mantener prioridad', indent: 1 },
      { line: 3, text: 'extraerMax()', indent: 0 },
      { line: 4, text: 'remover raíz y reordenar heap', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const heap: number[] = [];
    const steps: SimulationStep[] = [];
    let stepCount = 1;

    const pushStep = (tipoOperacion: SimulationStep['tipoOperacion'], indicesActivos: number[], line: number) => {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion,
        indicesActivos,
        estadoArray: [...heap],
        lineaPseudocodigo: line,
      });
    };

    const siftUp = (index: number) => {
      let child = index;
      while (child > 0) {
        const parent = Math.floor((child - 1) / 2);
        pushStep('comparacion', [parent, child], 2);
        if (heap[parent] >= heap[child]) break;
        [heap[parent], heap[child]] = [heap[child], heap[parent]];
        pushStep('intercambio', [parent, child], 2);
        child = parent;
      }
    };

    const siftDown = (index: number) => {
      let parent = index;
      while (true) {
        const left = parent * 2 + 1;
        const right = parent * 2 + 2;
        let largest = parent;
        if (left < heap.length && heap[left] > heap[largest]) largest = left;
        if (right < heap.length && heap[right] > heap[largest]) largest = right;
        if (largest === parent) break;
        pushStep('comparacion', [parent, largest], 4);
        [heap[parent], heap[largest]] = [heap[largest], heap[parent]];
        pushStep('intercambio', [parent, largest], 4);
        parent = largest;
      }
    };

    data.forEach((value) => {
      heap.push(value);
      pushStep('insercion', [heap.length - 1], 1);
      siftUp(heap.length - 1);
    });

    while (heap.length > 0) {
      pushStep('intercambio', [0], 3);
      heap[0] = heap[heap.length - 1];
      heap.pop();
      if (heap.length > 0) siftDown(0);
    }

    pushStep('final', [], 4);
    return steps;
  }
}
