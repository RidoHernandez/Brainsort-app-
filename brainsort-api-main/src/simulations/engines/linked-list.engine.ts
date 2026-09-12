import { AlgorithmDefinition, SimulationStep } from './engine.interface';

/**
 * Linked List Engine
 * Simula inserción al inicio (prepend) y recorrido (traversal) de una lista enlazada.
 * El arreglo de entrada representa valores a insertar.
 * El engine hace insert-at-head de cada elemento y luego traversal.
 */
export const LinkedList: AlgorithmDefinition = {
  meta: {
    nombre: 'Linked List',
    descripcion:
      'Estructura de datos lineal donde cada nodo contiene un valor y un puntero al siguiente nodo. Permite inserción y eliminación eficiente en cualquier posición.',
    complejidadTiempo: 'O(n)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasLineales',
  },
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
  },
};
