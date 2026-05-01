import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClinicalHistoryService } from './clinical-history.service';
import {
  CreateClinicalHistoryDto,
  UpdateClinicalHistoryDto,
} from './dto/clinical-history.dto';

@Controller('api/v1/clinical-history')
export class ClinicalHistoryController {
  constructor(private readonly clinicalHistoryService: ClinicalHistoryService) {}

  @Get()
  getByPatient(@Query('patientId') patientId: string) {
    return this.clinicalHistoryService.findByPatient(patientId);
  }

  @Post()
  create(@Body() dto: CreateClinicalHistoryDto) {
    return this.clinicalHistoryService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClinicalHistoryDto) {
    return this.clinicalHistoryService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.clinicalHistoryService.remove(id);
    return { message: 'Historial clinico eliminado' };
  }
}
