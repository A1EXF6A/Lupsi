import { Module } from '@nestjs/common';
import { EcuadorianIdValidatorService } from './services/ecuadorian-id-validator.service';

@Module({
  providers: [EcuadorianIdValidatorService],
  exports: [EcuadorianIdValidatorService], // Exportado para ser inyectable globalmente
})
export class IamModule {}
