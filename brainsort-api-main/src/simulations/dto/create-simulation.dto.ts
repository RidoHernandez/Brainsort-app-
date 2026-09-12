import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsArray,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ConjuntoDeDatosDto {
  @ApiProperty({
    type: [Number],
    description: 'Valores del array de datos',
    example: [5, 2, 8, 1, 9],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(2, { message: 'El array debe tener al menos 2 elementos' })
  @ArrayMaxSize(50, { message: 'El array debe tener máximo 50 elementos' })
  valores: number[];

  @ApiProperty({
    enum: ['Predeterminado', 'Personalizado'],
    description: 'Tipo de origen de los datos',
    example: 'Predeterminado',
  })
  @IsEnum(['Predeterminado', 'Personalizado'])
  tipoOrigen: 'Predeterminado' | 'Personalizado';

  @ApiProperty({
    description: 'Tamaño del array (debe coincidir con valores.length)',
    example: 5,
  })
  @IsInt()
  @Min(2)
  @Max(50)
  tamano: number;
}

export class CreateSimulationDto {
  @ApiProperty({
    description: 'ID del algoritmo a simular',
    example: 'uuid-del-algoritmo',
  })
  @IsUUID()
  algoritmoId: string;

  @ApiProperty({
    type: ConjuntoDeDatosDto,
    description: 'Conjunto de datos para la simulación',
  })
  @ValidateNested()
  @Type(() => ConjuntoDeDatosDto)
  conjuntoDeDatos: ConjuntoDeDatosDto;
}
