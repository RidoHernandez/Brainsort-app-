import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class LinearSearchEngine implements SortEngine {
  name = 'Linear Search';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Para i = 0 hasta n - 1', indent: 0 },
      { line: 2, text: 'Si arreglo[i] == objetivo', indent: 1 },
      { line: 3, text: 'devolver i', indent: 2 },
      { line: 4, text: 'devolver -1', indent: 0 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const target = data[Math.floor(data.length / 2)] ?? data[0];
    const steps: SimulationStep[] = [];
    let stepCount = 1;

    for (let i = 0; i < data.length; i++) {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [i],
        estadoArray: [...data],
        lineaPseudocodigo: 2,
      });

      if (data[i] === target) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'final',
          indicesActivos: [i],
          estadoArray: [...data],
          lineaPseudocodigo: 3,
        });
        return steps;
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [...data],
      lineaPseudocodigo: 4,
    });
    return steps;
  }
}
