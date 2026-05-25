import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ClinicalHistoryModule } from './clinical-history/clinical-history.module';
import { ClinicalAttentionsModule } from './clinical-attentions/clinical-attentions.module';
import { MedicationsModule } from './medications/medications.module';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    IamModule,
    SupabaseModule,
    AuthModule,
    CatalogsModule,
    AppointmentsModule,
    ClinicalHistoryModule,
    ClinicalAttentionsModule,
    MedicationsModule,
    UsersModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
