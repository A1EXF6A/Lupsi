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
import { ClinicalAttentionsService } from './clinical-attentions.service';
import {
  CreateClinicalAttentionDto,
  UpdateClinicalAttentionDto,
} from './dto/clinical-attention.dto';

@Controller('api/v1/clinical-attentions')
export class ClinicalAttentionsController {
  constructor(
    private readonly clinicalAttentionsService: ClinicalAttentionsService,
  ) {}

  @Get()
  getAll(
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('appointmentId') appointmentId?: string,
  ) {
    return this.clinicalAttentionsService.findAll({
      patientId,
      doctorId,
      appointmentId,
    });
  }

  @Post()
  create(@Body() dto: CreateClinicalAttentionDto) {
    return this.clinicalAttentionsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClinicalAttentionDto) {
    return this.clinicalAttentionsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.clinicalAttentionsService.remove(id);
    return { message: 'Ficha clinica eliminada' };
  }
}
