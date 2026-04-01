import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { IamModule } from '../iam/iam.module';

@Module({
  imports: [SupabaseModule, IamModule],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
