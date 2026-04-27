import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, AppointmentSlot } from '../../core/services/appointments.service';
import { CatalogsService, Doctor, Specialty, AppointmentType } from '../../core/services/catalogs.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-green-50/50">
      
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 text-white flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Agendar Nueva Cita</h2>
          <p class="text-slate-500 font-medium text-sm mt-1">Completa los pasos para tu próxima reserva médica.</p>
        </div>
      </div>

      <div *ngIf="isLoadingBase" class="flex items-center gap-3 text-green-600 font-bold mb-6 bg-green-50 p-4 rounded-2xl">
        <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <span>Cargando catálogos de atención...</span>
      </div>

      <div *ngIf="successMessage" class="bg-green-50 text-green-700 p-4 mb-6 rounded-2xl font-medium border border-green-100 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <div>
          <h4 class="font-bold">¡Reserva Exitosa!</h4>
          <p class="text-sm mt-1">{{ successMessage }}</p>
        </div>
      </div>

      <div *ngIf="errorMessage" class="bg-red-50 text-red-600 p-4 mb-6 rounded-2xl font-medium border border-red-100 flex items-start gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12" y1="16" y2="16"/></svg>
        <div>
           <h4 class="font-bold">Aviso</h4>
           <p class="text-sm mt-1">{{ errorMessage }}</p>
        </div>
      </div>

      <div class="space-y-6" *ngIf="!isLoadingBase && !successMessage">
        
        <!-- Paso 1: Fecha -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">1. Fecha de Cita</label>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (ngModelChange)="onDateChange()"
            class="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium font-sans"
          />
        </div>

        <!-- Paso 2: Tipo de Cita -->
        <div class="space-y-2" *ngIf="selectedDate">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">2. Tipo de Consulta</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
             <button *ngFor="let type of appointmentTypes"
                     type="button"
                     (click)="selectAppointmentType(type)"
                     [class.bg-green-600]="selectedAppointmentType?.id === type.id"
                     [class.text-white]="selectedAppointmentType?.id === type.id"
                     [class.border-transparent]="selectedAppointmentType?.id === type.id"
                     [class.bg-slate-50]="selectedAppointmentType?.id !== type.id"
                     [class.text-slate-600]="selectedAppointmentType?.id !== type.id"
                     [class.border-slate-200]="selectedAppointmentType?.id !== type.id"
                     class="text-left border rounded-2xl p-4 transition-all hover:border-green-300">
                <div class="font-bold text-sm">{{ type.name }}</div>
                <div class="text-xs mt-1" [class.text-green-100]="selectedAppointmentType?.id === type.id" [class.text-slate-400]="selectedAppointmentType?.id !== type.id">Duración: {{ type.durationMinutes }} min</div>
             </button>
          </div>
        </div>

        <!-- Paso 3: Especialidad -->
        <div class="space-y-2" *ngIf="selectedAppointmentType">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">3. Especialidad</label>
          <select
            [(ngModel)]="selectedSpecialty"
            (ngModelChange)="onSpecialtyChange()"
            class="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
          >
            <option [ngValue]="null">-- Selecciona Especialidad --</option>
            <option *ngFor="let spec of specialties" [ngValue]="spec">{{ spec.name }}</option>
          </select>
        </div>

        <!-- Paso 4: Doctor -->
        <div class="space-y-2" *ngIf="selectedSpecialty">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">4. Profesional de la Salud</label>
          <select
            [(ngModel)]="selectedDoctor"
            (ngModelChange)="onDoctorChange()"
            class="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
          >
            <option [ngValue]="null">-- Selecciona Profesional --</option>
            <option *ngFor="let doc of filteredDoctors" [ngValue]="doc">
              Dr/Dra. {{ doc.profiles.first_name || '?' }} {{ doc.profiles.last_name || '?' }}
            </option>
          </select>
          <div *ngIf="filteredDoctors.length === 0" class="px-2 text-sm text-amber-600 font-medium mt-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
            No hay doctores con esta especialidad.
          </div>
        </div>

        <!-- Paso 5: Horarios -->
        <div class="space-y-3" *ngIf="selectedDoctor">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">5. Horarios Disponibles</label>
          
          <div *ngIf="isLoadingSlots" class="text-sm font-medium text-slate-500 flex items-center gap-2 px-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Buscando horarios...
          </div>

          <div *ngIf="!isLoadingSlots && slots.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
            <button
              *ngFor="let slot of slots"
              (click)="selectSlot(slot)"
              [class.bg-green-600]="selectedSlot === slot"
              [class.text-white]="selectedSlot === slot"
              [class.border-transparent]="selectedSlot === slot"
              [class.bg-white]="selectedSlot !== slot"
              [class.text-slate-600]="selectedSlot !== slot"
              [class.border-slate-200]="selectedSlot !== slot"
              class="border rounded-2xl p-3 text-sm font-bold transition-all hover:bg-slate-50 focus:outline-none"
            >
              {{ slot.start | date: 'shortTime' }}
            </button>
          </div>
          
          <div *ngIf="!isLoadingSlots && slots.length === 0" class="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
             No hay horarios disponibles para el profesional seleccionado en esta fecha. Intenta con otra fecha u otro horario.
          </div>
        </div>

        <!-- Confirmar -->
        <div class="pt-6 border-t border-slate-100" *ngIf="selectedSlot">
          <button
            (click)="confirmBooking()"
            [disabled]="isSubmitting"
            class="w-full bg-gray-900 hover:bg-black disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span *ngIf="!isSubmitting">Confirmar Reserva de Cita</span>
            <span *ngIf="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Procesando...
            </span>
          </button>
        </div>

      </div>

      <div *ngIf="successMessage" class="mt-4">
        <button (click)="resetForm()" class="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl transition-all">
          Agendar Otra Cita
        </button>
      </div>

    </div>
  `,
})
export class ReservaComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  catalogsService = inject(CatalogsService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  doctors: Doctor[] = [];
  specialties: Specialty[] = [];
  appointmentTypes: AppointmentType[] = [];
  filteredDoctors: Doctor[] = [];
  slots: AppointmentSlot[] = [];
  
  isLoadingBase = false;
  isLoadingSlots = false;
  isSubmitting = false;

  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedAppointmentType: AppointmentType | null = null;
  selectedSpecialty: Specialty | null = null;
  selectedDoctor: Doctor | null = null;
  selectedSlot: AppointmentSlot | null = null;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadBaseCatalogs();
  }

  loadBaseCatalogs() {
    this.isLoadingBase = true;
    
    // Using simple parallel fetching for the initial config
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded === 3) {
        this.isLoadingBase = false;
        this.cdr.detectChanges();
      }
    };

    this.catalogsService.getDoctors().subscribe({
      next: (docs) => { this.doctors = docs; checkDone(); },
      error: () => checkDone()
    });

    this.catalogsService.getSpecialties().subscribe({
      next: (specs) => { this.specialties = specs; checkDone(); },
      error: () => checkDone()
    });

    this.catalogsService.getAppointmentTypes().subscribe({
      next: (types) => { this.appointmentTypes = types; checkDone(); },
      error: () => checkDone()
    });
  }

  onDateChange() {
    this.resetFrom(1);
  }

  selectAppointmentType(type: AppointmentType) {
    this.selectedAppointmentType = type;
    this.resetFrom(2);
  }

  onSpecialtyChange() {
    this.resetFrom(3);
    if (this.selectedSpecialty) {
      // Filter the doctors where their specialty text matches the selected one exactly
      this.filteredDoctors = this.doctors.filter(d => d.specialty === this.selectedSpecialty?.name);
    } else {
      this.filteredDoctors = [];
    }
  }

  onDoctorChange() {
    this.resetFrom(4);
    if (this.selectedDoctor && this.selectedDate) {
      this.loadSlots();
    }
  }

  loadSlots() {
    if (!this.selectedDoctor) return;
    
    this.isLoadingSlots = true;
    this.slots = [];
    this.selectedSlot = null;
    this.successMessage = '';
    this.errorMessage = '';

    this.appointmentsService.getAvailableSlots(this.selectedDoctor.id, this.selectedDate).subscribe({
      next: (res) => {
        this.slots = res;
        this.isLoadingSlots = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar horarios disponibles.';
        this.isLoadingSlots = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectSlot(slot: AppointmentSlot) {
    this.selectedSlot = slot;
  }

  confirmBooking() {
    const token = this.authService.currentUserToken();
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para reservar una cita.';
      return;
    }

    if (!this.selectedDoctor || !this.selectedSlot) return;

    this.isSubmitting = true;
    const payload = {
      doctor_id: this.selectedDoctor.id,
      appointment_time: this.selectedSlot.start,
    };

    this.appointmentsService.createAppointment(payload).subscribe({
      next: () => {
        this.successMessage = 'Tu consulta médica ha sido confirmada con éxito.';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err.error?.message ||
          'Error al confirmar la reserva. El horario podría no estar disponible.';
        this.successMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetFrom(level: number) {
    if (level <= 1) { this.selectedAppointmentType = null; }
    if (level <= 2) { this.selectedSpecialty = null; this.filteredDoctors = []; }
    if (level <= 3) { this.selectedDoctor = null; }
    if (level <= 4) { this.selectedSlot = null; this.slots = []; }
    this.successMessage = '';
    this.errorMessage = '';
  }

  resetForm() {
    this.selectedAppointmentType = null;
    this.selectedSpecialty = null;
    this.selectedDoctor = null;
    this.selectedSlot = null;
    this.filteredDoctors = [];
    this.slots = [];
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedDate = new Date().toISOString().split('T')[0];
  }
}
