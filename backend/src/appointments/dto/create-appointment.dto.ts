import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  doctor_id: string;

  @IsDateString()
  @IsNotEmpty()
  appointment_time: string;
}
