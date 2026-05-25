import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';
import { CatalogsService } from '../../core/services/catalogs.service';

@Component({
  selector: 'app-agenda-diaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Sala de Espera</h2>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <div class="flex flex-wrap gap-4 items-end mb-6">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-bold text-slate-500 mb-1">Doctor</label>
            <select
              [(ngModel)]="selectedDoctor"
              (ngModelChange)="loadAppointments()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los doctores</option>
              <option *ngFor="let doc of doctors" [value]="doc.id">
                Dr/Dra. {{ doc.profiles?.first_name }} {{ doc.profiles?.last_name }} ({{
                  doc.specialty
                }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
            <input
              type="date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="loadAppointments()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <button
              (click)="loadAppointments()"
              class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 text-sm h-10"
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
            class="animate-spin h-8 w-8 text-green-500 mb-4"
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
              <p class="text-slate-500 font-medium text-sm">Resumen del día</p>
              <p class="text-xl font-bold text-slate-800">
                {{
                  selectedDoctor
                    ? 'El Dr. tiene ' + filteredAppointments.length + ' cita(s) hoy'
                    : 'Este día hay ' + filteredAppointments.length + ' citas programadas en total'
                }}
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
                    {{ app.appointment_time | date: 'HH:mm' }}
                  </div>
                  <div class="text-xs text-slate-400">
                    {{ app.appointment_time | date: 'fullDate' }}
                  </div>
                </div>
                <span
                  [ngClass]="{
                    'bg-indigo-100 text-indigo-700': app.status === 'SCHEDULED',
                    'bg-green-100 text-green-700': app.status === 'COMPLETED',
                    'bg-red-100 text-red-700': app.status === 'CANCELLED',
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
                      {{ app.patients?.profiles?.first_name }}
                      {{ app.patients?.profiles?.last_name }}
                    </p>
                  </div>
                </div>

                <div *ngIf="!selectedDoctor" class="flex items-center gap-2">
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="11" cy="7" r="4" />
                      <path d="m22 21-3-3" />
                      <path d="m19 18 3-3" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-slate-500">Doctor</p>
                    <p class="text-sm font-bold text-slate-800">
                      Dr/Dra. {{ app.doctors?.profiles?.first_name }}
                      {{ app.doctors?.profiles?.last_name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              *ngIf="filteredAppointments.length === 0"
              class="col-span-full text-center py-12 text-slate-500"
            >
              No hay citas programadas para esta fecha y/o doctor.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AgendaDiariaComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  catalogsService = inject(CatalogsService);
  cdr = inject(ChangeDetectorRef);

  doctors: any[] = [];
  appointments: Appointment[] = [];
  selectedDoctor: string = '';
  selectedDate: string = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  isLoading = false;
  errorMessage = '';

  get filteredAppointments() {
    let filtered = this.appointments.filter((app) => {
      const d = new Date(app.appointment_time);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const localDate = `${year}-${month}-${day}`;
      return localDate === this.selectedDate;
    });

    if (this.selectedDoctor) {
      filtered = filtered.filter(
        (app) => app.doctor_id === this.selectedDoctor || app.doctors?.id === this.selectedDoctor,
      );
    }

    // Sort by time
    return filtered.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }

  get completedAppointments() {
    return this.filteredAppointments.filter((app) => app.status === 'COMPLETED').length;
  }

  ngOnInit() {
    this.catalogsService.getDoctors().subscribe({
      next: (data) => (this.doctors = data),
      error: () => (this.errorMessage = 'Error cargando doctores.'),
    });
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando las citas del día.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
