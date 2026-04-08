import { Controller, Get } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { Public } from '../iam/decorators/public.decorator';

@Public()
@Controller('api/v1/catalogs')
export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Get('specialties')
  getSpecialties() {
    return this.catalogsService.getSpecialties();
  }

  @Get('appointment-types')
  getAppointmentTypes() {
    return this.catalogsService.getAppointmentTypes();
  }

  @Get('offices')
  getOffices() {
    return this.catalogsService.getOffices();
  }
}
