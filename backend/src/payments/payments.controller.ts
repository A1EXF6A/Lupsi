import { Controller, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, Headers, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../iam/guards/jwt-auth.guard';
import { PaymentIntentDto, TransferPaymentDto, ConfirmManualPaymentDto } from './dto/payment.dto';

@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  async createIntent(@Body() body: PaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(body.appointmentId, body.amount);
  }

  @Post('upload-receipt')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadReceipt(@UploadedFile() file: any) {
    return this.paymentsService.uploadReceipt(file);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  async reportTransfer(@Body() body: TransferPaymentDto) {
    return this.paymentsService.reportTransfer(body.appointmentId, body.amount, body.receiptUrl);
  }

  @Post('card/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmStripePayment(@Body() body: PaymentIntentDto) {
    console.log('[PaymentsController] 📥 Recibida solicitud POST /card/confirm con cuerpo:', body);
    try {
      const result = await this.paymentsService.confirmStripePayment(body.appointmentId, body.amount);
      console.log('[PaymentsController] 📤 Envío exitoso de respuesta confirmación:', result);
      return result;
    } catch (error: any) {
      console.error('[PaymentsController] ❌ Error procesando confirmación de tarjeta:', error.message || error);
      throw error;
    }
  }

  @Post('manual/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmManual(@Body() body: ConfirmManualPaymentDto) {
    // En producción esto tendría un RoleGuard para verificar que es ADMIN/RECEPTIONIST
    return this.paymentsService.confirmManualPayment(body.appointmentId, body.paymentId, body.method, body.amount);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
    @Req() req: any
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(body));
    return this.paymentsService.handleStripeWebhook(signature, body, rawBody);
  }
}
