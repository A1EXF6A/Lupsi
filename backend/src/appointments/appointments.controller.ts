import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { Public } from '../iam/decorators/public.decorator';
import { ActiveUser } from '../iam/interfaces/active-user.interface';

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

@UseGuards(JwtAuthGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    // req.user viene del JwtAuthGuard (Sprint 2)
    const user = req.user as ActiveUser;
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  @Get()
  async findAll(@Req() req: RequestWithUser, @Query('date') date?: string) {
    // req.user.role viene del token JWT
    const user = req.user as ActiveUser;
    return this.appointmentsService.findAll(user.id, user.role, date);
  }

  @Public()
  @Get('available-slots')
  async getAvailableSlots(
    @Query('doctorId') doctorId: string,
    @Query('date') date: string,
  ) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }
}
