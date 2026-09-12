import { AlgorithmDefinition, SimulationStep } from './engine.interface';
import { BubbleSort } from './bubble-sort.engine';
import { SelectionSort } from './selection-sort.engine';
import { InsertionSort } from './insertion-sort.engine';
import { Stack } from './stack.engine';
import { Queue } from './queue.engine';
import { LinkedList } from './linked-list.engine';
import {
  BinarySearch,
  Deque,
  HeapSort,
  LinearSearch,
  MergeSort,
  PriorityQueue,
  QuickSort,
  SegmentTree,
} from './advanced-engines';
import { NotFoundException } from '@nestjs/common';

const ENGINES: Record<string, AlgorithmDefinition> = {
  'Bubble Sort': BubbleSort,
  'Selection Sort': SelectionSort,
  'Insertion Sort': InsertionSort,
  'Merge Sort': MergeSort,
  'Quick Sort': QuickSort,
  'Heap Sort': HeapSort,
  'Binary Search': BinarySearch,
  'Linear Search': LinearSearch,
  Stack: Stack,
  Queue: Queue,
  'Linked List': LinkedList,
  Deque: Deque,
  'Priority Queue': PriorityQueue,
  'Segment Tree': SegmentTree,
};

export function getEngine(nombre: string): AlgorithmDefinition {
  const engine = ENGINES[nombre];
  if (!engine) {
    throw new NotFoundException(`Engine "${nombre}" no registrado`);
  }
  return engine;
}

/**
 * Ejecuta el engine con un timeout de seguridad de 10 segundos.
 * Si el engine excede el tiempo, aborta con error 408 (Request Timeout).
 * Ref: T-BE-063, HU-06
 */
export async function executeWithTimeout(
  nombre: string,
  data: number[],
): Promise<SimulationStep[]> {
  const engine = getEngine(nombre);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Timeout: Engine execution exceeded 10 seconds'));
    }, 10000); // 10 segundos

    try {
      const result = engine.execute(data);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
}
