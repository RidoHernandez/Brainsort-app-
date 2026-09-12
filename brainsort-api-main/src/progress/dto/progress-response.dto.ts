import { ApiProperty } from '@nestjs/swagger';

export class ProgressResponseDto {
  @ApiProperty({ description: 'Total de puntos acumulados' })
  puntosTotales: number;

  @ApiProperty({ description: 'Nivel actual del usuario' })
  nivelActual: number;

  @ApiProperty({ description: 'Racha de días consecutivos de actividad' })
  rachaDias: number;

  @ApiProperty({ description: 'Posición en el ranking global' })
  posicionRanking: number;

  @ApiProperty({ description: 'Fecha de última actividad' })
  ultimaActividad: Date;

  @ApiProperty({
    type: [Object],
    description: 'Insignias desbloqueadas por el usuario',
  })
  insignias: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    imagen: string;
    fechaObtencion: Date;
  }>;

  @ApiProperty({ description: 'Número de simulaciones completadas' })
  simulacionesCompletadas: number;

  @ApiProperty({
    description: 'Número de ejercicios respondidos correctamente',
  })
  ejerciciosCorrectos: number;

  @ApiProperty({ description: 'Número total de ejercicios respondidos' })
  ejerciciosTotales: number;

  @ApiProperty({
    type: [Object],
    description: 'Desglose del progreso de resolución por algoritmo',
    required: false,
  })
  algoritmosProgreso?: Array<{
    algoritmoId: string;
    ejerciciosCorrectos: number;
    ejerciciosTotales: number;
  }>;
}

export class RankingResponseDto {
  @ApiProperty({ description: 'ID del usuario' })
  usuarioId: string;

  @ApiProperty({ description: 'Nombre del usuario' })
  nombre: string;

  @ApiProperty({ description: 'Total de puntos' })
  puntosTotales: number;

  @ApiProperty({ description: 'Posición en el ranking' })
  posicion: number;

  @ApiProperty({ description: 'Racha de días' })
  rachaDias: number;

  @ApiProperty({ description: 'Nivel actual' })
  nivelActual: number;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    type: [RankingResponseDto],
    description: 'Entradas del ranking ordenadas por puntos descendentes',
  })
  ranking: RankingResponseDto[];

  @ApiProperty({ description: 'Total de usuarios con progreso registrado' })
  total: number;
}
