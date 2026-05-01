import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { Public } from '../iam/decorators/public.decorator';
import {
  CreateAppointmentTypeDto,
  CreateOfficeDto,
  CreateSpecialtyDto,
  UpdateAppointmentTypeDto,
  UpdateOfficeDto,
  UpdateSpecialtyDto,
} from './dto/catalog.dto';

@Public()
@Controller('api/v1/catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('specialties')
  getSpecialties() {
    return this.catalogsService.getSpecialties();
  }

  @Post('specialties')
  createSpecialty(@Body() dto: CreateSpecialtyDto) {
    return this.catalogsService.createSpecialty(dto);
  }

  @Put('specialties/:id')
  updateSpecialty(@Param('id') id: string, @Body() dto: UpdateSpecialtyDto) {
    return this.catalogsService.updateSpecialty(id, dto);
  }

  @Delete('specialties/:id')
  async deleteSpecialty(@Param('id') id: string) {
    await this.catalogsService.deleteSpecialty(id);
    return { message: 'Especialidad eliminada' };
  }

  @Get('appointment-types')
  getAppointmentTypes() {
    return this.catalogsService.getAppointmentTypes();
  }

  @Post('appointment-types')
  createAppointmentTypes(@Body() dto: CreateAppointmentTypeDto) {
    return this.catalogsService.createAppointmentType(dto);
  }

  @Put('appointment-types/:id')
  updateAppointmentTypes(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentTypeDto,
  ) {
    return this.catalogsService.updateAppointmentType(id, dto);
  }

  @Delete('appointment-types/:id')
  async deleteAppointmentTypes(@Param('id') id: string) {
    await this.catalogsService.deleteAppointmentType(id);
    return { message: 'Tipo de cita eliminado' };
  }

  @Get('offices')
  getOffices() {
    return this.catalogsService.getOffices();
  }

  @Post('offices')
  createOffice(@Body() dto: CreateOfficeDto) {
    return this.catalogsService.createOffice(dto);
  }

  @Put('offices/:id')
  updateOffice(@Param('id') id: string, @Body() dto: UpdateOfficeDto) {
    return this.catalogsService.updateOffice(id, dto);
  }

  @Delete('offices/:id')
  async deleteOffice(@Param('id') id: string) {
    await this.catalogsService.deleteOffice(id);
    return { message: 'Consultorio eliminado' };
  }

  @Get('doctors')
  getDoctors() {
    return this.catalogsService.getDoctors();
  }
}
