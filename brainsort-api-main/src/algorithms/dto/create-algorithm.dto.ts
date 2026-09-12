import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAlgorithmDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  complejidadTiempo: string;

  @IsString()
  @IsNotEmpty()
  complejidadEspacio: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;
}
