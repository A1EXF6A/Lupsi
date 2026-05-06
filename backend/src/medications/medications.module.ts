import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';

@Module({
  imports: [SupabaseModule],
  controllers: [MedicationsController],
  providers: [MedicationsService],
})
export class MedicationsModule {}
