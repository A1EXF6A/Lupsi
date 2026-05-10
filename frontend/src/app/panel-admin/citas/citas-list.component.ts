import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Citas</h2>
        <div class="flex gap-4">
          <input
            type="date"
            [(ngModel)]="filterDate"
            (ngModelChange)="loadAppointments()"
            class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
          <button
            (click)="loadAppointments()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
          >
            Actualizar
          </button>
        </div>
      </div>

      <!-- Búsqueda -->
      <div class="mb-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Buscar por nombre de paciente, doctor o DNI..."
          class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
        />
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
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
          class="p-6 bg-red-50 text-red-600 border-b border-red-100 text-sm font-bold flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ errorMessage }}
        </div>

        <table *ngIf="!isLoading && !errorMessage" class="w-full text-left text-sm text-slate-600">
          <thead
            class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider"
          >
            <tr>
              <th scope="col" class="px-6 py-4">Fecha y Hora</th>
              <th scope="col" class="px-6 py-4">Paciente</th>
              <th scope="col" class="px-6 py-4">Doctor</th>
              <th scope="col" class="px-6 py-4 text-center">Estado</th>
              <th scope="col" class="px-6 py-4 text-center">Pago</th>
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              *ngFor="let app of filteredAppointments | slice: 0 : visibleCount; let i = index"
              class="hover:bg-slate-50 transition-colors animate-fade-in-up"
              [style.animation-delay.ms]="i * 50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  {{ app.appointment_time | date: 'mediumDate' }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ app.appointment_time | date: 'shortTime' }} -
                  {{ app.appointment_end_time | date: 'shortTime' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  {{ app.patients?.first_name }} {{ app.patients?.last_name }}
                </div>
                <div class="text-xs text-slate-500">DNI: {{ app.patients?.dni }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  Dr/a. {{ app.doctors?.profiles?.first_name }}
                  {{ app.doctors?.profiles?.last_name }}
                </div>
                <div class="text-xs text-slate-500">{{ app.doctors?.specialty }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-amber-50 text-amber-700 border border-amber-100':
                      app.status === 'SCHEDULED',
                    'bg-green-50 text-green-700 border border-green-100':
                      app.status === 'COMPLETED',
                    'bg-red-50 text-red-700 border border-red-100': app.status === 'CANCELLED',
                  }"
                >
                  {{
                    app.status === 'SCHEDULED'
                      ? 'Programada'
                      : app.status === 'COMPLETED'
                        ? 'Completada'
                      : 'Cancelada'
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  [ngClass]="
                    app.paid
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  "
                >
                  {{ app.paid ? 'Pagado' : 'Pendiente' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  *ngIf="app.status === 'COMPLETED'"
                  (click)="openPrescriptionModal(app)"
                  class="text-slate-400 hover:text-green-600 transition-colors mx-1"
                  title="Ver Receta"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </button>
                <button
                  (click)="openStatusModal(app)"
                  class="text-slate-400 hover:text-blue-600 transition-colors mx-1"
                  title="Cambiar Estado"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  (click)="deleteAppointment(app.id!)"
                  class="text-slate-400 hover:text-red-500 transition-colors mx-1"
                  title="Eliminar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredAppointments.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 font-medium">
                No hay citas médicas registradas.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación local -->
        <div
          *ngIf="filteredAppointments.length > visibleCount"
          class="p-6 border-t border-slate-100 flex justify-center"
        >
          <button
            (click)="loadMore()"
            class="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors border border-slate-200 shadow-sm flex items-center gap-2"
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
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            Mostrar más resultados
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cambio de Estado -->
    <div
      *ngIf="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
        >
          <h3 class="font-bold text-lg text-slate-800">Actualizar Estado</h3>
          <button
            (click)="closeModal()"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-500">Seleccione el nuevo estado para esta cita médica:</p>
          <select
            [(ngModel)]="newStatus"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="SCHEDULED">Programada</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          <div class="pt-4 flex gap-3">
            <button
              (click)="closeModal()"
              class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="updateStatus()"
              [disabled]="isSaving"
              class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Receta -->
    <div
      *ngIf="showPrescriptionModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"
        >
          <h3 class="font-bold text-lg text-slate-800">Receta Médica</h3>
          <button
            (click)="closePrescriptionModal()"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <div
            *ngIf="isLoadingPrescription"
            class="py-8 flex flex-col items-center justify-center text-slate-400"
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
            Buscando receta...
          </div>

          <div
            *ngIf="!isLoadingPrescription && prescriptions.length === 0"
            class="py-8 text-center text-slate-500 font-medium"
          >
            No se ha emitido ninguna receta para esta cita.
          </div>

          <div *ngIf="!isLoadingPrescription && prescriptions.length > 0" class="space-y-4">
            <div
              *ngFor="let pres of prescriptions"
              class="p-4 border border-slate-200 rounded-xl bg-slate-50"
            >
              <p class="text-sm text-slate-600 mb-3">
                <span class="font-bold">Notas:</span>
                {{ pres.notes || 'Sin notas.' }}
              </p>
              <div *ngIf="pres.medications?.length" class="space-y-2">
                <div
                  *ngFor="let med of pres.medications"
                  class="p-3 bg-white rounded-xl border border-slate-200"
                >
                  <div class="font-bold text-slate-800">{{ med.name }}</div>
                  <div class="text-xs text-slate-500">
                    {{ med.dosage }} - {{ med.frequency }} - {{ med.duration }}
                  </div>
                </div>
              </div>
              <div *ngIf="!pres.medications?.length" class="text-xs text-slate-500">
                Sin medicamentos registrados.
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button
              (click)="closePrescriptionModal()"
              class="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CitasListComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  isLoading = true;
  errorMessage = '';
  filterDate = new Date().toISOString().split('T')[0];
  visibleCount = 10;

  showModal = false;
  isSaving = false;
  selectedAppointmentId: string | null = null;
  newStatus = 'SCHEDULED';
  searchTerm = '';

  showPrescriptionModal = false;
  isLoadingPrescription = false;
  prescriptions: any[] = [];

  get filteredAppointments() {
    if (!this.searchTerm) return this.appointments;
    const term = this.searchTerm.toLowerCase();
    return this.appointments.filter(
      (a) =>
        a.patients?.first_name?.toLowerCase().includes(term) ||
        a.patients?.last_name?.toLowerCase().includes(term) ||
        a.patients?.dni?.toLowerCase().includes(term) ||
        a.doctors?.profiles?.first_name?.toLowerCase().includes(term) ||
        a.doctors?.profiles?.last_name?.toLowerCase().includes(term),
    );
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadMore() {
    this.visibleCount += 10;
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointments(this.filterDate || undefined).subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.errorMessage = 'No se pudieron cargar las citas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openStatusModal(app: Appointment) {
    if (!app.id) return;
    this.selectedAppointmentId = app.id;
    this.newStatus = app.status || 'SCHEDULED';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedAppointmentId = null;
  }

  openPrescriptionModal(app: Appointment) {
    if (!app.id) return;
    this.showPrescriptionModal = true;
    this.isLoadingPrescription = true;
    this.prescriptions = [];

    this.appointmentsService.getPrescription(app.id).subscribe({
      next: (data) => {
        this.prescriptions = Array.isArray(data) ? data : [data];
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching prescription', err);
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePrescriptionModal() {
    this.showPrescriptionModal = false;
  }

  updateStatus() {
    if (!this.selectedAppointmentId) return;
    this.isSaving = true;

    this.appointmentsService
      .updateAppointment(this.selectedAppointmentId, { status: this.newStatus })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.message || 'Error al actualizar el estado.';
          this.isSaving = false;
          this.closeModal();
        },
      });
  }

  deleteAppointment(id: string) {
    if (confirm('¿Eliminar esta cita permanentemente?')) {
      this.appointmentsService.deleteAppointment(id).subscribe({
        next: () => this.loadAppointments(),
        error: (err) => console.error(err),
      });
    }
  }
}
