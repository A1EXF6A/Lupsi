import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogsService {
  /**
   * Obtener lista de especialidades médicas (Estandarizadas)
   */
  getSpecialties() {
    return [
      { id: 'GEN', name: 'Medicina General', description: 'Atención primaria y triaje.' },
      { id: 'PED', name: 'Pediatría', description: 'Atención especializada para niños.' },
      { id: 'GIN', name: 'Ginecología', description: 'Salud reproductiva femenina.' },
      { id: 'DER', name: 'Dermatología', description: 'Afecciones de la piel.' },
      { id: 'CAR', name: 'Cardiología', description: 'Salud cardiovascular.' },
      { id: 'PSQ', name: 'Psiquiatría', description: 'Salud mental y emocional.' },
    ];
  }

  /**
   * Obtener tipos de cita disponibles
   */
  getAppointmentTypes() {
    return [
      { id: 'CONSULTA', name: 'Consulta Médica', durationMinutes: 20 },
      { id: 'CONTROL', name: 'Control / Seguimiento', durationMinutes: 15 },
      { id: 'EMERGENCIA', name: 'Atención de Emergencia', durationMinutes: 30 },
      { id: 'PROCEDIMIENTO', name: 'Procedimiento Menor', durationMinutes: 45 },
    ];
  }

  /**
   * Obtener lista de consultorios (Offices)
   */
  getOffices() {
    return [
      { id: 'C101', name: 'Consultorio 101', floor: 'Planta Baja' },
      { id: 'C102', name: 'Consultorio 102', floor: 'Planta Baja' },
      { id: 'C201', name: 'Consultorio 201', floor: 'Primer Piso' },
      { id: 'C202', name: 'Consultorio 202', floor: 'Primer Piso' },
    ];
  }
}
