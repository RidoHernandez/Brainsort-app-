export type TipoOrigenDatos = 'Predeterminado' | 'Personalizado';

export interface ConjuntoDeDatos {
  valores: number[];
  tipoOrigen: TipoOrigenDatos;
  tamano: number;
}

export interface SesionSimulacion {
  id: string;
  usuarioId?: string;
  algoritmoId: string;
  pasosCompletados: number;
  totalPasos: number;
  completada: boolean;
  fechaInicio: Date;
  fechaFin?: Date | null;
}
