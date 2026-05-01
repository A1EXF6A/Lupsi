import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClinicalAttentionDto {
  @IsUUID()
  appointment_id: string;

  @IsUUID()
  patient_id: string;

  @IsUUID()
  doctor_id: string;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsOptional()
  vitals?: Record<string, unknown> | null;

  @IsString()
  @IsOptional()
  diagnosis?: string | null;

  @IsString()
  @IsOptional()
  treatment?: string | null;
}

export class UpdateClinicalAttentionDto {
  @IsUUID()
  @IsOptional()
  appointment_id?: string;

  @IsUUID()
  @IsOptional()
  patient_id?: string;

  @IsUUID()
  @IsOptional()
  doctor_id?: string;

  @IsString()
  @IsOptional()
  notes?: string | null;

  @IsOptional()
  vitals?: Record<string, unknown> | null;

  @IsString()
  @IsOptional()
  diagnosis?: string | null;

  @IsString()
  @IsOptional()
  treatment?: string | null;
}
