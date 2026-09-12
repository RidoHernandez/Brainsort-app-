import { AlgorithmDefinition, SimulationStep } from './engine.interface';

/**
 * Queue Engine
 * Simula operaciones de enqueue (inserción al final) y dequeue (extracción del frente).
 * El arreglo de entrada representa los valores a encolar.
 * El engine ejecuta enqueue de todos y luego dequeue de todos.
 */
export const Queue: AlgorithmDefinition = {
  meta: {
    nombre: 'Queue',
    descripcion:
      'Estructura de datos FIFO (First In, First Out). El primer elemento insertado es el primero en salir. Operaciones principales: enqueue (insertar al final) y dequeue (extraer del frente).',
    complejidadTiempo: 'O(1)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasLineales',
  },
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
        indicesActivos: [queue.length - 1], // índice del elemento recién encolado (tail)
        estadoArray: [...queue],
        lineaPseudocodigo: 2,
      });
    }

    // Paso intermedio: mostrar frente de la cola
    if (queue.length > 0) {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [0], // frente (head)
        estadoArray: [...queue],
        lineaPseudocodigo: 3,
      });
    }

    // Fase 2: DEQUEUE de todos los elementos
    while (queue.length > 0) {
      // Señalar el frente que va a salir
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
  },
};
