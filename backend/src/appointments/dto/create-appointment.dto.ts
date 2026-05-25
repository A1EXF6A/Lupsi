import { IsNotEmpty, IsUUID, IsDateString, IsInt, IsOptional } from 'class-validator';

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
}
