import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class StackEngine implements SortEngine {
  name = 'Stack';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure Stack(data[]):', indent: 0 },
      { line: 2, text: 'push(valor)  ← insertar en el TOP', indent: 1 },
      { line: 3, text: 'peek()       ← inspeccionar TOP sin extraer', indent: 1 },
      { line: 4, text: '── Fase POP ──', indent: 0 },
      { line: 5, text: 'pop()        ← extraer el TOP', indent: 1 },
      { line: 6, text: 'actualizar puntero TOP', indent: 1 },
      { line: 7, text: 'Stack vacío → FIN', indent: 0 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const stack: number[] = [];

    // Fase 1: PUSH de todos los elementos
    for (let i = 0; i < data.length; i++) {
      stack.push(data[i]);
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'insercion',
        indicesActivos: [stack.length - 1],
        estadoArray: [...stack],
        lineaPseudocodigo: 2,
      });
    }

    // Paso intermedio: marcar el top actual
    if (stack.length > 0) {
      steps.push({
        numeroPao: stepCount++, // Let's match the type property "numeroPaso"
        numeroPaso: stepCount - 1,
        tipoOperacion: 'comparacion',
        indicesActivos: [stack.length - 1],
        estadoArray: [...stack],
        lineaPseudocodigo: 3,
      } as any);
    }

    // Fase 2: POP de todos los elementos
    while (stack.length > 0) {
      const top = stack.length - 1;
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'intercambio',
        indicesActivos: [top],
        estadoArray: [...stack],
        lineaPseudocodigo: 5,
      });
      stack.pop();
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [],
        estadoArray: [...stack],
        lineaPseudocodigo: 6,
      });
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [],
      lineaPseudocodigo: 7,
    });

    return steps;
  }
}
