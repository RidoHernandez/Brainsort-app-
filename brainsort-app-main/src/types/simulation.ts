export type OperationType =
  | 'idle'
  | 'comparison'
  | 'swap'
  | 'comparacion'
  | 'intercambio'
  | 'insercion'
  | 'final';

export interface SimulationStep {
  numeroPaso: number;
  tipoOperacion: OperationType;
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo: number;
}

export interface PseudocodeLine {
  line: number;
  text: string;
  indent: number;
}

export interface AlgorithmDefinition {
  meta: {
    nombre: string;
    descripcion: string;
    complejidadTiempo: string;
    complejidadEspacio: string;
    categoria: string;
  };
  pseudocode: PseudocodeLine[];
}

export interface SimulationState {
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  steps: SimulationStep[];
  dataset: number[];
}
