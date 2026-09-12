import { SimulationStep } from '../types/step.types';
import { AlgoritmoMeta, PseudocodeLine } from '../types/algorithm.types';

/**
 * T-FE-009: Interfaz base para todos los engines de ordenamiento del core.
 */
export interface SortEngine {
  name: string;
  execute(data: number[]): SimulationStep[];
  getPseudocode(): PseudocodeLine[];
}

/**
 * Interfaz extendida para engines con metadatos y pseudocódigo completo (CDR-001).
 */
export interface AlgorithmDefinition {
  meta: AlgoritmoMeta;
  pseudocode: PseudocodeLine[];
  execute(data: number[]): SimulationStep[];
}
