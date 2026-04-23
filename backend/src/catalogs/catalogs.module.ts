import { Module } from '@nestjs/common';
import { CatalogsController } from './catalogs.controller';
import { CatalogsService } from './catalogs.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [CatalogsController],
  providers: [CatalogsService],
  exports: [CatalogsService], // Exportamos por si otros módulos necesitan validar tipos o especialidades
})
export class CatalogsModule {}
