import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class DequeEngine implements SortEngine {
  name = 'Deque';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'pushFront(valor): insertar al inicio', indent: 0 },
      { line: 2, text: 'pushBack(valor): insertar al final', indent: 0 },
      { line: 3, text: 'popFront(): remover del inicio', indent: 0 },
      { line: 4, text: 'popBack(): remover del final', indent: 0 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const deque: number[] = [];
    const steps: SimulationStep[] = [];
    let stepCount = 1;

    data.forEach((value, index) => {
      if (index % 2 === 0) {
        deque.unshift(value);
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [0],
          estadoArray: [...deque],
          lineaPseudocodigo: 1,
        });
      } else {
        deque.push(value);
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [deque.length - 1],
          estadoArray: [...deque],
          lineaPseudocodigo: 2,
        });
      }
    });

    while (deque.length > 0) {
      const fromFront = deque.length % 2 === 0;
      const activeIndex = fromFront ? 0 : deque.length - 1;
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'intercambio',
        indicesActivos: [activeIndex],
        estadoArray: [...deque],
        lineaPseudocodigo: fromFront ? 3 : 4,
      });
      if (fromFront) deque.shift();
      else deque.pop();
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [],
      lineaPseudocodigo: 4,
    });
    return steps;
  }
}
