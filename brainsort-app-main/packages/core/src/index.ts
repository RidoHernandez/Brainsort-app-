// T-FE-021: Barrel export de todos los módulos de packages/core

// engines/
export { SortEngine, AlgorithmDefinition } from './engines/engine.interface';
export { BubbleSortEngine } from './engines/bubble-sort';
export { SelectionSortEngine } from './engines/selection-sort';
export { InsertionSortEngine } from './engines/insertion-sort';
export { MergeSortEngine } from './engines/merge-sort';
export { QuickSortEngine } from './engines/quick-sort';
export { HeapSortEngine } from './engines/heap-sort';
export { LinearSearchEngine } from './engines/linear-search';
export { BinarySearchEngine } from './engines/binary-search';
export { StackEngine } from './engines/stack';
export { QueueEngine } from './engines/queue';
export { LinkedListEngine } from './engines/linked-list';
export { DequeEngine } from './engines/deque';
export { PriorityQueueEngine } from './engines/priority-queue';
export { SegmentTreeEngine } from './engines/segment-tree';

// math/
export { createScales } from './math/scales';
export type { ScalesConfig, ChartScales } from './math/scales';
export { getNumberInterpolator, interpolateValue, interpolateBarState } from './math/transitions';
export type { BarTransitionState } from './math/transitions';
export { calculateBarCoordinates } from './math/coordinates';
export type { BarCoordinate } from './math/coordinates';

// types/
export type { TipoOrigenDatos, ConjuntoDeDatos, SesionSimulacion } from './types/simulation.types';
export type { CategoriaAlgoritmo, AlgoritmoMeta, Algoritmo, PseudocodeLine } from './types/algorithm.types';
export type { TipoOperacion, SimulationMarker, SimulationTreeNode, SimulationStep } from './types/step.types';

// validators/
export { validateDataset } from './validators/dataset.validator';
export type { DatasetValidationResult } from './validators/dataset.validator';
