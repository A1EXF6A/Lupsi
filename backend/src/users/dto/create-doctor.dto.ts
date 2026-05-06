import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateDoctorDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  @IsOptional()
  specialty?: string;
}
