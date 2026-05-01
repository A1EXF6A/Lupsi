import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-3xl shadow-xl border border-green-50/50">
      <h2 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <div
          class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
        </div>
        Mis Citas Médicas
      </h2>

      <div *ngIf="isLoading" class="text-center py-10">
        <div class="inline-flex items-center gap-2 text-green-600 font-medium">
          <svg
            class="animate-spin h-5 w-5"
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
      </div>

      <div
        *ngIf="!isLoading && appointments.length === 0"
        class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mx-auto text-slate-300 mb-4"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p class="text-slate-500 font-medium mb-1">Aún no tienes citas agendadas.</p>
        <p class="text-slate-400 text-sm mb-4">
          Puedes agendar tu primera consulta médica desde la sección de Nueva Reserva.
        </p>
      </div>

      <div *ngIf="!isLoading && appointments.length > 0" class="flex flex-wrap gap-2 mb-6">
        <button
          (click)="setFilter('ALL')"
          [class.bg-slate-800]="currentFilter === 'ALL'"
          [class.text-white]="currentFilter === 'ALL'"
          [class.bg-slate-100]="currentFilter !== 'ALL'"
          [class.text-slate-600]="currentFilter !== 'ALL'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-slate-200"
        >
          Todas
        </button>
        <button
          (click)="setFilter('SCHEDULED')"
          [class.bg-amber-500]="currentFilter === 'SCHEDULED'"
          [class.text-white]="currentFilter === 'SCHEDULED'"
          [class.bg-slate-100]="currentFilter !== 'SCHEDULED'"
          [class.text-slate-600]="currentFilter !== 'SCHEDULED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-amber-100"
        >
          Programadas
        </button>
        <button
          (click)="setFilter('COMPLETED')"
          [class.bg-green-500]="currentFilter === 'COMPLETED'"
          [class.text-white]="currentFilter === 'COMPLETED'"
          [class.bg-slate-100]="currentFilter !== 'COMPLETED'"
          [class.text-slate-600]="currentFilter !== 'COMPLETED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-green-100"
        >
          Completadas
        </button>
        <button
          (click)="setFilter('CANCELLED')"
          [class.bg-rose-500]="currentFilter === 'CANCELLED'"
          [class.text-white]="currentFilter === 'CANCELLED'"
          [class.bg-slate-100]="currentFilter !== 'CANCELLED'"
          [class.text-slate-600]="currentFilter !== 'CANCELLED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-rose-100"
        >
          Canceladas
        </button>
      </div>

      <div
        *ngIf="!isLoading && filteredAppointments.length === 0 && appointments.length > 0"
        class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
      >
        <p class="text-slate-500 font-medium">No se encontraron citas con este estado.</p>
      </div>

      <div *ngIf="!isLoading && paginatedAppointments.length > 0" class="space-y-4">
        <div
          *ngFor="let apt of paginatedAppointments"
          class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all gap-4"
        >
          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100 flex-shrink-0"
            >
              <span class="text-xs font-bold text-slate-500 uppercase">{{
                apt.appointment_time | date: 'MMM'
              }}</span>
              <span class="text-lg font-black text-gray-900 leading-none">{{
                apt.appointment_time | date: 'dd'
              }}</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">
                Consulta con Dr/Dra. {{ apt.doctors?.profiles?.first_name || 'No especificado' }}
                {{ apt.doctors?.profiles?.last_name || '' }}
              </h3>
              <p class="text-sm text-slate-500 font-medium mt-0.5">
                Especialidad:
                <span class="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs ml-1">{{
                  apt.doctors?.specialty || 'General'
                }}</span>
              </p>
              <div class="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Hora: {{ apt.appointment_time | date: 'h:mm a' }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span
              [class.bg-amber-50]="apt.status === 'SCHEDULED'"
              [class.text-amber-700]="apt.status === 'SCHEDULED'"
              [class.border-amber-100]="apt.status === 'SCHEDULED'"
              [class.bg-green-50]="apt.status === 'COMPLETED'"
              [class.text-green-700]="apt.status === 'COMPLETED'"
              [class.border-green-100]="apt.status === 'COMPLETED'"
              [class.bg-rose-50]="apt.status === 'CANCELLED'"
              [class.text-rose-700]="apt.status === 'CANCELLED'"
              [class.border-rose-100]="apt.status === 'CANCELLED'"
              [class.bg-slate-50]="!apt.status"
              [class.text-slate-700]="!apt.status"
              [class.border-slate-200]="!apt.status"
              class="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5"
            >
              <span
                [class.bg-amber-500]="apt.status === 'SCHEDULED'"
                [class.bg-green-500]="apt.status === 'COMPLETED'"
                [class.bg-rose-500]="apt.status === 'CANCELLED'"
                [class.bg-slate-400]="!apt.status"
                class="w-1.5 h-1.5 rounded-full"
              ></span>
              {{
                apt.status === 'SCHEDULED'
                  ? 'PROGRAMADA'
                  : apt.status === 'COMPLETED'
                    ? 'COMPLETADA'
                    : apt.status === 'CANCELLED'
                      ? 'CANCELADA'
                      : 'DESCONOCIDO'
              }}
            </span>
          </div>
        </div>
      </div>

      <div
        *ngIf="totalPages > 1"
        class="flex items-center justify-between mt-6 pt-6 border-t border-slate-100"
      >
        <button
          (click)="prevPage()"
          [disabled]="currentPage === 1"
          class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <span class="text-sm font-bold text-slate-400"
          >Página {{ currentPage }} de {{ totalPages }}</span
        >
        <button
          (click)="nextPage()"
          [disabled]="currentPage === totalPages"
          class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  `,
})
export class MisCitasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  isLoading = false;

  currentFilter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  currentPage = 1;
  itemsPerPage = 4;

  get filteredAppointments() {
    if (this.currentFilter === 'ALL') {
      return this.appointments;
    }
    return this.appointments.filter((a) => a.status === this.currentFilter);
  }

  get totalPages() {
    return Math.ceil(this.filteredAppointments.length / this.itemsPerPage) || 1;
  }

  get paginatedAppointments() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  setFilter(filter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        // Reverse to show the newest appointments first
        this.appointments = data.reverse();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
