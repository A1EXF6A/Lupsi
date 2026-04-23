import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, AppointmentSlot } from '../../core/services/appointments.service';
import { CatalogsService, Doctor } from '../../core/services/catalogs.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 border rounded shadow-sm bg-white">
      <h2 class="text-xl font-bold mb-4">Nueva Reserva</h2>

      <div *ngIf="isLoading" class="text-blue-600 font-semibold mb-4">
        Cargando profesionales...
      </div>

      <div *ngIf="successMessage" class="bg-green-100 text-green-700 p-3 mb-4 rounded">
        {{ successMessage }}
      </div>

      <div *ngIf="errorMessage" class="bg-red-100 text-red-700 p-3 mb-4 rounded">
        {{ errorMessage }}
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Selecciona un Doctor</label>
        <select
          [(ngModel)]="selectedDoctor"
          (ngModelChange)="loadSlots()"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        >
          <option [ngValue]="null">-- Seleccione --</option>
          <option *ngFor="let doc of doctors" [ngValue]="doc.id">
            Dr/Dra. {{ doc.profiles?.first_name || '?' }} {{ doc.profiles?.last_name || '?' }} -
            {{ doc.specialty || 'Sin especialidad' }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700">Fecha de Cita</label>
        <input
          type="date"
          [(ngModel)]="selectedDate"
          (ngModelChange)="loadSlots()"
          class="mt-1 block w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div *ngIf="slots.length > 0">
        <label class="block text-sm font-medium text-gray-700 mb-2">Horarios Disponibles</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            *ngFor="let slot of slots"
            (click)="selectSlot(slot)"
            [class.bg-blue-600]="selectedSlot === slot"
            [class.text-white]="selectedSlot === slot"
            class="border border-blue-500 text-blue-600 rounded p-2 hover:bg-blue-100"
          >
            {{ slot.start | date: 'shortTime' }}
          </button>
        </div>
      </div>

      <div *ngIf="selectedDoctor && selectedDate && slots.length === 0" class="text-gray-500 mt-2">
        No hay horarios disponibles para la fecha seleccionada.
      </div>

      <div class="mt-6">
        <button
          [disabled]="!selectedSlot"
          (click)="confirmBooking()"
          class="w-full bg-blue-600 text-white p-3 rounded font-bold disabled:bg-gray-400"
        >
          Confirmar Reserva
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
  slots: AppointmentSlot[] = [];
  isLoading = false;

  selectedDoctor: string | null = null;
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedSlot: AppointmentSlot | null = null;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    console.log('[ReservaComponent] Initializing... fetching doctors.');
    this.isLoading = true;
    this.catalogsService.getDoctors().subscribe({
      next: (docs) => {
        console.log('[ReservaComponent] Doctors received from API:', docs);
        this.doctors = docs;
        this.isLoading = false;
        this.cdr.detectChanges(); // Force UI update
      },
      error: (err) => {
        console.error('[ReservaComponent] Error fetching doctors:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadSlots() {
    console.log(
      `[ReservaComponent] loading slots for Dr: ${this.selectedDoctor}, Date: ${this.selectedDate}`,
    );
    this.selectedSlot = null;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.selectedDoctor && this.selectedDate) {
      this.appointmentsService.getAvailableSlots(this.selectedDoctor, this.selectedDate).subscribe({
        next: (res) => {
          this.slots = res;
          this.cdr.detectChanges(); // Force UI update
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Error al cargar horarios fijos.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.slots = [];
    }
  }

  selectSlot(slot: AppointmentSlot) {
    this.selectedSlot = slot;
  }

  confirmBooking() {
    const token = this.authService.currentUserToken();
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para reservar una cita.';
      console.error('[ReservaComponent] No token found. Blocking booking.');
      return;
    }

    if (!this.selectedDoctor || !this.selectedSlot) return;

    const payload = {
      doctor_id: this.selectedDoctor,
      appointment_time: this.selectedSlot.start,
    };

    this.appointmentsService.createAppointment(payload).subscribe({
      next: () => {
        this.successMessage = '¡Cita confirmada con éxito!';
        this.errorMessage = '';
        this.selectedSlot = null;
        this.loadSlots(); // Refresh
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err.error?.message ||
          'Error al confirmar la reserva. El horario podría no estar disponible.';
        this.successMessage = '';
        this.loadSlots(); // Refresh available slots
      },
    });
  }
}
