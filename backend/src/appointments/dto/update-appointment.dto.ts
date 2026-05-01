import { IsBoolean, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class UpdateAppointmentDto {
  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsDateString()
  @IsOptional()
  appointment_time?: string;

  @IsEnum(['SCHEDULED', 'CANCELLED', 'COMPLETED'])
  @IsOptional()
  status?: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';

  @IsBoolean()
  @IsOptional()
  arrived?: boolean;

  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}
