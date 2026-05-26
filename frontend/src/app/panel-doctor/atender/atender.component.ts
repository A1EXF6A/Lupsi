import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';
import {
  ClinicalAttentionsService,
  ClinicalAttention,
} from '../../core/services/clinical-attentions.service';
import { ClinicalHistoryService } from '../../core/services/clinical-history.service';

type PrescriptionMedication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
};

@Component({
  selector: 'app-atender',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 text-white flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
            <path d="M12 18v-6M9 15h6"/>
          </svg>
        </div>
        <div>
          <h2 class="text-3xl font-black text-slate-800 tracking-tight">Atender Consulta Médica</h2>
          <p class="text-slate-500 font-medium text-sm mt-1">Registra la atención clínica, signos vitales y receta de tus pacientes.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Columna Izquierda: Listado de Citas -->
        <div class="xl:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-800 text-base">Citas del día</h3>
            <button
              (click)="loadAppointments()"
              class="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-all"
            >
              Actualizar
            </button>
          </div>

          <div class="mb-4">
            <input
              type="date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="loadAppointments()"
              class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-slate-700 font-medium"
            />
          </div>

          <div *ngIf="isLoading" class="flex-1 flex flex-col items-center justify-center text-slate-400">
            <svg class="animate-spin h-8 w-8 text-green-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium">Buscando citas...</span>
          </div>

          <div *ngIf="!isLoading && appointments.length === 0" class="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <svg class="w-12 h-12 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm font-semibold">No hay citas en esta fecha</span>
          </div>

          <div class="flex-1 overflow-y-auto space-y-3 pr-1" *ngIf="!isLoading && appointments.length > 0">
            <button
              *ngFor="let app of appointments"
              (click)="selectAppointment(app)"
              [class.ring-2]="selectedAppointment?.id === app.id"
              [class.ring-green-500]="selectedAppointment?.id === app.id"
              [class.bg-green-50]="selectedAppointment?.id === app.id"
              [class.border-green-200]="selectedAppointment?.id === app.id"
              class="w-full text-left p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200 transition-all shadow-sm flex flex-col gap-2"
            >
              <div class="flex items-center justify-between w-full">
                <div class="text-sm font-black text-slate-800">
                  {{ app.appointment_time | date: 'HH:mm' }}
                </div>
                <span
                  class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                  [ngClass]="{
                    'bg-amber-100 text-amber-800': app.status === 'SCHEDULED',
                    'bg-green-100 text-green-800': app.status === 'COMPLETED',
                    'bg-rose-100 text-rose-800': app.status === 'CANCELLED'
                  }"
                >
                  {{
                    app.status === 'SCHEDULED' ? 'Programada' :
                    app.status === 'COMPLETED' ? 'Completada' :
                    app.status === 'CANCELLED' ? 'Cancelada' : 'Programada'
                  }}
                </span>
              </div>
              <div class="text-xs font-semibold text-slate-600">
                Paciente: {{ app.patients?.first_name }} {{ app.patients?.last_name }}
              </div>
            </button>
          </div>
        </div>

        <!-- Columna Derecha: Ficha Clínica y Formulario -->
        <div class="xl:col-span-2 space-y-6">
          <div
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center justify-center text-center min-h-[500px]"
            *ngIf="!selectedAppointment"
          >
            <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h4 class="font-bold text-slate-700 text-base">Esperando selección</h4>
            <p class="text-slate-400 text-sm max-w-sm mt-1">Selecciona una cita de la lista izquierda para comenzar a registrar la atención médica.</p>
          </div>

          <div
            *ngIf="selectedAppointment && selectedAppointment.status !== 'CANCELLED'"
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6 animate-fade-in-up"
          >
            <!-- Cabecera de la Ficha Clínica -->
            <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span class="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-wider">Historial en Curso</span>
                <h3 class="text-2xl font-black text-slate-800 tracking-tight mt-1">
                  {{ selectedAppointment.patients?.first_name }} {{ selectedAppointment.patients?.last_name }}
                </h3>
              </div>
              <div class="text-right">
                <p class="text-xs font-semibold text-slate-400">Fecha y Hora de la cita</p>
                <p class="text-sm font-bold text-slate-700 mt-0.5">
                  {{ selectedAppointment.appointment_time | date: 'fullDate' }} a las {{ selectedAppointment.appointment_time | date: 'HH:mm' }}
                </p>
              </div>
            <!-- Pestañas de Navegación del Panel -->
            <div class="flex border-b border-slate-100 gap-6 mt-4">
              <button
                (click)="activeTab = 'ficha'"
                [class.border-green-600]="activeTab === 'ficha'"
                [class.text-green-600]="activeTab === 'ficha'"
                [class.border-transparent]="activeTab !== 'ficha'"
                [class.text-slate-400]="activeTab !== 'ficha'"
                class="pb-3 border-b-2 font-bold text-sm tracking-tight transition-all focus:outline-none"
              >
                Ficha de Consulta Activa
              </button>
              <button
                (click)="activeTab = 'historial'"
                [class.border-green-600]="activeTab === 'historial'"
                [class.text-green-600]="activeTab === 'historial'"
                [class.border-transparent]="activeTab !== 'historial'"
                [class.text-slate-400]="activeTab !== 'historial'"
                class="pb-3 border-b-2 font-bold text-sm tracking-tight transition-all focus:outline-none flex items-center gap-1.5"
              >
                <span>Historial del Paciente</span>
                <span class="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {{ pastAttentions.length }}
                </span>
              </button>
            </div>

            <!-- Ficha de Consulta Activa -->
            <div *ngIf="activeTab === 'ficha'" class="space-y-6 mt-6">
              <!-- Panel Informativo de Pago (Exclusivo para el médico) -->
            <div 
              [ngClass]="{
                'bg-emerald-50/70 border-emerald-100 text-emerald-800': isPaymentPaid,
                'bg-amber-50/70 border-amber-100 text-amber-800': !isPaymentPaid
              }"
              class="flex items-center gap-4 p-4 rounded-2xl border transition-all"
            >
              <div 
                [ngClass]="{
                  'bg-emerald-500 shadow-emerald-100': isPaymentPaid,
                  'bg-amber-500 shadow-amber-100': !isPaymentPaid
                }"
                class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
              >
                <!-- Shield Check Icon for Paid -->
                <svg *ngIf="isPaymentPaid" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 11 11 13 15 9"/>
                </svg>
                <!-- Alert Icon for Unpaid -->
                <svg *ngIf="!isPaymentPaid" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Estado del Pago</p>
                <p class="text-sm font-black mt-0.5">
                  {{ isPaymentPaid ? '✅ COMPROBADO - CITA PAGADA' : '⚠️ PAGO PENDIENTE - EL PAGO DE ESTA CITA AÚN NO HA SIDO REGISTRADO' }}
                </p>
              </div>
            </div>

            <!-- Sección: Signos Vitales Premium -->
            <div class="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-4">
              <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"/>
                </svg>
                Signos Vitales del Paciente
              </h4>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Peso (kg)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.peso"
                    placeholder="Ej: 70"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Talla (cm)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.talla"
                    placeholder="Ej: 175"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Presión (mmHg)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.presion"
                    placeholder="Ej: 120/80"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Temperatura (°C)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.temperatura"
                    placeholder="Ej: 36.5"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frec. Cardíaca (lpm)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.pulso"
                    placeholder="Ej: 75"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frec. Resp. (rpm)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.respiracion"
                    placeholder="Ej: 16"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
                <div class="bg-white p-3.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sat. Oxígeno (%)</label>
                  <input
                    type="text"
                    [(ngModel)]="vitals.saturacion"
                    placeholder="Ej: 98"
                    class="w-full text-sm font-bold text-slate-800 border-none p-0 focus:outline-none focus:ring-0 placeholder-slate-300"
                  />
                </div>
              </div>
            </div>

            <!-- Campos Principales de Atención -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="md:col-span-1 flex flex-col">
                <label class="text-xs font-bold text-slate-500 mb-1.5 px-0.5">Notas / Antecedentes</label>
                <textarea
                  [(ngModel)]="attentionForm.notes"
                  rows="5"
                  placeholder="Escribe notas clínicas, antecedentes médicos o síntomas iniciales..."
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400 flex-1 resize-none"
                ></textarea>
              </div>
              <div class="md:col-span-1 flex flex-col space-y-3">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-slate-500 px-0.5">Diagnóstico Clínico</label>
                  <span *ngIf="isControlAppointment" class="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded uppercase tracking-wider">
                    Control Activo
                  </span>
                </div>
                
                <!-- 1. El Diagnóstico se Hereda (Lectura) -->
                <div *ngIf="isControlAppointment && previousDiagnosis" class="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/30 space-y-2.5">
                  <div class="flex items-center gap-1.5 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span class="text-[9px] font-black uppercase tracking-wider">Diagnóstico de Seguimiento</span>
                  </div>
                  <p class="text-xs font-bold text-slate-800 leading-relaxed bg-white px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-sm">
                    {{ previousDiagnosis }}
                  </p>
                  
                  <!-- Acción Rápida: Evolucionar Diagnóstico -->
                  <div class="flex gap-2">
                    <button
                      type="button"
                      (click)="evolucionarDiagnostico()"
                      class="text-[9px] font-black bg-white text-blue-600 hover:bg-blue-100/50 hover:text-blue-750 px-2.5 py-1.5 rounded-lg border border-blue-100 shadow-sm transition-all flex items-center gap-1 focus:outline-none"
                    >
                      📝 Evolucionar Diagnóstico
                    </button>
                    <button
                      *ngIf="attentionForm.diagnosis"
                      type="button"
                      (click)="attentionForm.diagnosis = ''"
                      class="text-[9px] font-black bg-slate-100 text-slate-500 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-all focus:outline-none"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <textarea
                  [(ngModel)]="attentionForm.diagnosis"
                  rows="4"
                  [placeholder]="isControlAppointment ? 'Opcional. Registra cambios de estado o agrega nuevos diagnósticos por complicaciones...' : 'Ingresa el diagnóstico formal de la consulta médica...'"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400 flex-1 resize-none"
                ></textarea>
              </div>
              <div class="md:col-span-1 flex flex-col">
                <label class="text-xs font-bold text-slate-500 mb-1.5 px-0.5">Plan de Tratamiento</label>
                <textarea
                  [(ngModel)]="attentionForm.treatment"
                  rows="5"
                  placeholder="Detalla las recomendaciones médicas, cuidados y pasos a seguir..."
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-slate-700 placeholder-slate-400 flex-1 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Receta Médica Flexible -->
            <div class="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 space-y-4">
              <h4 class="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z"/>
                </svg>
                Receta Médica y Prescripciones
              </h4>

              <!-- Tratamiento Anterior (Modo Control) -->
              <div *ngIf="isControlAppointment && previousPrescription" class="bg-blue-50/40 p-5 rounded-2xl border border-blue-100/30 space-y-3">
                <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-100/30">
                  <div class="flex items-center gap-2 text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-xs font-black uppercase tracking-wider">Receta de Tratamiento Anterior (Historial)</span>
                  </div>
                  <button
                    type="button"
                    (click)="copiarRecetaAnterior()"
                    class="text-xs font-black bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center gap-1.5 focus:outline-none"
                  >
                    🔄 Copiar Receta Anterior (Mantener Tratamiento)
                  </button>
                </div>

                <!-- Detalle de Medicamentos Anteriores -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div 
                    *ngFor="let med of previousPrescription.medications" 
                    class="bg-white px-3.5 py-2.5 rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-slate-700"
                  >
                    <span class="text-slate-800 font-black block">{{ med.name }}</span>
                    <span class="text-slate-400 font-medium block mt-0.5">
                      Dosis: {{ med.dosage }} | ⏱️ {{ med.frequency }} | 📅 {{ med.duration }}
                    </span>
                  </div>
                </div>

                <div *ngIf="previousPrescription.notes" class="text-xs font-semibold text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-slate-100">
                  💡 <span class="font-bold text-slate-400">Instrucciones anteriores:</span> {{ previousPrescription.notes }}
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="md:col-span-1">
                  <label class="block text-[11px] font-bold text-slate-500 mb-1">Nombre del Medicamento</label>
                  <input
                    [(ngModel)]="customMedicationName"
                    type="text"
                    placeholder="Ej: Paracetamol 500mg"
                    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 mb-1">Dosis</label>
                  <input
                    [(ngModel)]="medicationForm.dosage"
                    type="text"
                    placeholder="Ej: 1 tableta"
                    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 mb-1">Frecuencia</label>
                  <input
                    [(ngModel)]="medicationForm.frequency"
                    type="text"
                    placeholder="Ej: Cada 8 horas"
                    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-500 mb-1">Duración</label>
                  <input
                    [(ngModel)]="medicationForm.duration"
                    type="text"
                    placeholder="Ej: Por 5 días"
                    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-700 font-medium"
                  />
                </div>
              </div>

              <div class="pt-1">
                <button
                  (click)="addMedication()"
                  class="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.98] flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                  Agregar a Receta
                </button>
              </div>

              <!-- Listado de Medicamentos Agregados -->
              <div *ngIf="prescriptionMedications.length > 0" class="mt-4 space-y-2.5">
                <div
                  *ngFor="let med of prescriptionMedications; let i = index"
                  class="p-3.5 border border-slate-200/70 rounded-xl bg-white flex items-center justify-between shadow-sm transition-all"
                >
                  <div>
                    <div class="text-sm font-black text-slate-800">{{ med.name }}</div>
                    <div class="text-xs text-slate-500 font-medium mt-0.5">
                      Dosis: {{ med.dosage }} | Frecuencia: {{ med.frequency }} | Duración: {{ med.duration }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="editarMedication(i)"
                      class="text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition-all focus:outline-none"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      type="button"
                      (click)="removeMedication(i)"
                      class="text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-all focus:outline-none"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>

              <div class="mt-4 pt-2">
                <label class="block text-xs font-bold text-slate-500 mb-1.5 px-0.5">Notas adicionales de la receta</label>
                <textarea
                  [(ngModel)]="prescriptionNotes"
                  rows="3"
                  placeholder="Recomendaciones generales, tomas con alimentos, etc..."
                  class="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-700 placeholder-slate-400"
                ></textarea>
              </div>
            </div>

            <!-- Botones de Acción Final -->
            <div class="pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                (click)="saveAttention()"
                [disabled]="isSaving"
                class="px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-green-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.99] flex items-center gap-2"
              >
                <span *ngIf="!isSaving">Guardar Ficha y Completar Consulta</span>
                <span *ngIf="isSaving" class="flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando consulta...
                </span>
              </button>
              <span *ngIf="saveMessage" class="text-sm font-bold text-green-700 bg-green-50 px-4 py-2 rounded-xl border border-green-100 animate-pulse">
                {{ saveMessage }}
              </span>
            </div>
            </div> <!-- Cierre de Ficha de Consulta Activa -->

            <!-- Línea de Tiempo del Historial del Paciente -->
            <div *ngIf="activeTab === 'historial'" class="space-y-6 mt-6 animate-fade-in">
              <div *ngIf="pastAttentions.length === 0" class="text-center py-12 text-slate-400">
                <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h5 class="font-bold text-slate-700 text-sm">Sin consultas previas</h5>
                <p class="text-slate-400 text-xs mt-1">Este paciente no registra atenciones anteriores en el sistema de LUPSI.</p>
              </div>

              <div *ngIf="pastAttentions.length > 0" class="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
                <div *ngFor="let att of pastAttentions" class="relative">
                  <!-- Icono de punto en la línea de tiempo -->
                  <span class="absolute -left-[31px] top-1.5 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm ring-2 ring-slate-100"></span>
                  
                  <div class="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 transition-all">
                    <!-- Cabecera de la Cita de Historial -->
                    <div class="flex flex-wrap justify-between items-center gap-2">
                      <div>
                        <span class="text-xs font-bold text-slate-500 bg-slate-200/50 px-2.5 py-1 rounded-lg">
                          {{ att.created_at | date: 'mediumDate' }} a las {{ att.created_at | date: 'HH:mm' }}
                        </span>
                        <h5 class="text-sm font-black text-slate-700 mt-2 flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Atendido por: {{ att.doctors?.profiles?.first_name ? ('Dr/Dra. ' + att.doctors.profiles.first_name + ' ' + att.doctors.profiles.last_name) : 'Especialista LUPSI' }}
                        </h5>
                      </div>
                    </div>

                    <!-- Signos Vitales Históricos -->
                    <div *ngIf="att.vitals" class="bg-white p-3.5 border border-slate-200/50 rounded-xl">
                      <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Signos vitales registrados</p>
                      <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600 font-semibold">
                        <span *ngIf="att.vitals.peso" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">⚖️ Peso: {{ att.vitals.peso }}</span>
                        <span *ngIf="att.vitals.talla" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">📏 Talla: {{ att.vitals.talla }}</span>
                        <span *ngIf="att.vitals.presion" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">🩺 Presión: {{ att.vitals.presion }}</span>
                        <span *ngIf="att.vitals.temperatura" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">🌡️ Temp: {{ att.vitals.temperatura }}</span>
                        <span *ngIf="att.vitals.pulso" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">💓 Pulso: {{ att.vitals.pulso }}</span>
                        <span *ngIf="att.vitals.respiracion" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">🫁 Resp: {{ att.vitals.respiracion }}</span>
                        <span *ngIf="att.vitals.saturacion" class="bg-slate-50 px-2 py-1 rounded border border-slate-100">🩸 Sat. O₂: {{ att.vitals.saturacion }}</span>
                      </div>
                    </div>

                    <!-- Diagnóstico, Plan y Notas -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
                      <div class="bg-white p-3 rounded-xl border border-slate-100">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notas / Antecedentes</label>
                        <p class="text-slate-700 whitespace-pre-wrap leading-relaxed">{{ att.notes || 'Sin anotaciones' }}</p>
                      </div>
                      <div class="bg-white p-3 rounded-xl border border-slate-100">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Diagnóstico</label>
                        <p class="text-slate-700 whitespace-pre-wrap leading-relaxed">{{ att.diagnosis || 'Sin diagnóstico registrado' }}</p>
                      </div>
                      <div class="bg-white p-3 rounded-xl border border-slate-100">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Plan de Tratamiento</label>
                        <p class="text-slate-700 whitespace-pre-wrap leading-relaxed">{{ att.treatment || 'Sin indicaciones de plan' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div
            *ngIf="selectedAppointment && selectedAppointment.status === 'CANCELLED'"
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center text-slate-500"
          >
            <div class="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h4 class="font-bold text-slate-700 text-base">Consulta Cancelada</h4>
            <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">Esta cita médica fue cancelada y no se puede realizar el registro de la ficha clínica.</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AtenderComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  clinicalAttentionsService = inject(ClinicalAttentionsService);
  clinicalHistoryService = inject(ClinicalHistoryService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  selectedDate: string = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  // Receta Médica Flexible
  customMedicationName = '';
  medicationForm = {
    dosage: '',
    frequency: '',
    duration: '',
  };
  prescriptionMedications: PrescriptionMedication[] = [];
  prescriptionNotes = '';

  // Ficha Clínica
  attentionForm = {
    notes: '',
    diagnosis: '',
    treatment: '',
  };

  // Signos Vitales individuales (Soporte nativo)
  vitals = {
    peso: '',
    presion: '',
    temperatura: '',
    pulso: '',
    saturacion: '',
    respiracion: '',
    talla: '',
  };

  // Estado del Pago
  isPaymentPaid = false;

  // Navegación de Pestañas e Historial Clínico
  activeTab: any = 'ficha';
  pastAttentions: any[] = [];
  isControlAppointment = false;
  previousDiagnosis = '';
  previousPrescription: any = null;

  isLoading = false;
  isSaving = false;
  saveMessage = '';

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments(this.selectedDate || undefined).subscribe({
      next: (data) => {
        // Filtrado por fecha local
        this.appointments = data.filter((app) => {
          const d = new Date(app.appointment_time);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const localDate = `${year}-${month}-${day}`;
          return localDate === this.selectedDate;
        }).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

        if (this.selectedAppointment) {
          this.selectedAppointment = data.find((a) => a.id === this.selectedAppointment?.id) || null;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectAppointment(app: Appointment) {
    this.selectedAppointment = app;
    this.resetForms();
    this.isPaymentPaid = app.paid || false; // Carga síncrona instantánea para evitar parpadeos visuales
    this.loadExistingAttention(app);
    this.checkPaymentStatus(app);
    if (app.patient_id) {
      this.loadPastAttentions(app.patient_id);
    }
  }

  loadPastAttentions(patientId: string) {
    this.pastAttentions = [];
    this.clinicalAttentionsService.getAll({ patientId }).subscribe({
      next: (attentions) => {
        this.pastAttentions = attentions
          .filter((att) => att.appointment_id !== this.selectedAppointment?.id)
          .sort((a, b) => {
            const dateA = a.created_at || '';
            const dateB = b.created_at || '';
            return dateB.localeCompare(dateA);
          });

        if (this.pastAttentions.length > 0) {
          this.isControlAppointment = true;
          this.previousDiagnosis = this.pastAttentions[0].diagnosis || '';

          // Carga de receta de la consulta de control anterior
          const prevApptId = this.pastAttentions[0].appointment_id;
          if (prevApptId) {
            this.appointmentsService.getPrescription(prevApptId).subscribe({
              next: (prescData) => {
                const presc = Array.isArray(prescData) ? prescData[0] : prescData;
                this.previousPrescription = presc || null;
                this.cdr.detectChanges();
              },
              error: () => {
                this.previousPrescription = null;
                this.cdr.detectChanges();
              }
            });
          } else {
            this.previousPrescription = null;
          }
        } else {
          this.isControlAppointment = false;
          this.previousDiagnosis = '';
          this.previousPrescription = null;
        }

        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  evolucionarDiagnostico() {
    this.attentionForm.diagnosis = this.previousDiagnosis;
    this.cdr.detectChanges();
  }

  copiarRecetaAnterior() {
    if (this.previousPrescription) {
      const meds = Array.isArray(this.previousPrescription.medications)
        ? this.previousPrescription.medications
        : [];

      this.prescriptionMedications = meds.map((m: any) => ({
        id: '',
        name: m.name || '',
        dosage: m.dosage || '',
        frequency: m.frequency || '',
        duration: m.duration || '',
      }));

      this.prescriptionNotes = this.previousPrescription.notes || '';
      this.cdr.detectChanges();
    }
  }

  editarMedication(index: number) {
    const med = this.prescriptionMedications[index];
    if (med) {
      this.customMedicationName = med.name;
      this.medicationForm.dosage = med.dosage;
      this.medicationForm.frequency = med.frequency;
      this.medicationForm.duration = med.duration;
      this.removeMedication(index);
    }
  }

  checkPaymentStatus(app: Appointment) {
    // Mantenemos el valor síncrono inicial mientras se completa la consulta HTTP
    if (!app.id) return;

    this.appointmentsService.getPayments(app.id).subscribe({
      next: (payments) => {
        this.isPaymentPaid = payments.some((p) => p.status === 'COMPLETED') || app.paid || false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isPaymentPaid = app.paid || false;
        this.cdr.detectChanges();
      },
    });
  }

  loadExistingAttention(app: Appointment) {
    if (!app.id) return;
    this.clinicalAttentionsService.getAll({ appointmentId: app.id }).subscribe({
      next: (data) => {
        if (data.length > 0) {
          const attention = data[0] as ClinicalAttention;
          this.attentionForm.notes = attention.notes || '';
          this.attentionForm.diagnosis = attention.diagnosis || '';
          this.attentionForm.treatment = attention.treatment || '';
          
          if (attention.vitals) {
            const vit = attention.vitals as any;
            this.vitals.peso = vit.peso || '';
            this.vitals.presion = vit.presion || '';
            this.vitals.temperatura = vit.temperatura || '';
            this.vitals.pulso = vit.pulso || '';
            this.vitals.saturacion = vit.saturacion || '';
            this.vitals.respiracion = vit.respiracion || '';
            this.vitals.talla = vit.talla || '';
          }
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });

    this.appointmentsService.getPrescription(app.id).subscribe({
      next: (data) => {
        const pres = Array.isArray(data) ? data[0] : data;
        if (pres) {
          this.prescriptionNotes = pres.notes || '';
          const meds = Array.isArray(pres.medications) ? pres.medications : [];
          this.prescriptionMedications = meds.map((m: any) => ({
            id: m.id || '',
            name: m.name || '',
            dosage: m.dosage || '',
            frequency: m.frequency || '',
            duration: m.duration || '',
          }));
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  resetForms() {
    this.attentionForm = { notes: '', diagnosis: '', treatment: '' };
    this.vitals = { peso: '', presion: '', temperatura: '', pulso: '', saturacion: '', respiracion: '', talla: '' };
    this.prescriptionNotes = '';
    this.prescriptionMedications = [];
    this.customMedicationName = '';
    this.medicationForm = { dosage: '', frequency: '', duration: '' };
    this.saveMessage = '';
    this.isPaymentPaid = false;
    this.activeTab = 'ficha';
    this.pastAttentions = [];
    this.isControlAppointment = false;
    this.previousDiagnosis = '';
    this.previousPrescription = null;
  }

  addMedication() {
    if (!this.customMedicationName.trim()) return;
    if (!this.medicationForm.dosage || !this.medicationForm.frequency || !this.medicationForm.duration) {
      return;
    }
    this.prescriptionMedications.push({
      id: '',
      name: this.customMedicationName.trim(),
      dosage: this.medicationForm.dosage,
      frequency: this.medicationForm.frequency,
      duration: this.medicationForm.duration,
    });
    this.customMedicationName = '';
    this.medicationForm = { dosage: '', frequency: '', duration: '' };
  }

  removeMedication(index: number) {
    this.prescriptionMedications.splice(index, 1);
  }

  parseVitals(): Record<string, unknown> | null {
    const { peso, presion, temperatura, pulso, saturacion, respiracion, talla } = this.vitals;
    if (!peso && !presion && !temperatura && !pulso && !saturacion && !respiracion && !talla) {
      return null;
    }
    return {
      peso: peso || null,
      presion: presion || null,
      temperatura: temperatura || null,
      pulso: pulso || null,
      saturacion: saturacion || null,
      respiracion: respiracion || null,
      talla: talla || null,
    };
  }

  saveAttention() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;
    this.isSaving = true;
    this.saveMessage = '';

    // Si es consulta de control y no se ingresó diagnóstico nuevo, hereda el diagnóstico base automáticamente
    let finalDiagnosis = this.attentionForm.diagnosis || null;
    if (this.isControlAppointment && !finalDiagnosis && this.previousDiagnosis) {
      finalDiagnosis = this.previousDiagnosis;
    }

    const payload = {
      appointment_id: this.selectedAppointment.id,
      patient_id: this.selectedAppointment.patient_id,
      doctor_id: this.selectedAppointment.doctor_id,
      notes: this.attentionForm.notes || null,
      diagnosis: finalDiagnosis,
      treatment: this.attentionForm.treatment || null,
      vitals: this.parseVitals(),
    };

    this.clinicalAttentionsService.getAll({ appointmentId: this.selectedAppointment.id }).subscribe({
      next: (existing) => {
        const request$ = existing.length > 0
          ? this.clinicalAttentionsService.update(existing[0].id, payload)
          : this.clinicalAttentionsService.create(payload);

        request$.subscribe({
          next: () => {
            this.savePrescriptionAndPayment();
          },
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            this.saveMessage = 'Error guardando ficha clínica.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.saveMessage = 'Error validando ficha clínica.';
        this.cdr.detectChanges();
      },
    });
  }

  savePrescriptionAndPayment() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    const prescriptionPayload = {
      patient_id: this.selectedAppointment.patient_id,
      doctor_id: this.selectedAppointment.doctor_id,
      notes: this.prescriptionNotes || null,
      medications: this.prescriptionMedications,
    };

    this.appointmentsService.getPrescription(this.selectedAppointment.id).subscribe({
      next: (data) => {
        const existing = Array.isArray(data) ? data[0] : data;
        if (!existing && prescriptionPayload.medications.length === 0 && !prescriptionPayload.notes) {
          this.finalizeAppointment();
          return;
        }

        const request$ = existing
          ? this.appointmentsService.updatePrescription(
              this.selectedAppointment!.id!,
              existing.id,
              {
                notes: prescriptionPayload.notes,
                medications: prescriptionPayload.medications,
              },
            )
          : this.appointmentsService.createPrescription(
              this.selectedAppointment!.id!,
              prescriptionPayload,
            );

        request$.subscribe({
          next: () => this.finalizeAppointment(),
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            this.saveMessage = 'Error guardando receta.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.saveMessage = 'Error validando receta.';
        this.cdr.detectChanges();
      },
    });
  }

  finalizeAppointment() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    this.appointmentsService
      .updateAppointment(this.selectedAppointment.id, { status: 'COMPLETED' })
      .subscribe({
        next: () => {
          this.createClinicalHistory();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.saveMessage = 'Ficha guardada, pero no se pudo completar la cita.';
          this.cdr.detectChanges();
        },
      });
  }

  createClinicalHistory() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    const historyPayload = {
      patient_id: this.selectedAppointment.patient_id,
      doctor_id: this.selectedAppointment.doctor_id,
      appointment_id: this.selectedAppointment.id,
      diagnosis: this.attentionForm.diagnosis || null,
    };

    this.clinicalHistoryService.create(historyPayload).subscribe({
      next: () => {
        this.isSaving = false;
        this.saveMessage = 'Consulta guardada y completada con éxito.';
        this.loadAppointments();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.saveMessage = 'Ficha guardada, pero no se pudo crear el historial clínico.';
        this.cdr.detectChanges();
      },
    });
  }
}
