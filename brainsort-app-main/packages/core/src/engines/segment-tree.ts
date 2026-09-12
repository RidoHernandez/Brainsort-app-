import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class SegmentTreeEngine implements SortEngine {
  name = 'Segment Tree';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'build(nodo, inicio, fin)', indent: 0 },
      { line: 2, text: 'Si inicio == fin: tree[nodo] = arreglo[inicio]', indent: 1 },
      { line: 3, text: 'mid = piso((inicio + fin) / 2)', indent: 1 },
      { line: 4, text: 'build(2*nodo, inicio, mid)', indent: 1 },
      { line: 5, text: 'build(2*nodo+1, mid+1, fin)', indent: 1 },
      { line: 6, text: 'tree[nodo] = tree[2*nodo] + tree[2*nodo+1]', indent: 1 },
      { line: 7, text: 'query(nodo, inicio, fin, l, r)', indent: 0 },
      { line: 8, text: 'Si el rango encaja: devolver tree[nodo]', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const n = data.length;
    const tree = new Array(Math.max(1, n * 4)).fill(0);
    const steps: SimulationStep[] = [];
    let stepCount = 1;

    const visibleTree = () => tree.slice(1, Math.min(tree.length, n * 2));
    const push = (tipoOperacion: SimulationStep['tipoOperacion'], indicesActivos: number[], line: number) => {
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion,
        indicesActivos,
        estadoArray: visibleTree(),
        lineaPseudocodigo: line,
      });
    };

    const build = (node: number, left: number, right: number) => {
      push('comparacion', [node - 1], 1);
      if (left === right) {
        tree[node] = data[left];
        push('insercion', [node - 1], 2);
        return;
      }

      const mid = Math.floor((left + right) / 2);
      build(node * 2, left, mid);
      build(node * 2 + 1, mid + 1, right);
      tree[node] = tree[node * 2] + tree[node * 2 + 1];
      push('insercion', [node - 1, node * 2 - 1, node * 2], 6);
    };

    build(1, 0, n - 1);
    push('final', [0], 8);
    return steps;
  }
}
