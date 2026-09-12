import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class LinkedListEngine implements SortEngine {
  name = 'Linked List';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure LinkedList(data[]):', indent: 0 },
      { line: 2, text: 'prepend(valor) ← insertar nuevo HEAD', indent: 1 },
      { line: 3, text: 'nuevo.next = anteriorHead', indent: 2 },
      { line: 4, text: '── Fase TRAVERSAL ──', indent: 0 },
      { line: 5, text: 'current = HEAD; visitar nodo', indent: 1 },
      { line: 6, text: 'current = current.next → FIN', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const list: number[] = [];

    // Fase 1: INSERT AT HEAD de todos los elementos
    for (let i = 0; i < data.length; i++) {
      list.unshift(data[i]); // insertar al inicio
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'insercion',
        indicesActivos: [0], // índice 0 = nuevo head
        estadoArray: [...list],
        lineaPseudocodigo: 2,
      });

      // Mostrar que el puntero 'next' del nuevo nodo apunta al anterior head
      if (list.length > 1) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [0, 1], // nuevo head → siguiente
          estadoArray: [...list],
          lineaPseudocodigo: 3,
        });
      }
    }

    // Fase 2: TRAVERSAL (recorrido completo)
    for (let i = 0; i < list.length; i++) {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [i],
        estadoArray: [...list],
        lineaPseudocodigo: 5,
      });
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [...list],
      lineaPseudocodigo: 6,
    });

    return steps;
  }
}
