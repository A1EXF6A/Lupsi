import { IsNotEmpty, IsUUID, IsDateString, IsInt, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  doctor_id: string;

  @IsDateString()
  @IsNotEmpty()
  appointment_time: string;

  @IsInt()
  @IsOptional()
  duration_minutes?: number;

  @IsString()
  @IsOptional()
  appointment_type?: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsNumber()
  @IsOptional()
  price?: number;
}
