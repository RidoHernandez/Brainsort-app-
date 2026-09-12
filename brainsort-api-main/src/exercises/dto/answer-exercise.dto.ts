import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AnswerExerciseDto {
  @ApiProperty({
    description: 'Respuesta del usuario al ejercicio',
    example: 'O(n log n)',
  })
  @IsString()
  @IsNotEmpty()
  respuesta: string;
}
