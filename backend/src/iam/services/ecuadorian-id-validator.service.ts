import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EcuadorianIdValidatorService {
  /**
   * Valida matemáticamente una cédula ecuatoriana usando el Algoritmo de Módulo 10.
   * Reglas estrictas: 10 dígitos, provincia válida y dígito verificador.
   */
  validate(dni: string): boolean {
    if (!dni || dni.length !== 10 || !/^\d+$/.test(dni)) {
      throw new BadRequestException('El DNI debe contener 10 dígitos numéricos.');
    }

    const provinceCode = parseInt(dni.substring(0, 2), 10);
    // Provincias de Ecuador van del 01 al 24, más 30 (exterior).
    if (provinceCode < 1 || (provinceCode > 24 && provinceCode !== 30)) {
      throw new BadRequestException('Código de provincia inválido en el DNI.');
    }

    const thirdDigit = parseInt(dni.charAt(2), 10);
    // Para personas naturales, el tercer dígito siempre es < 6.
    if (thirdDigit >= 6) {
      throw new BadRequestException('El DNI no pertenece a una persona natural.');
    }

    const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let totalSum = 0;

    for (let i = 0; i < 9; i++) {
      let product = parseInt(dni.charAt(i), 10) * coefficients[i];
      if (product >= 10) {
        product -= 9;
      }
      totalSum += product;
    }

    // Calcula la decena superior. Ej: Para 35, el siguiente décimo es 40.
    const nextTen = Math.ceil(totalSum / 10) * 10;
    let expectedCheckDigit = nextTen - totalSum;
    
    // Si la resta es 10, el dígito verificador es 0.
    if (expectedCheckDigit === 10) {
      expectedCheckDigit = 0;
    }

    const actualCheckDigit = parseInt(dni.charAt(9), 10);

    if (actualCheckDigit !== expectedCheckDigit) {
      throw new BadRequestException('El DNI es matemáticamente inconsistente (Algoritmo Módulo 10).');
    }

    return true; // Zero fricción: el DNI es verídico.
  }
}
