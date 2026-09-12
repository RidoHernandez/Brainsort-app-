import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class MergeSortEngine implements SortEngine {
  name = 'Merge Sort';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'Si izquierda < derecha', indent: 0 },
      { line: 2, text: 'mitad = piso((izquierda + derecha) / 2)', indent: 1 },
      { line: 3, text: 'MergeSort(arreglo, izquierda, mitad)', indent: 1 },
      { line: 4, text: 'MergeSort(arreglo, mitad+1, derecha)', indent: 1 },
      { line: 5, text: 'Merge(arreglo, izquierda, mitad, derecha)', indent: 1 },
      { line: 6, text: 'Copiar elementos a L y R', indent: 2 },
      { line: 7, text: 'Mientras i < n1 y j < n2', indent: 2 },
      { line: 8, text: 'Comparar y colocar menor en arreglo[k]', indent: 3 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const n1 = mid - left + 1;
      const n2 = right - mid;

      const L = new Array(n1);
      const R = new Array(n2);

      for (let i = 0; i < n1; i++) L[i] = arr[left + i];
      for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

      let i = 0, j = 0;
      let k = left;

      while (i < n1 && j < n2) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [left + i, mid + 1 + j],
          estadoArray: [...arr],
          lineaPseudocodigo: 7, 
        });

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8, 
        });
        k++;
      }

      while (i < n1) {
        arr[k] = L[i];
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8, 
        });
        i++;
        k++;
      }

      while (j < n2) {
        arr[k] = R[j];
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8,
        });
        j++;
        k++;
      }
    };

    const mergeSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
      }
    };

    mergeSort(array, 0, n - 1);

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: Array.from({ length: n }, (_, index) => index),
      estadoArray: [...array],
      lineaPseudocodigo: 1,
    });

    return steps;
  }
}
