import { ApiProperty } from '@nestjs/swagger';

/** Línea de pseudocódigo — generada desde el engine file (CDR-001). */
export class PseudocodeLineDto {
  @ApiProperty({ description: 'Número de línea (base 1)', example: 1 })
  line: number;

  @ApiProperty({
    description: 'Texto de la línea de pseudocódigo',
    example: 'PARA i = 0 HASTA n-1',
  })
  text: string;

  @ApiProperty({ description: 'Nivel de indentación (0, 1, 2...)', example: 0 })
  indent: number;
}

/** Tarjeta de algoritmo para la biblioteca (CO1) — descripción truncada a ≤140 caracteres. */
export class AlgorithmLibraryCardDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({
    description: 'Descripción corta para tarjeta (máx. 140 caracteres)',
  })
  descripcion: string;

  @ApiProperty()
  dificultad: string;

  @ApiProperty()
  complejidadTiempo: string;

  @ApiProperty()
  complejidadEspacio: string;

  @ApiProperty({ enum: ['Ordenamiento', 'Busqueda', 'EstructurasLineales'] })
  categoria: string;

  @ApiProperty({ type: [String] })
  tags: string[];
}

/**
 * Detalle completo de un algoritmo (CO2) — descripción completa + pseudocódigo.
 * Nota CDR-001: pseudocode[] viene del engine file, no de la DB.
 */
export class AlgorithmDetailResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ description: 'Descripción completa del algoritmo' })
  descripcion: string;

  @ApiProperty()
  dificultad: string;

  @ApiProperty()
  complejidadTiempo: string;

  @ApiProperty()
  complejidadEspacio: string;

  @ApiProperty({ enum: ['Ordenamiento', 'Busqueda', 'EstructurasLineales'] })
  categoria: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty({
    type: [PseudocodeLineDto],
    description:
      'Pseudocódigo del algoritmo — generado desde el engine (CDR-001)',
  })
  pseudocode: PseudocodeLineDto[];
}

export class LibraryResponseDto {
  @ApiProperty({
    type: [String],
    example: ['Ordenamiento', 'Busqueda', 'EstructurasLineales'],
  })
  categorias: string[];

  @ApiProperty()
  totalAlgoritmos: number;

  @ApiProperty({ type: [AlgorithmLibraryCardDto] })
  algoritmos: AlgorithmLibraryCardDto[];
}
