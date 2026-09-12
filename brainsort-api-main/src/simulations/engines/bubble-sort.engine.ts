import { AlgorithmDefinition, SimulationStep } from './engine.interface';

const MAX_ITERATIONS = 10000;

export const BubbleSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Bubble Sort',
    descripcion:
      'Algoritmo de ordenamiento que compara pares adyacentes e intercambia si están desordenados, haciendo que los valores mayores "burbujeen" hacia el final.',
    complejidadTiempo: 'O(n²)',
    complejidadEspacio: 'O(1)',
    categoria: 'Ordenamiento',
  },
  /**
   * Ejecuta el ordenamiento sobre una copia del arreglo, generando una traza
   * inmutable de cada paso para conformar la simulación gráfica del UI.
   * Cuenta con un cortafuegos (MAX_ITERATIONS) para protección de ciclos en Edge cases.
   */
  execute(data: number[]): SimulationStep[] {
    const array = [...data];
    const n = array.length;
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    let iterations = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
          throw new Error('Timeout: Maximum iteration limit reached in engine');
        }

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, j + 1],
          estadoArray: [...array],
          lineaPseudocodigo: 3,
        });

        if (array[j] > array[j + 1]) {
          const temp = array[j];
          array[j] = array[j + 1];
          array[j + 1] = temp;

          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'intercambio',
            indicesActivos: [j, j + 1],
            estadoArray: [...array],
            lineaPseudocodigo: 4,
          });
        }
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [...array],
      lineaPseudocodigo: 1,
    });

    return steps;
  },
};
