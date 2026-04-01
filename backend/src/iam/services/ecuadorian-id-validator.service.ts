import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EcuadorianIdValidatorService {
  /**
   * Valida matemáticamente una cédula ecuatoriana usando el Algoritmo de Módulo 10.
   * Reglas estrictas: 10 dígitos, provincia válida y dígito verificador.
   */
  validate(dni: string): boolean {
    if (!dni || dni.length !== 10 || !/^\d+$/.test(dni)) {
      throw new BadRequestException(
        'La cédula debe contener exactamente 10 dígitos numéricos.',
      );
    }

    const provinceCode = parseInt(dni.substring(0, 2), 10);
    // Provincias de Ecuador van del 01 al 24, más 30 (exterior).
    if (provinceCode < 1 || (provinceCode > 24 && provinceCode !== 30)) {
      throw new BadRequestException(
        'El código de provincia en la cédula no es válido en Ecuador.',
      );
    }

    const thirdDigit = parseInt(dni.charAt(2), 10);
    // Para personas naturales, el tercer dígito siempre es < 6.
    if (thirdDigit >= 6) {
      throw new BadRequestException(
        'El número ingresado no pertenece a una cédula de persona natural.',
      );
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
      throw new BadRequestException(
        'El número de cédula no parece ser correcto. Por favor, verifica que lo hayas escrito bien e intenta de nuevo.',
      );
    }

    return true; // Zero fricción: la cédula es verídica.
  }
}
