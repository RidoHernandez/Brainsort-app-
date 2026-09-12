import { ApiProperty } from '@nestjs/swagger';

export class ExerciseResultDto {
  @ApiProperty({ description: 'Indica si la respuesta fue correcta' })
  correcto: boolean;

  @ApiProperty({
    description: 'Feedback positivo o negativo según el resultado',
  })
  feedback: string;

  @ApiProperty({
    description: 'Feedback positivo cuando la respuesta es correcta',
    required: false,
  })
  feedbackPositivo?: string;

  @ApiProperty({
    description: 'Feedback negativo cuando la respuesta es incorrecta',
    required: false,
  })
  feedbackNegativo?: string;

  @ApiProperty({ description: 'Puntos ganados por el ejercicio' })
  puntosGanados: number;

  @ApiProperty({ description: 'Racha de días actual del usuario' })
  rachaDias: number;

  @ApiProperty({ description: 'Posición en el ranking' })
  posicionRanking: number;

  @ApiProperty({ description: 'Nivel actual del usuario' })
  nivelActual: number;

  @ApiProperty({ description: 'Total de puntos acumulados' })
  puntosTotales: number;
}
