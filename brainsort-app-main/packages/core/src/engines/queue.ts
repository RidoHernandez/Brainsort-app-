import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class QueueEngine implements SortEngine {
  name = 'Queue';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure Queue(data[]):', indent: 0 },
      { line: 2, text: 'enqueue(valor) ← insertar al TAIL', indent: 1 },
      { line: 3, text: 'peek()         ← inspeccionar HEAD', indent: 1 },
      { line: 4, text: '── Fase DEQUEUE ──', indent: 0 },
      { line: 5, text: 'dequeue()      ← extraer del HEAD', indent: 1 },
      { line: 6, text: 'actualizar puntero HEAD', indent: 1 },
      { line: 7, text: 'Queue vacía → FIN', indent: 0 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const queue: number[] = [];

    // Fase 1: ENQUEUE de todos los elementos
    for (let i = 0; i < data.length; i++) {
      queue.push(data[i]);
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'insercion',
        indicesActivos: [queue.length - 1], // tail
        estadoArray: [...queue],
        lineaPseudocodigo: 2,
      });
    }

    // Paso intermedio: mostrar frente de la cola
    if (queue.length > 0) {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [0], // head
        estadoArray: [...queue],
        lineaPseudocodigo: 3,
      });
    }

    // Fase 2: DEQUEUE de todos los elementos
    while (queue.length > 0) {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'intercambio',
        indicesActivos: [0],
        estadoArray: [...queue],
        lineaPseudocodigo: 5,
      });
      queue.shift(); // extrae el frente
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: queue.length > 0 ? [0] : [],
        estadoArray: [...queue],
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
