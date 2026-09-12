import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsString,
  IsDate,
  IsInt,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class OfflineSessionDto {
  @ApiProperty({ description: 'ID del algoritmo' })
  @IsString()
  algoritmoId: string;

  @ApiProperty({ description: 'Fecha de inicio de la sesión' })
  @Type(() => Date)
  @IsDate()
  fechaInicio: Date;

  @ApiProperty({ description: 'Fecha de fin de la sesión' })
  @Type(() => Date)
  @IsDate()
  fechaFin: Date;

  @ApiProperty({ description: 'Pasos completados' })
  @IsInt()
  pasosCompletados: number;

  @ApiProperty({ description: 'Indica si la sesión está completada' })
  @IsBoolean()
  completada: boolean;
}

export class SyncProgressDto {
  @ApiProperty({
    description: 'Sesiones offline para sincronizar',
    type: [OfflineSessionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OfflineSessionDto)
  sesiones: OfflineSessionDto[];
}

export class SyncResponseDto {
  @ApiProperty({ description: 'Número de sesiones sincronizadas' })
  sincronizados: number;

  @ApiProperty({ description: 'Puntos actualizados' })
  puntosActualizados: number;
}
