import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-doctor-agenda-diaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Agenda Diaria</h2>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <div class="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
            <input
              type="date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="loadAppointments()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              (click)="loadAppointments()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 text-sm h-10"
            >
              Actualizar
            </button>
          </div>
        </div>

        <div
          *ngIf="isLoading"
          class="p-10 flex flex-col items-center justify-center text-slate-400"
        >
          <svg
            class="animate-spin h-8 w-8 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando citas...
        </div>

        <div
          *ngIf="errorMessage"
          class="mb-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold"
        >
          {{ errorMessage }}
        </div>

        <div *ngIf="!isLoading">
          <div
            class="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center"
          >
            <div>
              <p class="text-slate-500 font-medium text-sm">Resumen del dia</p>
              <p class="text-xl font-bold text-slate-800">
                {{ filteredAppointments.length }} cita(s) hoy
              </p>
            </div>
            <div class="text-right">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700"
              >
                {{ completedAppointments }} Completadas
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              *ngFor="let app of filteredAppointments"
              class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <div class="text-lg font-bold text-slate-800">
                    {{ app.appointment_time | slice: 11 : 16 }}
                  </div>
                  <div class="text-xs text-slate-400">
                    {{ app.appointment_time | date: 'fullDate' }}
                  </div>
                </div>
                <span
                  [ngClass]="{
                    'bg-blue-100 text-blue-700': app.status === 'SCHEDULED',
                    'bg-green-100 text-green-700': app.status === 'COMPLETED',
                    'bg-red-100 text-red-700': app.status === 'CANCELLED'
                  }"
                  class="px-2.5 py-1 rounded-full text-xs font-bold"
                >
                  {{
                    app.status === 'SCHEDULED'
                      ? 'Programada'
                      : app.status === 'COMPLETED'
                        ? 'Completada'
                        : 'Cancelada'
                  }}
                </span>
              </div>

              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="14" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-slate-500">Paciente</p>
                    <p class="text-sm font-bold text-slate-800">
                      {{ app.patients?.first_name }} {{ app.patients?.last_name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              *ngIf="filteredAppointments.length === 0"
              class="col-span-full text-center py-12 text-slate-500"
            >
              No hay citas programadas para esta fecha.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DoctorAgendaDiariaComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];

  isLoading = false;
  errorMessage = '';

  get filteredAppointments() {
    const filtered = this.appointments.filter((app) => {
      const appDate = app.appointment_time.split('T')[0];
      return appDate === this.selectedDate;
    });
    return filtered.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }

  get completedAppointments() {
    return this.filteredAppointments.filter((app) => app.status === 'COMPLETED').length;
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointments(this.selectedDate || undefined).subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando las citas del dia.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
