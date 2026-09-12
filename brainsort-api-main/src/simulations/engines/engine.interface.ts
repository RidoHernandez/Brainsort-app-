export interface AlgorithmDefinition {
  meta: {
    nombre: string;
    descripcion: string;
    complejidadTiempo: string;
    complejidadEspacio: string;
    categoria: string;
  };
  execute(data: number[]): SimulationStep[];
}

// Tipo para el pseudocódigo almacenado en la base de datos
export type PseudocodeDB = PseudocodeLine[];

export interface PseudocodeLine {
  line: number; // Índice base 1
  text: string; // Texto de la línea de pseudocódigo
  indent: number; // Nivel de indentación espacial
}

export type TipoOperacion =
  | 'comparacion'
  | 'intercambio'
  | 'insercion'
  | 'final'
  | 'idle';

export interface SimulationMarker {
  index: number;
  label: string;
  role: string;
  color: string;
}

export interface SimulationStepContext {
  waitingIndices?: number[];
}

export interface SimulationTreeNode {
  index: number;
  value: number | null;
  level: number;
  position: number;
  label?: string;
}

export interface SimulationStep {
  numeroPaso: number;
  tipoOperacion: TipoOperacion;
  indicesActivos: number[]; // Índices en el arreglo que están siendo modificados o comparados
  estadoArray: number[]; // Clon del estado del arreglo en este paso
  lineaPseudocodigo: number; // Índice base 1 correspondiente a PseudocodeLine
  contexto?: SimulationStepContext;
  marcadores?: SimulationMarker[];
  nodosArbol?: SimulationTreeNode[];
}
