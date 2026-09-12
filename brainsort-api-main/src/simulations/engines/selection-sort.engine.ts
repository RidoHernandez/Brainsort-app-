import { AlgorithmDefinition, SimulationStep } from './engine.interface';

const MAX_ITERATIONS = 10000;

export const SelectionSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Selection Sort',
    descripcion:
      'Algoritmo que divide la lista en una parte ordenada y otra desordenada, encontrando siempre el mínimo elemento de la parte desordenada.',
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
      let minIndex = i;

      for (let j = i + 1; j < n; j++) {
        iterations++;
        if (iterations > MAX_ITERATIONS) {
          throw new Error('Timeout: Maximum iteration limit reached in engine');
        }

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, minIndex],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });

        if (array[j] < array[minIndex]) {
          minIndex = j;
        }
      }

      if (minIndex !== i) {
        const temp = array[i];
        array[i] = array[minIndex];
        array[minIndex] = temp;

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'intercambio',
          indicesActivos: [i, minIndex],
          estadoArray: [...array],
          lineaPseudocodigo: 6,
        });
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
