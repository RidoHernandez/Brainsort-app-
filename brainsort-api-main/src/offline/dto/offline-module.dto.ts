import { ApiProperty } from '@nestjs/swagger';

export class OfflineModuleDto {
  @ApiProperty({ description: 'ID del algoritmo' })
  algoritmoId: string;

  @ApiProperty({ description: 'Nombre del algoritmo' })
  nombre: string;

  @ApiProperty({ description: 'Tamaño en KB del módulo' })
  tamanoKB: number;

  @ApiProperty({ description: 'Versión del módulo' })
  version: string;

  @ApiProperty({ description: 'Indica si el usuario ya descargó el módulo' })
  descargado: boolean;
}

export class OfflineModuleDownloadDto {
  @ApiProperty({ description: 'ID del algoritmo incluido en el módulo' })
  algoritmoId: string;

  @ApiProperty({ description: 'Versión del módulo descargable' })
  version: string;

  @ApiProperty({ description: 'Metadatos del algoritmo' })
  meta: {
    id: string;
    nombre: string;
    descripcion: string;
    dificultad: string;
    complejidadTiempo: string;
    complejidadEspacio: string;
    categoria: string;
  };

  @ApiProperty({ description: 'Pseudocódigo del algoritmo' })
  pseudocode: Array<{
    line: number;
    text: string;
    indent: number;
  }>;

  @ApiProperty({ description: 'Ejercicios del algoritmo' })
  ejercicios: Array<{
    id: string;
    tipo: string;
    pregunta: string;
    dificultad: string;
    opciones?: unknown;
    contenido?: unknown;
    respuestaCorrecta: string;
    feedbackPositivo: string;
    feedbackNegativo: string;
  }>;
}
