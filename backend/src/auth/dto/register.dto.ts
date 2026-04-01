import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @Length(6, 50, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'La cédula es requerida' })
  @Matches(/^[0-9]{10}$/, {
    message: 'La cédula debe contener exactamente 10 dígitos numéricos',
  })
  dni: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
  first_name: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @Length(2, 100, {
    message: 'El apellido debe tener entre 2 y 100 caracteres',
  })
  last_name: string;

  @IsOptional()
  @IsString()
  @Length(7, 20, { message: 'El teléfono debe tener un formato válido' })
  phone?: string;

  @IsOptional()
  @IsString()
  date_of_birth?: string; // Formato YYYY-MM-DD
}
