import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Req,
  UseGuards,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { Public } from '../iam/decorators/public.decorator';
import { Permissions } from '../iam/decorators/permissions.decorator';
import { Permission } from '../iam/enums/permission.enum';
import { ActiveUser } from '../iam/interfaces/active-user.interface';

interface RequestWithUser extends Request {
  user?: ActiveUser;
}

@UseGuards(JwtAuthGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Permissions(Permission.APPOINTMENTS_CREATE)
  async create(
    @Req() req: RequestWithUser,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    // req.user viene del JwtAuthGuard (Sprint 2)
    const user = req.user as ActiveUser;
    return this.appointmentsService.create(user.id, createAppointmentDto);
  }

  @Get()
  @Permissions(
    Permission.APPOINTMENTS_READ_SELF,
    Permission.APPOINTMENTS_READ_ASSIGNED,
    Permission.APPOINTMENTS_READ_ALL,
  )
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

  @Post('available-slots')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  async createAvailableSlot(
    @Body('doctor_id') doctorId: string,
    @Body('start_time') startTime: string,
    @Body('end_time') endTime: string,
  ) {
    return this.appointmentsService.createAvailableSlot(
      doctorId,
      startTime,
      endTime,
    );
  }

  @Put('available-slots/:id')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  async updateAvailableSlot(
    @Param('id') id: string,
    @Body('start_time') startTime: string,
    @Body('end_time') endTime: string,
  ) {
    return this.appointmentsService.updateAvailableSlot(id, startTime, endTime);
  }

  @Delete('available-slots/:id')
  @Permissions(Permission.APPOINTMENTS_DELETE)
  async deleteAvailableSlot(@Param('id') id: string) {
    await this.appointmentsService.deleteAvailableSlot(id);
    return { message: 'Disponibilidad eliminada' };
  }

  @Put(':id')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  async updateAppointment(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateAppointment(id, dto);
  }

  @Delete(':id')
  @Permissions(Permission.APPOINTMENTS_DELETE)
  async deleteAppointment(@Param('id') id: string) {
    await this.appointmentsService.deleteAppointment(id);
    return { message: 'Cita eliminada' };
  }

  @Get(':id/reminders')
  @Permissions(
    Permission.APPOINTMENTS_READ_SELF,
    Permission.APPOINTMENTS_READ_ASSIGNED,
  )
  getReminders(@Param('id') appointmentId: string) {
    return this.appointmentsService.getReminders(appointmentId);
  }

  @Post(':id/reminders')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  createReminder(
    @Param('id') appointmentId: string,
    @Body('reminder_time') reminderTime: string,
    @Body('channel') channel?: string,
    @Body('status') status?: string,
  ) {
    return this.appointmentsService.createReminder(
      appointmentId,
      reminderTime,
      channel,
      status,
    );
  }

  @Put(':id/reminders/:reminderId')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  updateReminder(
    @Param('reminderId') reminderId: string,
    @Body('reminder_time') reminderTime?: string,
    @Body('channel') channel?: string,
    @Body('status') status?: string,
  ) {
    return this.appointmentsService.updateReminder(
      reminderId,
      reminderTime,
      channel,
      status,
    );
  }

  @Delete(':id/reminders/:reminderId')
  @Permissions(Permission.APPOINTMENTS_DELETE)
  async deleteReminder(@Param('reminderId') reminderId: string) {
    await this.appointmentsService.deleteReminder(reminderId);
    return { message: 'Recordatorio eliminado' };
  }

  @Get(':id/prescription')
  @Permissions(
    Permission.APPOINTMENTS_READ_SELF,
    Permission.APPOINTMENTS_READ_ASSIGNED,
  )
  getPrescription(@Param('id') appointmentId: string) {
    return this.appointmentsService.getPrescription(appointmentId);
  }

  @Post(':id/prescription')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  createPrescription(
    @Param('id') appointmentId: string,
    @Body('patient_id') patientId: string,
    @Body('doctor_id') doctorId: string,
    @Body('notes') notes?: string,
    @Body('medications') medications?: Record<string, unknown>[],
  ) {
    return this.appointmentsService.createPrescription(
      appointmentId,
      patientId,
      doctorId,
      notes,
      medications,
    );
  }

  @Put(':id/prescription/:prescriptionId')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  updatePrescription(
    @Param('prescriptionId') prescriptionId: string,
    @Body('notes') notes?: string,
    @Body('medications') medications?: Record<string, unknown>[],
  ) {
    return this.appointmentsService.updatePrescription(
      prescriptionId,
      notes,
      medications,
    );
  }

  @Delete(':id/prescription/:prescriptionId')
  @Permissions(Permission.APPOINTMENTS_DELETE)
  async deletePrescription(@Param('prescriptionId') prescriptionId: string) {
    await this.appointmentsService.deletePrescription(prescriptionId);
    return { message: 'Receta eliminada' };
  }

  @Get(':id/payments')
  @Permissions(
    Permission.APPOINTMENTS_READ_SELF,
    Permission.APPOINTMENTS_READ_ASSIGNED,
  )
  getPayments(@Param('id') appointmentId: string) {
    return this.appointmentsService.getPayments(appointmentId);
  }

  @Post(':id/payments')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  createPayment(
    @Param('id') appointmentId: string,
    @Body('amount') amount: number,
    @Body('method') method?: string,
    @Body('status') status?: string,
    @Body('paid_at') paidAt?: string,
  ) {
    return this.appointmentsService.createPayment(
      appointmentId,
      amount,
      method,
      status,
      paidAt,
    );
  }

  @Put(':id/payments/:paymentId')
  @Permissions(Permission.APPOINTMENTS_UPDATE)
  updatePayment(
    @Param('paymentId') paymentId: string,
    @Body('amount') amount?: number,
    @Body('method') method?: string,
    @Body('status') status?: string,
    @Body('paid_at') paidAt?: string,
  ) {
    return this.appointmentsService.updatePayment(
      paymentId,
      amount,
      method,
      status,
      paidAt,
    );
  }

  @Delete(':id/payments/:paymentId')
  @Permissions(Permission.APPOINTMENTS_DELETE)
  async deletePayment(@Param('paymentId') paymentId: string) {
    await this.appointmentsService.deletePayment(paymentId);
    return { message: 'Pago eliminado' };
  }
}
