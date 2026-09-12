import { AlgorithmDefinition, SimulationStep } from './engine.interface';

/**
 * Stack Engine
 * Simula operaciones de push (inserción) y pop (extracción) en una pila.
 * El arreglo de entrada se usa como secuencia de operaciones:
 *   - Valores positivos → PUSH
 *   - Valores negativos → POP (|valor| es un marcador para la visualización)
 * Si todos son positivos, se hace push de cada elemento y luego pop de todos.
 */
export const Stack: AlgorithmDefinition = {
  meta: {
    nombre: 'Stack',
    descripcion:
      'Estructura de datos LIFO (Last In, First Out). El último elemento insertado es el primero en salir. Operaciones principales: push (insertar) y pop (extraer).',
    complejidadTiempo: 'O(1)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasLineales',
  },
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
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [stack.length - 1],
        estadoArray: [...stack],
        lineaPseudocodigo: 3,
      });
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
  },
};
