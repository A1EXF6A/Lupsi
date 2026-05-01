import { IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}

export class UpdateMedicationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}
