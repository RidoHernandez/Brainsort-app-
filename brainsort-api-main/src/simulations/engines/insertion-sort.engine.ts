import { AlgorithmDefinition, SimulationStep } from './engine.interface';

const MAX_ITERATIONS = 10000;

export const InsertionSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Insertion Sort',
    descripcion:
      'Algoritmo que construye el arreglo ordenado de uno en uno, insertando cada elemento en su posición correcta dentro de la sublista ya ordenada.',
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

    for (let i = 1; i < n; i++) {
      const key = array[i];
      let j = i - 1;

      while (j >= 0) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
          throw new Error('Timeout: Maximum iteration limit reached in engine');
        }

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, j + 1],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });

        if (array[j] > key) {
          array[j + 1] = array[j];

          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'insercion',
            indicesActivos: [j, j + 1],
            estadoArray: [...array],
            lineaPseudocodigo: 5,
          });
          j = j - 1;
        } else {
          break;
        }
      }

      array[j + 1] = key;
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'insercion',
        indicesActivos: [j + 1],
        estadoArray: [...array],
        lineaPseudocodigo: 7,
      });
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
