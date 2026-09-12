import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsEnum(['Estudiante', 'Profesor', 'Autodidacta'])
  rol: string;

  @IsString()
  @MinLength(8)
  contrasena: string;
}
