import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto, UpdateMedicationDto } from './dto/medication.dto';

@Controller('api/v1/medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  findAll() {
    return this.medicationsService.findAll();
  }

  @Post()
  create(@Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.medicationsService.remove(id);
    return { message: 'Medicamento eliminado' };
  }
}
