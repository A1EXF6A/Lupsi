import { Component, inject, OnInit, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentsService } from '../../core/services/payments.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-pagos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-6 flex flex-col items-center">
      <div class="w-full max-w-3xl">
        <button (click)="goBack()" class="mb-6 flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Volver a Mis Citas
        </button>
        
        <div class="bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-4 sm:p-8 overflow-hidden relative">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
          <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
 
          <div class="relative z-10">
            <h2 class="text-4xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
              {{ appointmentType }}
            </h2>
            <p *ngIf="specialty" class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{{ specialty }}</p>
            <p class="text-slate-500 mb-8 font-medium">Selecciona el método de pago para la cita <span class="font-bold text-slate-700">#{{appointmentId?.substring(0,8)}}</span></p>
 
            <!-- Success View -->
            <div *ngIf="success" class="animate-fade-in-up text-center py-10">
              <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 class="text-3xl font-black text-slate-900 mb-2">¡Pago Exitoso!</h3>
              <p class="text-slate-500 mb-8 font-medium">Tu cita ha sido confirmada y pagada correctamente.</p>
              <button (click)="goBack()" class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl">
                Volver a Mis Citas
              </button>
            </div>
 
            <!-- Payment Content (Hidden on Success) -->
            <div *ngIf="!success">
              <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-4 sm:p-8 text-white shadow-2xl mb-8 flex flex-col md:flex-row justify-between items-center transform transition hover:scale-[1.01] border border-white/10">
                <div>
                  <p class="text-emerald-400/80 text-sm font-bold uppercase tracking-widest mb-1">Total a Pagar</p>
                  <p class="text-5xl font-black tracking-tighter">\${{ appointmentPrice | number:'1.2-2' }} <span class="text-xl font-medium text-slate-400">USD</span></p>
                </div>
                <div class="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                </div>
              </div>
 
              <!-- Error Banner -->
              <div *ngIf="errorMessage" class="mb-8 p-5 bg-rose-50 border-l-4 border-rose-500 rounded-xl flex items-center gap-4 text-rose-700 animate-fade-in-up shadow-sm">
                <div class="bg-rose-500 text-white p-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
                <p class="text-sm font-bold">{{errorMessage}}</p>
              </div>
 
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button 
                  (click)="selectPaymentMethod('CARD')" 
                  [class.ring-4]="paymentMethod === 'CARD'"
                  [class.ring-emerald-500]="paymentMethod === 'CARD'"
                  [class.border-emerald-200]="paymentMethod === 'CARD'"
                  [class.bg-emerald-50]="paymentMethod === 'CARD'"
                  class="relative overflow-hidden group p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-300 transition-all text-left flex flex-col gap-4 shadow-sm hover:shadow-md">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  </div>
                  <div>
                    <h3 class="font-black text-xl text-slate-800">Tarjeta de Crédito</h3>
                    <p class="text-sm text-slate-500 font-medium">Pago instantáneo seguro</p>
                  </div>
                  <div *ngIf="paymentMethod === 'CARD'" class="absolute top-6 right-6 text-emerald-600">
                    <div class="bg-emerald-100 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                </button>
 
                <button 
                  (click)="selectPaymentMethod('TRANSFER')" 
                  [class.ring-4]="paymentMethod === 'TRANSFER'"
                  [class.ring-emerald-500]="paymentMethod === 'TRANSFER'"
                  [class.border-emerald-200]="paymentMethod === 'TRANSFER'"
                  [class.bg-emerald-50]="paymentMethod === 'TRANSFER'"
                  class="relative overflow-hidden group p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-emerald-300 transition-all text-left flex flex-col gap-4 shadow-sm hover:shadow-md">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <h3 class="font-black text-xl text-slate-800">Transferencia</h3>
                    <p class="text-sm text-slate-500 font-medium">Depósito bancario directo</p>
                  </div>
                  <div *ngIf="paymentMethod === 'TRANSFER'" class="absolute top-6 right-6 text-emerald-600">
                    <div class="bg-emerald-100 p-1 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  </div>
                </button>
              </div>
 
              <!-- Card UI -->
              <div *ngIf="paymentMethod === 'CARD'" class="animate-fade-in-up">
                <div class="mb-8">
                  <label class="block text-sm font-bold text-slate-700 mb-3 ml-1">Detalles de la Tarjeta</label>
<div class="flex flex-col gap-4 sm:gap-6 w-full">
                      <div id="card-element" class="p-3 xs:p-4 sm:p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus-within:border-emerald-400 transition-colors min-h-[44px]"></div>
                      <div id="card-errors" role="alert" class="text-rose-500 text-xs mt-3 font-bold flex items-center gap-1"></div>
                    </div>
                </div>
 
                <button (click)="payWithStripe()" [disabled]="loading" class="group w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95">
                  <span class="flex items-center justify-center gap-3">
                    <svg *ngIf="!loading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <svg *ngIf="loading" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                    {{ loading ? 'Procesando Pago...' : 'Pagar $' + (appointmentPrice | number:'1.2-2') + ' Ahora' }}
                  </span>
                </button>
                <p class="text-center text-slate-400 text-xs mt-6 font-medium flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Tus datos están protegidos con encriptación de grado bancario (AES-256)
                </p>
              </div>
 
              <!-- Transfer UI -->
              <div *ngIf="paymentMethod === 'TRANSFER'" class="animate-fade-in-up">
                <div class="bg-gradient-to-br from-white to-slate-50 p-4 sm:p-8 rounded-3xl border-2 border-emerald-100 shadow-xl shadow-emerald-50/50 mb-8 relative overflow-hidden">
                  <div class="absolute -top-6 -right-6 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl"></div>
                  
                  <div class="flex items-center gap-8 mb-10">
                    <div class="w-36 h-24 xs:w-44 xs:h-24 sm:w-60 sm:h-32 bg-white rounded-3xl p-4 shadow-lg border border-slate-100 flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform shadow-emerald-100/20">
                      <img src="/official-pichincha-logo.png" alt="Banco Pichincha" class="w-full h-full object-contain">
                    </div>
                    <div>
                      <h4 class="font-black text-3xl text-slate-900 mb-2">Banco Pichincha</h4>
                      <div class="inline-flex items-center px-4 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 uppercase tracking-widest shadow-sm">Cuenta Ahorros</div>
                    </div>
                  </div>
 
                  <div class="space-y-4 relative z-10">
                    <div class="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white">
                      <span class="text-slate-500 font-bold text-sm">N° Cuenta Ahorros</span>
                      <span class="text-slate-900 font-black text-lg tracking-wider">210084532</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white">
                      <span class="text-slate-500 font-bold text-sm">Titular</span>
                      <span class="text-slate-900 font-black">Clínica Lupsi S.A.</span>
                    </div>
                    <div class="flex justify-between items-center p-4 bg-white/50 rounded-2xl border border-white">
                      <span class="text-slate-500 font-bold text-sm">RUC</span>
                      <span class="text-slate-900 font-mono font-bold">1790000000001</span>
                    </div>
                  </div>
                </div>
 
                <div class="mb-8">
                  <label class="block text-sm font-bold text-slate-700 mb-3 ml-1">Sube tu comprobante de pago</label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <input type="file" accept="image/*" (change)="onFileSelected($event)" 
                      class="block w-full text-sm text-slate-500 bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4
                      file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black 
                      file:bg-slate-900 file:text-white hover:file:bg-slate-700 cursor-pointer focus:outline-none transition-all hover:border-emerald-200 shadow-sm"/>
                  </div>
                </div>
                
                <button (click)="uploadReceiptAndReport()" [disabled]="!selectedFile || loading" class="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 active:scale-95">
                  <span class="flex items-center justify-center gap-3">
                    <svg *ngIf="!loading" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>
                    {{ loading ? 'Enviando Comprobante...' : 'Enviar Comprobante' }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 7s infinite; }
    .animation-delay-2000 { animation-delay: 2s; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
  `]
})
export class PagosPacienteComponent implements OnInit {
  private paymentsService = inject(PaymentsService);
  private appointmentsService = inject(AppointmentsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  
  paymentMethod: 'CARD' | 'TRANSFER' | null = null;
  loading = false;
  success = false;
  selectedFile: File | null = null;
  appointmentId: string | null = null;
  errorMessage: string | null = null;

  appointmentPrice = 15.00;
  appointmentType = 'Consulta Médica';
  specialty = '';
 
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
 
  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.appointmentId = params['appointmentId'];
      if (!this.appointmentId) {
        this.goBack();
        return;
      }
      this.loadAppointmentDetails();
    });
 
    try {
      this.stripe = await loadStripe(environment.stripePublicKey);
      if (this.stripe) {
        this.elements = this.stripe.elements();
        this.cardElement = this.elements.create('card', {
          style: {
            base: { fontSize: '16px', color: '#32325d', fontFamily: '"Inter", sans-serif' },
            invalid: { color: '#fa755a' },
          }
        });
      }
    } catch (e) {
      this.errorMessage = 'Error al cargar la pasarela de pagos.';
    }
  }

  async loadAppointmentDetails() {
    if (!this.appointmentId) return;
    try {
      const apt = await lastValueFrom(this.appointmentsService.getAppointment(this.appointmentId));
      this.ngZone.run(() => {
        this.appointmentPrice = apt.price ? Number(apt.price) : 15.00;
        this.appointmentType = apt.appointment_type || 'Consulta Médica';
        this.specialty = apt.specialty || '';
        this.cdr.detectChanges();
      });
    } catch (err) {
      console.error('Error loading appointment details:', err);
    }
  }
 
  selectPaymentMethod(method: 'CARD' | 'TRANSFER') {
    this.paymentMethod = method;
    this.errorMessage = null;
    if (method === 'CARD') {
      setTimeout(() => this.cardElement?.mount('#card-element'), 50);
    }
  }
 
  goBack() { this.router.navigate(['/portal-paciente/mis-citas']); }
 
  onFileSelected(event: any) { this.selectedFile = event.target.files[0]; }
 
  async payWithStripe() {
    if (!this.appointmentId || !this.stripe || !this.cardElement) return;
    
    this.loading = true;
    this.errorMessage = null;
 
    try {
      const res = await lastValueFrom(this.paymentsService.createIntent(this.appointmentId, this.appointmentPrice));
      const result = await this.stripe.confirmCardPayment(res.clientSecret, {
        payment_method: { card: this.cardElement }
      });
 
      if (result.error) {
        this.ngZone.run(() => {
          this.errorMessage = result.error.message || 'Error en la tarjeta';
          this.loading = false;
          this.cdr.detectChanges();
        });
        return;
      }
 
      console.log('Pago exitoso en Stripe, confirmando en backend...');
      const response = await lastValueFrom(this.paymentsService.confirmStripePayment(this.appointmentId, this.appointmentPrice));
      console.log('🎉 Respuesta recibida del backend con éxito:', response);
      
      this.ngZone.run(() => {
        this.success = true;
        this.cdr.detectChanges();
      });
    } catch (e: any) {
      console.error('❌ ERROR COMPLETO EN PAGO:', e);
      this.ngZone.run(() => {
        this.errorMessage = e.error?.message || e.message || 'Error de conexión con el servidor';
        this.cdr.detectChanges();
      });
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }
 
  async uploadReceiptAndReport() {
    if (!this.selectedFile || !this.appointmentId) return;
    this.loading = true;
    try {
      const publicUrl = await this.paymentsService.uploadReceipt(this.selectedFile);
      await lastValueFrom(this.paymentsService.reportTransfer(this.appointmentId, this.appointmentPrice, publicUrl));
      this.ngZone.run(() => {
        this.success = true;
        this.cdr.detectChanges();
      });
    } catch (e: any) {
      this.ngZone.run(() => {
        this.errorMessage = 'Error al subir comprobante. Revisa tu conexión.';
        this.cdr.detectChanges();
      });
    } finally {
      this.ngZone.run(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }
}
