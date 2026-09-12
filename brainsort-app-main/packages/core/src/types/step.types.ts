export type TipoOperacion = 'idle' | 'comparacion' | 'intercambio' | 'insercion' | 'final';

export interface SimulationMarker {
  index: number;
  label: string;
  role: string;
  color: string;
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
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo: number;
  marcadores?: SimulationMarker[];
  nodosArbol?: SimulationTreeNode[];
}
