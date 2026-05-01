import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClinicalHistoryDto {
  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;

  @IsUUID()
  @IsOptional()
  appointment_id?: string | null;

  @IsString()
  document_url: string;

  @IsString()
  @IsOptional()
  diagnosis?: string | null;
}

export class UpdateClinicalHistoryDto {
  @IsUUID()
  @IsOptional()
  patient_id?: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsUUID()
  @IsOptional()
  appointment_id?: string | null;

  @IsString()
  @IsOptional()
  document_url?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string | null;
}
