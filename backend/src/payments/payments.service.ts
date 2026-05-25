import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(private readonly supabaseService: SupabaseService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-04-22.dahlia',
    });
  }

  async uploadReceipt(file: any) {
    const supabase = this.supabaseService.getClient();
    const fileName = `receipt_${new Date().getTime()}_${file.originalname || 'upload.jpg'}`;
    
    const { error } = await supabase.storage
      .from('payment_receipts')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new InternalServerErrorException(`Error subiendo archivo: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('payment_receipts')
      .getPublicUrl(fileName);

    return { url: publicUrl };
  }

  // 1. Tarjeta: Genera una intención de pago real en Stripe
  async createPaymentIntent(appointmentId: string, amount: number) {
    const supabase = this.supabaseService.getClient();
    
    // Verificamos que la cita exista
    const { data: app, error: appErr } = await supabase
      .from('appointments')
      .select('id, paid')
      .eq('id', appointmentId)
      .single();

    if (appErr || !app) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (app.paid) {
      throw new InternalServerErrorException('Esta cita ya está pagada');
    }

    try {
      // Creamos la intención de pago en Stripe (monto en centavos)
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: { appointmentId },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        appointmentId,
        amount,
      };
    } catch (stripeError: any) {
      console.error('Error de Stripe:', stripeError.message);
      if (stripeError.type === 'StripeAuthenticationError') {
        throw new InternalServerErrorException('Configuración de Stripe inválida. Las llaves API han expirado o son incorrectas.');
      }
      throw new InternalServerErrorException(`Error de pasarela: ${stripeError.message}`);
    }
  }

  // 2. Transferencia: El paciente reporta un pago subiendo la URL del comprobante
  async reportTransfer(appointmentId: string, amount: number, receiptUrl: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('appointment_payments')
      .insert([
        {
          appointment_id: appointmentId,
          amount,
          method: 'TRANSFER',
          status: 'PENDING',
          receipt_url: receiptUrl,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(`Error al reportar transferencia: ${error.message}`);
    }

    return data;
  }

  // 3. Confirmación: Se llama cuando el frontend confirma que Stripe procesó el cobro
  async confirmStripePayment(appointmentId: string, amount: number) {
    console.log('[ConfirmStripePayment] 🚀 Iniciando confirmación para cita:', appointmentId, 'Monto:', amount);
    const supabase = this.supabaseService.getClient();

    // 1. Evitar duplicación
    const { data: existingPay } = await supabase
      .from('appointment_payments')
      .select('*')
      .eq('appointment_id', appointmentId)
      .eq('method', 'CARD')
      .eq('status', 'COMPLETED')
      .maybeSingle();

    if (existingPay) {
      console.log('[ConfirmStripePayment] El pago ya estaba registrado como COMPLETED. Omitiendo duplicado.');
      return existingPay;
    }

    // 2. Intentar buscar la URL del recibo desde Stripe usando lista consistente sin retardo de índice
    let receiptUrl: string | null = null;
    try {
      const listResults = await this.stripe.paymentIntents.list({ limit: 30 });
      const pi = listResults.data.find(
        (item) =>
          item.metadata?.appointmentId === appointmentId &&
          item.status === 'succeeded'
      );
      if (pi && pi.latest_charge) {
        console.log('[ConfirmStripePayment] Encontrado PaymentIntent en Stripe, recuperando cargo:', pi.latest_charge);
        const charge = await this.stripe.charges.retrieve(pi.latest_charge as string);
        receiptUrl = charge?.receipt_url || null;
        console.log('[ConfirmStripePayment] Encontrado recibo en Stripe charge:', receiptUrl);
      }
    } catch (e: any) {
      console.error('[ConfirmStripePayment] Error buscando recibo en Stripe charge:', e.message);
    }

    // 3. Guardamos el pago como completado directamente
    console.log('[ConfirmStripePayment] 💾 Insertando registro de pago en DB...');
    const { data: payment, error: payErr } = await supabase
      .from('appointment_payments')
      .insert([
        {
          appointment_id: appointmentId,
          amount,
          method: 'CARD',
          status: 'COMPLETED',
          paid_at: new Date().toISOString(),
          receipt_url: receiptUrl,
        },
      ])
      .select()
      .single();

    if (payErr) {
      console.error('[ConfirmStripePayment] ❌ SUPABASE ERROR EN PAGOS:', payErr);
      throw new InternalServerErrorException(`Error confirmando pago de tarjeta: ${payErr.message}`);
    }
    console.log('[ConfirmStripePayment] ✅ Registro de pago insertado con éxito:', payment?.id);

    // 4. Actualizamos la cita a "paid = true"
    console.log('[ConfirmStripePayment] 🔄 Marcando cita como pagada (paid = true)...');
    await this.markAppointmentAsPaid(appointmentId);
    console.log('[ConfirmStripePayment] 🎉 Cita marcada como pagada con éxito.');

    return payment;
  }

  // 3b. Webhook Handler: Escucha notificaciones directas desde Stripe
  async handleStripeWebhook(signature: string, body: any, rawBody?: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event: any;

    if (webhookSecret && rawBody) {
      try {
        event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: any) {
        console.error(`❌ Error de validación de Webhook con firma:`, err.message);
        throw new InternalServerErrorException(`Webhook verification failed: ${err.message}`);
      }
    } else {
      // Fallback: procesamos el body directamente si no hay secreto o rawBody configurado
      event = body;
    }

    console.log(`[StripeWebhook] 📥 Evento recibido:`, event?.type);

    if (event?.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const appointmentId = paymentIntent.metadata?.appointmentId;
      const amount = paymentIntent.amount / 100;
      const charge = paymentIntent.charges?.data?.[0];
      const receiptUrl = charge?.receipt_url || null;

      if (appointmentId) {
        console.log(`[StripeWebhook] 🎉 Pago exitoso recibido vía Webhook para cita:`, appointmentId);
        await this.confirmStripePaymentFromWebhook(appointmentId, amount, receiptUrl);
      }
    }

    return { received: true };
  }

  private async confirmStripePaymentFromWebhook(appointmentId: string, amount: number, receiptUrl: string | null) {
    const supabase = this.supabaseService.getClient();

    // 1. Evitar duplicación
    const { data: existingPay } = await supabase
      .from('appointment_payments')
      .select('id')
      .eq('appointment_id', appointmentId)
      .eq('method', 'CARD')
      .eq('status', 'COMPLETED')
      .maybeSingle();

    if (existingPay) {
      console.log('[StripeWebhook] El pago ya estaba registrado como COMPLETED. Omitiendo duplicado.');
      return;
    }

    // 2. Guardamos el pago como completado directamente
    console.log('[StripeWebhook] 💾 Insertando registro de pago en DB desde webhook...');
    const { data: payment, error: payErr } = await supabase
      .from('appointment_payments')
      .insert([
        {
          appointment_id: appointmentId,
          amount,
          method: 'CARD',
          status: 'COMPLETED',
          paid_at: new Date().toISOString(),
          receipt_url: receiptUrl,
        },
      ])
      .select()
      .single();

    if (payErr) {
      console.error('[StripeWebhook] ❌ SUPABASE ERROR EN PAGOS DESDE WEBHOOK:', payErr);
      return;
    }
    console.log('[StripeWebhook] ✅ Registro de pago insertado con éxito:', payment?.id);

    // 3. Actualizamos la cita a "paid = true"
    await this.markAppointmentAsPaid(appointmentId);
  }

  // 4. Recepción: Confirmar un pago pendiente (Transferencia) o registrar Efectivo
  async confirmManualPayment(appointmentId: string, paymentId?: string, method: 'CASH' | 'TRANSFER' = 'CASH', amount?: number) {
    const supabase = this.supabaseService.getClient();

    if (method === 'TRANSFER' && paymentId) {
      // Actualizar pago de transferencia existente a COMPLETED
      const { data, error } = await supabase
        .from('appointment_payments')
        .update({
          status: 'COMPLETED',
          paid_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw new InternalServerErrorException(`Error confirmando transferencia: ${error.message}`);
      await this.markAppointmentAsPaid(appointmentId);
      return data;
    } else if (method === 'CASH') {
      // Registrar pago en efectivo desde cero y marcar como COMPLETED
      const { data, error } = await supabase
        .from('appointment_payments')
        .insert([
          {
            appointment_id: appointmentId,
            amount: amount || 0,
            method: 'CASH',
            status: 'COMPLETED',
            paid_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw new InternalServerErrorException(`Error registrando efectivo: ${error.message}`);
      await this.markAppointmentAsPaid(appointmentId);
      return data;
    }

    throw new InternalServerErrorException('Parámetros inválidos para confirmación manual');
  }

  private async markAppointmentAsPaid(appointmentId: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('appointments')
      .update({ paid: true })
      .eq('id', appointmentId);
      
    if (error) {
      console.error('Error actualizando estado paid de cita', error);
    }
  }
}
