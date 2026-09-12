import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty } from 'class-validator';

export class EvaluateDiagnosticDto {
  @ApiProperty({
    type: [Number],
    description: 'Arreglo con los índices de las respuestas seleccionadas',
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  respuestas: number[];
}
