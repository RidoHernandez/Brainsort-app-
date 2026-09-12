export type CategoriaAlgoritmo = 'Ordenamiento' | 'Busqueda' | 'EstructurasLineales' | 'EstructurasArboles';

export interface AlgoritmoMeta {
  nombre: string;
  descripcion: string;
  complejidadTiempo: string;
  complejidadEspacio: string;
  categoria: CategoriaAlgoritmo;
}

export interface Algoritmo extends AlgoritmoMeta {
  id: string;
  activo?: boolean;
}

export interface PseudocodeLine {
  line: number;
  text: string;
  indent: number;
}
