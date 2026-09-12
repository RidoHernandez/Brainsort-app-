import {
  AlgorithmDefinition,
  SimulationMarker,
  SimulationStep,
  SimulationTreeNode,
} from './engine.interface';

type Op = SimulationStep['tipoOperacion'];

function createStep(
  numeroPaso: number,
  tipoOperacion: Op,
  indicesActivos: number[],
  estadoArray: number[],
  lineaPseudocodigo: number,
  waitingIndices: number[] = [],
  markers: SimulationMarker[] = [],
): SimulationStep {
  return {
    numeroPaso,
    tipoOperacion,
    indicesActivos,
    estadoArray: [...estadoArray],
    lineaPseudocodigo,
    contexto: waitingIndices.length > 0 ? { waitingIndices } : undefined,
    marcadores: markers.length > 0 ? markers : undefined,
  };
}

function flattenRanges(ranges: Array<[number, number]>): number[] {
  const indices = new Set<number>();
  ranges.forEach(([start, end]) => {
    for (let index = start; index <= end; index++) {
      indices.add(index);
    }
  });
  return [...indices];
}

function rangeIndices(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export const MergeSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Merge Sort',
    descripcion: 'Divide el arreglo, ordena mitades y combina resultados.',
    complejidadTiempo: 'O(n log n)',
    complejidadEspacio: 'O(n)',
    categoria: 'Ordenamiento',
  },
  execute(data: number[]): SimulationStep[] {
    const array = [...data];
    const steps: SimulationStep[] = [];
    let step = 1;
    const recursionStack: Array<[number, number]> = [];
    const waiting = () => flattenRanges(recursionStack.slice(0, -1));
    const rangeMarkers = (
      left: number,
      right: number,
      mid?: number,
      color = '#2F80ED',
    ): SimulationMarker[] =>
      rangeIndices(left, right).map((index) => {
        let label = '';
        if (index === left) label = `L=${left + 1}`;
        if (index === right)
          label = label ? `${label}/R=${right + 1}` : `R=${right + 1}`;
        if (mid !== undefined && index === mid) {
          label = label ? `${label}/M=${mid + 1}` : `M=${mid + 1}`;
        }
        return {
          index,
          label,
          role: 'rangoActual',
          color,
        };
      });

    const merge = (left: number, mid: number, right: number) => {
      const leftValues = array.slice(left, mid + 1);
      const rightValues = array.slice(mid + 1, right + 1);
      let i = 0;
      let j = 0;
      let k = left;

      steps.push(
        createStep(
          step++,
          'comparacion',
          [],
          array,
          6,
          waiting(),
          rangeMarkers(left, right, mid),
        ),
      );
      steps.push(
        createStep(
          step++,
          'comparacion',
          rangeIndices(left, mid),
          array,
          7,
          waiting(),
        ),
      );
      steps.push(
        createStep(
          step++,
          'comparacion',
          rangeIndices(mid + 1, right),
          array,
          8,
          waiting(),
        ),
      );
      steps.push(
        createStep(step++, 'comparacion', [left], array, 9, waiting()),
      );

      while (i < leftValues.length && j < rightValues.length) {
        steps.push(
          createStep(
            step++,
            'comparacion',
            [left + i, mid + 1 + j],
            array,
            10,
            waiting(),
          ),
        );
        const takeLeft = leftValues[i] <= rightValues[j];
        array[k] = takeLeft ? leftValues[i++] : rightValues[j++];
        steps.push(
          createStep(
            step++,
            'insercion',
            [k],
            array,
            takeLeft ? 11 : 12,
            waiting(),
          ),
        );
        k++;
        steps.push(
          createStep(step++, 'insercion', [k - 1], array, 13, waiting()),
        );
      }

      while (i < leftValues.length) {
        array[k] = leftValues[i++];
        steps.push(createStep(step++, 'insercion', [k], array, 14, waiting()));
        k++;
      }

      while (j < rightValues.length) {
        array[k] = rightValues[j++];
        steps.push(createStep(step++, 'insercion', [k], array, 14, waiting()));
        k++;
      }
    };

    const sort = (left: number, right: number) => {
      recursionStack.push([left, right]);
      steps.push(
        createStep(
          step++,
          'comparacion',
          [],
          array,
          1,
          waiting(),
          rangeMarkers(left, right),
        ),
      );

      if (left >= right) {
        steps.push(
          createStep(
            step++,
            'final',
            [],
            array,
            2,
            waiting(),
            rangeMarkers(left, right, undefined, '#00D4FF'),
          ),
        );
        recursionStack.pop();
        return;
      }

      const mid = Math.floor((left + right) / 2);
      steps.push(
        createStep(
          step++,
          'comparacion',
          [],
          array,
          3,
          waiting(),
          rangeMarkers(left, right, mid, '#00D4FF'),
        ),
      );
      steps.push(
        createStep(
          step++,
          'comparacion',
          [],
          array,
          4,
          waiting(),
          rangeMarkers(left, mid, undefined, '#2F80ED'),
        ),
      );
      sort(left, mid);
      steps.push(
        createStep(
          step++,
          'comparacion',
          [],
          array,
          5,
          waiting(),
          rangeMarkers(mid + 1, right, undefined, '#2F80ED'),
        ),
      );
      sort(mid + 1, right);
      merge(left, mid, right);
      recursionStack.pop();
    };

    sort(0, array.length - 1);
    steps.push(createStep(step++, 'final', [], array, 1));
    return steps;
  },
};

export const QuickSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Quick Sort',
    descripcion: 'Particiona por pivote y ordena recursivamente.',
    complejidadTiempo: 'O(n log n)',
    complejidadEspacio: 'O(log n)',
    categoria: 'Ordenamiento',
  },
  execute(data: number[]): SimulationStep[] {
    const array = [...data];
    const steps: SimulationStep[] = [];
    let step = 1;
    const recursionStack: Array<[number, number]> = [];
    const waiting = () => flattenRanges(recursionStack.slice(0, -1));

    const partition = (low: number, high: number) => {
      let i = low - 1;
      for (let j = low; j < high; j++) {
        steps.push(
          createStep(step++, 'comparacion', [j, high], array, 5, waiting()),
        );
        if (array[j] <= array[high]) {
          i++;
          [array[i], array[j]] = [array[j], array[i]];
          steps.push(
            createStep(step++, 'intercambio', [i, j], array, 6, waiting()),
          );
        }
      }
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      steps.push(
        createStep(step++, 'intercambio', [i + 1, high], array, 2, waiting()),
      );
      return i + 1;
    };

    const sort = (low: number, high: number) => {
      if (low >= high) return;
      recursionStack.push([low, high]);
      const pivot = partition(low, high);
      sort(low, pivot - 1);
      sort(pivot + 1, high);
      recursionStack.pop();
    };

    sort(0, array.length - 1);
    steps.push(createStep(step++, 'final', [], array, 1));
    return steps;
  },
};

export const HeapSort: AlgorithmDefinition = {
  meta: {
    nombre: 'Heap Sort',
    descripcion: 'Construye un max-heap y extrae el máximo para ordenar.',
    complejidadTiempo: 'O(n log n)',
    complejidadEspacio: 'O(1)',
    categoria: 'Ordenamiento',
  },
  execute(data: number[]): SimulationStep[] {
    const array = [...data];
    const steps: SimulationStep[] = [];
    let step = 1;

    const heapify = (size: number, root: number) => {
      let largest = root;
      const left = root * 2 + 1;
      const right = root * 2 + 2;
      if (left < size) {
        steps.push(
          createStep(step++, 'comparacion', [largest, left], array, 4),
        );
        if (array[left] > array[largest]) largest = left;
      }
      if (right < size) {
        steps.push(
          createStep(step++, 'comparacion', [largest, right], array, 4),
        );
        if (array[right] > array[largest]) largest = right;
      }
      if (largest !== root) {
        [array[root], array[largest]] = [array[largest], array[root]];
        steps.push(
          createStep(step++, 'intercambio', [root, largest], array, 4),
        );
        heapify(size, largest);
      }
    };

    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--)
      heapify(array.length, i);
    for (let end = array.length - 1; end > 0; end--) {
      [array[0], array[end]] = [array[end], array[0]];
      steps.push(createStep(step++, 'intercambio', [0, end], array, 3));
      heapify(end, 0);
    }
    steps.push(createStep(step++, 'final', [], array, 1));
    return steps;
  },
};

export const LinearSearch: AlgorithmDefinition = {
  meta: {
    nombre: 'Linear Search',
    descripcion: 'Revisa cada elemento hasta encontrar el objetivo.',
    complejidadTiempo: 'O(n)',
    complejidadEspacio: 'O(1)',
    categoria: 'Busqueda',
  },
  execute(data: number[]): SimulationStep[] {
    const target = data[Math.floor(data.length / 2)] ?? data[0];
    const steps: SimulationStep[] = [];
    let step = 1;
    for (let i = 0; i < data.length; i++) {
      steps.push(createStep(step++, 'comparacion', [i], data, 2));
      if (data[i] === target) {
        steps.push(createStep(step++, 'final', [i], data, 3));
        return steps;
      }
    }
    steps.push(createStep(step++, 'final', [], data, 4));
    return steps;
  },
};

export const BinarySearch: AlgorithmDefinition = {
  meta: {
    nombre: 'Binary Search',
    descripcion: 'Descarta mitades de un arreglo ordenado.',
    complejidadTiempo: 'O(log n)',
    complejidadEspacio: 'O(1)',
    categoria: 'Busqueda',
  },
  execute(data: number[]): SimulationStep[] {
    const array = [...data].sort((a, b) => a - b);
    const target = array[Math.floor(array.length * 0.65)] ?? array[0];
    const steps: SimulationStep[] = [];
    let step = 1;
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push(createStep(step++, 'comparacion', [low, mid, high], array, 3));
      if (array[mid] === target) {
        steps.push(createStep(step++, 'final', [mid], array, 4));
        return steps;
      }
      if (array[mid] < target) low = mid + 1;
      else high = mid - 1;
      steps.push(
        createStep(step++, 'insercion', [], array, array[mid] < target ? 5 : 6),
      );
    }
    steps.push(createStep(step++, 'final', [], array, 6));
    return steps;
  },
};

export const Deque: AlgorithmDefinition = {
  meta: {
    nombre: 'Deque',
    descripcion: 'Cola doble con inserción y extracción por ambos extremos.',
    complejidadTiempo: 'O(1)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasLineales',
  },
  execute(data: number[]): SimulationStep[] {
    const deque: number[] = [];
    const steps: SimulationStep[] = [];
    let step = 1;
    data.forEach((value, index) => {
      if (index % 2 === 0) {
        deque.unshift(value);
        steps.push(createStep(step++, 'insercion', [0], deque, 1));
      } else {
        deque.push(value);
        steps.push(
          createStep(step++, 'insercion', [deque.length - 1], deque, 2),
        );
      }
    });
    while (deque.length > 0) {
      const front = deque.length % 2 === 0;
      steps.push(
        createStep(
          step++,
          'intercambio',
          [front ? 0 : deque.length - 1],
          deque,
          front ? 3 : 4,
        ),
      );
      if (front) deque.shift();
      else deque.pop();
    }
    steps.push(createStep(step++, 'final', [], deque, 4));
    return steps;
  },
};

export const PriorityQueue: AlgorithmDefinition = {
  meta: {
    nombre: 'Priority Queue',
    descripcion: 'Atiende primero el elemento con mayor prioridad.',
    complejidadTiempo: 'O(log n)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasLineales',
  },
  execute(data: number[]): SimulationStep[] {
    const heap = [...data].sort((a, b) => b - a);
    return [
      createStep(1, 'insercion', [0], heap, 1),
      createStep(2, 'comparacion', heap.length > 1 ? [0, 1] : [0], heap, 2),
      createStep(3, 'intercambio', [0], heap, 3),
      createStep(4, 'final', [], [], 4),
    ];
  },
};

export const SegmentTree: AlgorithmDefinition = {
  meta: {
    nombre: 'Segment Tree',
    descripcion: 'Árbol para consultas de rangos.',
    complejidadTiempo: 'Construcción O(n), consulta O(log n)',
    complejidadEspacio: 'O(n)',
    categoria: 'EstructurasArboles',
  },
  execute(data: number[]): SimulationStep[] {
    const n = data.length;
    const tree: number[] = new Array<number>(Math.max(1, n * 4)).fill(0);
    const steps: SimulationStep[] = [];
    let step = 1;
    const recursionStack: number[] = [];
    const createdNodes = new Map<number, SimulationTreeNode>();

    if (n === 0) {
      return [createStep(step, 'final', [], [], 7)];
    }

    const toVisualIndex = (node: number) => node - 1;
    const levelOf = (node: number) => Math.floor(Math.log2(node));
    const positionOf = (node: number) => node - 2 ** levelOf(node);
    const labelFor = (left: number, right: number) =>
      left === right ? `[${left}]` : `[${left},${right}]`;
    const setNode = (
      node: number,
      left: number,
      right: number,
      value: number | null,
    ) => {
      createdNodes.set(node, {
        index: toVisualIndex(node),
        value,
        level: levelOf(node),
        position: positionOf(node),
        label: labelFor(left, right),
      });
    };
    const visibleNodes = () =>
      [...createdNodes.values()].sort((a, b) => a.index - b.index);
    const visibleValues = () => visibleNodes().map((item) => item.value ?? 0);
    const waiting = () =>
      recursionStack.slice(0, -1).map((node) => toVisualIndex(node));
    const pushSegmentStep = (
      tipoOperacion: Op,
      node: number,
      line: number,
      activeNodes: number[] = [node],
    ) => {
      steps.push({
        numeroPaso: step++,
        tipoOperacion,
        indicesActivos: activeNodes.map(toVisualIndex),
        estadoArray: visibleValues(),
        lineaPseudocodigo: line,
        contexto:
          waiting().length > 0 ? { waitingIndices: waiting() } : undefined,
        nodosArbol: visibleNodes(),
      });
    };

    const build = (node: number, left: number, right: number) => {
      recursionStack.push(node);
      setNode(node, left, right, createdNodes.get(node)?.value ?? null);
      pushSegmentStep('comparacion', node, 1);
      if (left === right) {
        tree[node] = data[left];
        setNode(node, left, right, tree[node]);
        pushSegmentStep('insercion', node, 2);
        recursionStack.pop();
        return;
      }
      const mid = Math.floor((left + right) / 2);
      pushSegmentStep('comparacion', node, 3);
      setNode(node * 2, left, mid, null);
      pushSegmentStep('comparacion', node * 2, 4);
      build(node * 2, left, mid);
      setNode(node * 2 + 1, mid + 1, right, null);
      pushSegmentStep('comparacion', node * 2 + 1, 5);
      build(node * 2 + 1, mid + 1, right);
      tree[node] = tree[node * 2] + tree[node * 2 + 1];
      setNode(node, left, right, tree[node]);
      pushSegmentStep('insercion', node, 6, [node, node * 2, node * 2 + 1]);
      recursionStack.pop();
    };

    build(1, 0, n - 1);
    steps.push({
      numeroPaso: step++,
      tipoOperacion: 'final',
      indicesActivos: [0],
      estadoArray: visibleValues(),
      lineaPseudocodigo: 7,
      nodosArbol: visibleNodes(),
    });
    return steps;
  },
};
