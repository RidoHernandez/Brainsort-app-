import { ApiProperty } from '@nestjs/swagger';

export class BadgeResponseDto {
  @ApiProperty({ description: 'ID de la insignia' })
  id: string;

  @ApiProperty({ description: 'Nombre de la insignia' })
  nombre: string;

  @ApiProperty({ description: 'Descripción de la insignia' })
  descripcion: string;

  @ApiProperty({ description: 'URL o ruta de la imagen de la insignia' })
  imagen: string;

  @ApiProperty({ description: 'Criterio para desbloquear la insignia' })
  criterioDesbloqueo: string;

  @ApiProperty({ description: 'Fecha de obtención (si está desbloqueada)' })
  fechaObtencion?: Date;

  @ApiProperty({
    description: 'Indica si el usuario tiene la insignia desbloqueada',
  })
  desbloqueada: boolean;
}
