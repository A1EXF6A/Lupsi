import { Test, TestingModule } from '@nestjs/testing';
import { EcuadorianIdValidatorService } from './ecuadorian-id-validator.service';
import { BadRequestException } from '@nestjs/common';

describe('EcuadorianIdValidatorService', () => {
  let service: EcuadorianIdValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EcuadorianIdValidatorService],
    }).compile();

    service = module.get<EcuadorianIdValidatorService>(
      EcuadorianIdValidatorService,
    );
  });

  it('debería estar definido dentro de la arquitectura de NestJS', () => {
    expect(service).toBeDefined();
  });

  describe('DNI Válidos (Pacientes Reales)', () => {
    it('debería validar correctamente cédulas ecuatorianas reales (Ej. Provincia 17 - Pichincha)', () => {
      // 1710034065 es matemáticamente correcta
      expect(service.validate('1710034065')).toBe(true);
    });

    it('debería validar correctamente cédulas ecuatorianas reales (Ej. Provincia 09 - Guayas)', () => {
      // 0921473187 es matemáticamente correcta
      expect(service.validate('0921473187')).toBe(true);
    });
  });

  describe('Corrupción y Ataques Zero Friction (DNI Inválidos)', () => {
    it('debería rechazar DNIs fantasmas que contengan diferente de 10 caracteres', () => {
      expect(() => service.validate('171003406')).toThrow(BadRequestException);
      expect(() => service.validate('17100340650')).toThrow(
        BadRequestException,
      );
    });

    it('debería rechazar caracteres maliciosos (letras, inyecciones) inmediatamente', () => {
      expect(() => service.validate('17100A4065')).toThrow(BadRequestException);
      expect(() => service.validate('17100-4065')).toThrow(BadRequestException);
    });

    it('debería rechazar provincias sintéticas (fuera de rango 01-24 o 30)', () => {
      expect(() => service.validate('3110034065')).toThrow(BadRequestException);
    });

    it('debería rechazar perfiles jurídicos (tercer dígito >= 6), LUPSI es solo para pacientes naturales', () => {
      // Códigos 6 (Públicos) y 9 (Jurídicos) son bloqueados de raíz
      expect(() => service.validate('1760034065')).toThrow(BadRequestException);
      expect(() => service.validate('1790034065')).toThrow(BadRequestException);
    });

    it('debería rechazar cédulas donde falle la comprobación final del Algoritmo Módulo 10', () => {
      // 1710034065 (Verdadero). Cambiamos el verificador 5 por 6:
      expect(() => service.validate('1710034066')).toThrow(BadRequestException);
    });
  });
});
