import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { ClinicalAttentionsController } from './clinical-attentions.controller';
import { ClinicalAttentionsService } from './clinical-attentions.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ClinicalAttentionsController],
  providers: [ClinicalAttentionsService],
})
export class ClinicalAttentionsModule {}
