import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';
import {
  ClinicalAttentionsService,
  ClinicalAttention,
} from '../../core/services/clinical-attentions.service';
import { MedicationsService, Medication } from '../../core/services/medications.service';
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
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Atender Cita</h2>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-1 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-800">Citas del dia</h3>
            <button
              (click)="loadAppointments()"
              class="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Actualizar
            </button>
          </div>

          <div class="mb-4">
            <input
              type="date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="loadAppointments()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div *ngIf="isLoading" class="text-center text-slate-400 py-6">Cargando...</div>
          <div *ngIf="!isLoading && appointments.length === 0" class="text-slate-500 text-sm">
            No hay citas en esta fecha.
          </div>

          <div class="space-y-3" *ngIf="!isLoading && appointments.length > 0">
            <button
              *ngFor="let app of appointments"
              (click)="selectAppointment(app)"
              [class.border-blue-500]="selectedAppointment?.id === app.id"
              class="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-colors"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-slate-800">
                    {{ app.appointment_time | date: 'shortTime' }} -
                    {{ app.appointment_end_time | date: 'shortTime' }}
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ app.patients?.first_name }} {{ app.patients?.last_name }}
                  </div>
                </div>
                <span
                  class="text-[10px] font-bold px-2 py-1 rounded-full"
                  [ngClass]="{
                    'bg-amber-100 text-amber-700': app.status === 'SCHEDULED',
                    'bg-green-100 text-green-700': app.status === 'COMPLETED',
                    'bg-rose-100 text-rose-700': app.status === 'CANCELLED'
                  }"
                >
                  {{ app.status || 'SCHEDULED' }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div class="xl:col-span-2 space-y-6">
          <div
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
            *ngIf="!selectedAppointment"
          >
            <div class="text-slate-500 text-sm">Selecciona una cita para atenderla.</div>
          </div>

          <div
            *ngIf="selectedAppointment && selectedAppointment.status !== 'CANCELLED'"
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-slate-800">Ficha Clinica</h3>
                <p class="text-sm text-slate-500">
                  {{ selectedAppointment.patients?.first_name }}
                  {{ selectedAppointment.patients?.last_name }}
                </p>
              </div>
              <div class="text-xs text-slate-400">
                Cita: {{ selectedAppointment.appointment_time | date: 'medium' }}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Notas</label>
                <textarea
                  [(ngModel)]="attentionForm.notes"
                  rows="4"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Diagnostico</label>
                <textarea
                  [(ngModel)]="attentionForm.diagnosis"
                  rows="4"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Tratamiento</label>
                <textarea
                  [(ngModel)]="attentionForm.treatment"
                  rows="4"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Signos Vitales</label>
                <textarea
                  [(ngModel)]="vitalsRaw"
                  rows="4"
                  placeholder='Ej: {"peso":"70kg","presion":"120/80"}'
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div class="mt-6 border-t border-slate-200 pt-6">
              <h4 class="text-lg font-bold text-slate-800 mb-4">Receta Medica</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Medicamento</label>
                  <select
                    [(ngModel)]="medicationSelection"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option *ngFor="let med of medications" [value]="med.id">
                      {{ med.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Dosis</label>
                  <input
                    [(ngModel)]="medicationForm.dosage"
                    type="text"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Frecuencia</label>
                  <input
                    [(ngModel)]="medicationForm.frequency"
                    type="text"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Duracion</label>
                  <input
                    [(ngModel)]="medicationForm.duration"
                    type="text"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div class="mt-3">
                <button
                  (click)="addMedication()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700"
                >
                  Agregar medicamento
                </button>
              </div>

              <div *ngIf="prescriptionMedications.length > 0" class="mt-4 space-y-2">
                <div
                  *ngFor="let med of prescriptionMedications; let i = index"
                  class="p-3 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <div class="text-sm font-bold text-slate-800">{{ med.name }}</div>
                    <div class="text-xs text-slate-500">
                      {{ med.dosage }} - {{ med.frequency }} - {{ med.duration }}
                    </div>
                  </div>
                  <button
                    (click)="removeMedication(i)"
                    class="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Quitar
                  </button>
                </div>
              </div>

              <div class="mt-4">
                <label class="block text-xs font-bold text-slate-500 mb-1">Notas de receta</label>
                <textarea
                  [(ngModel)]="prescriptionNotes"
                  rows="3"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div class="mt-6 border-t border-slate-200 pt-6">
              <h4 class="text-lg font-bold text-slate-800 mb-4">Pago</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Precio ($)</label>
                  <input
                    [(ngModel)]="paymentForm.amount"
                    type="number"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Metodo</label>
                  <select
                    [(ngModel)]="paymentForm.method"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                  <select
                    [(ngModel)]="paymentForm.status"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Estado Cita</label>
                  <select
                    [(ngModel)]="appointmentStatus"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="COMPLETED">Completada</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="pt-6 flex flex-wrap gap-3">
              <button
                (click)="saveAttention()"
                [disabled]="isSaving"
                class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {{ isSaving ? 'Guardando...' : 'Guardar ficha y completar' }}
              </button>
              <span *ngIf="saveMessage" class="text-sm font-medium text-slate-500">{{ saveMessage }}</span>
            </div>
          </div>
          <div
            *ngIf="selectedAppointment && selectedAppointment.status === 'CANCELLED'"
            class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
          >
            <div class="text-slate-500 text-sm">
              Esta cita fue cancelada y no se puede completar la ficha clinica.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AtenderComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  clinicalAttentionsService = inject(ClinicalAttentionsService);
  medicationsService = inject(MedicationsService);
  clinicalHistoryService = inject(ClinicalHistoryService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  selectedDate = new Date().toISOString().split('T')[0];

  medications: Medication[] = [];
  medicationSelection = '';
  medicationForm = {
    dosage: '',
    frequency: '',
    duration: '',
  };
  prescriptionMedications: PrescriptionMedication[] = [];
  prescriptionNotes = '';

  attentionForm = {
    notes: '',
    diagnosis: '',
    treatment: '',
  };
  vitalsRaw = '';

  paymentForm = {
    amount: 0,
    method: 'CASH',
    status: 'PENDING',
  };

  appointmentStatus: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'COMPLETED';

  isLoading = false;
  isSaving = false;
  saveMessage = '';

  ngOnInit() {
    this.loadAppointments();
    this.loadMedications();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments(this.selectedDate || undefined).subscribe({
      next: (data) => {
        this.appointments = data;
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

  loadMedications() {
    this.medicationsService.getAll().subscribe({
      next: (data) => {
        this.medications = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  selectAppointment(app: Appointment) {
    this.selectedAppointment = app;
    this.resetForms();
    this.loadExistingAttention(app);
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
            this.vitalsRaw = JSON.stringify(attention.vitals, null, 2);
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
    this.vitalsRaw = '';
    this.prescriptionNotes = '';
    this.prescriptionMedications = [];
    this.medicationSelection = '';
    this.medicationForm = { dosage: '', frequency: '', duration: '' };
    this.paymentForm = { amount: 0, method: 'CASH', status: 'PENDING' };
    this.saveMessage = '';
  }

  addMedication() {
    const med = this.medications.find((m) => m.id === this.medicationSelection);
    if (!med) return;
    if (!this.medicationForm.dosage || !this.medicationForm.frequency || !this.medicationForm.duration) {
      return;
    }
    this.prescriptionMedications.push({
      id: med.id,
      name: med.name,
      dosage: this.medicationForm.dosage,
      frequency: this.medicationForm.frequency,
      duration: this.medicationForm.duration,
    });
    this.medicationSelection = '';
    this.medicationForm = { dosage: '', frequency: '', duration: '' };
  }

  removeMedication(index: number) {
    this.prescriptionMedications.splice(index, 1);
  }

  parseVitals(): Record<string, unknown> | null {
    if (!this.vitalsRaw.trim()) return null;
    try {
      return JSON.parse(this.vitalsRaw);
    } catch {
      return null;
    }
  }

  saveAttention() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;
    this.isSaving = true;
    this.saveMessage = '';

    const payload = {
      appointment_id: this.selectedAppointment.id,
      patient_id: this.selectedAppointment.patient_id,
      doctor_id: this.selectedAppointment.doctor_id,
      notes: this.attentionForm.notes || null,
      diagnosis: this.attentionForm.diagnosis || null,
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
            this.saveMessage = 'Error guardando ficha.';
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.saveMessage = 'Error validando ficha.';
        this.cdr.detectChanges();
      },
    });
  }

  savePrescriptionAndPayment() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    if (this.appointmentStatus === 'CANCELLED') {
      this.createPaymentAndComplete();
      return;
    }

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
          this.createPaymentAndComplete();
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
          next: () => this.createPaymentAndComplete(),
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

  createPaymentAndComplete() {
    if (!this.selectedAppointment || !this.selectedAppointment.id) return;

    const amount = Number(this.paymentForm.amount || 0);
    const paymentPayload = {
      amount,
      method: this.paymentForm.method,
      status: this.paymentForm.status || 'PENDING',
    };

    const finalizeAppointment = () => {
      this.appointmentsService
        .updateAppointment(this.selectedAppointment!.id!, { status: this.appointmentStatus })
        .subscribe({
          next: () => {
            if (this.appointmentStatus === 'COMPLETED') {
              this.createClinicalHistory();
              return;
            }
            this.isSaving = false;
            this.saveMessage = 'Cita actualizada.';
            this.loadAppointments();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(err);
            this.isSaving = false;
            this.saveMessage = 'Ficha guardada, pero no se pudo completar la cita.';
            this.cdr.detectChanges();
          },
        });
    };

    if (amount > 0) {
      this.appointmentsService.createPayment(this.selectedAppointment.id, paymentPayload).subscribe({
        next: finalizeAppointment,
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.saveMessage = 'Ficha guardada, pero no se pudo registrar el pago.';
          this.cdr.detectChanges();
        },
      });
    } else {
      finalizeAppointment();
    }
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
        this.saveMessage = 'Ficha, receta, historial y pago guardados.';
        this.loadAppointments();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.saveMessage = 'Ficha guardada, pero no se pudo crear historial clinico.';
        this.cdr.detectChanges();
      },
    });
  }
}
