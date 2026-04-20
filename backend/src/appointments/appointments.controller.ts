import { Controller, Post, Body, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { Public } from '../iam/decorators/public.decorator';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    // req.user viene del JwtAuthGuard (Sprint 2)
    const patientId = req.user.sub || req.user.id;
    return this.appointmentsService.create(patientId, createAppointmentDto);
  }

  @Get()
  async findAll(@Req() req, @Query('date') date?: string) {
    // req.user.role viene del token JWT
    const userId = req.user.sub || req.user.id;
    const role = req.user.role || 'PATIENT'; 
    return this.appointmentsService.findAll(userId, role, date);
  }

  @Public()
  @Get('available-slots')
  async getAvailableSlots(@Query('doctorId') doctorId: string, @Query('date') date: string) {
    return this.appointmentsService.getAvailableSlots(doctorId, date);
  }
}
