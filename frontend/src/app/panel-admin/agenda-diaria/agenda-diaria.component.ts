import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-agenda-diaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 border rounded shadow-sm bg-white">
      <h2 class="text-xl font-bold mb-4">Agenda Diaria de Recepción</h2>

      <div class="mb-4 flex items-center gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Filtrar por Fecha</label>
          <input
            type="date"
            [(ngModel)]="selectedDate"
            (ngModelChange)="loadAppointments()"
            class="mt-1 block w-48 p-2 border border-gray-300 rounded"
          />
        </div>
        <div class="mt-6">
          <button
            (click)="loadAppointments()"
            [disabled]="isLoading"
            class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isLoading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="text-center py-8 text-gray-500">
        <span>⏳ Cargando agenda...</span>
      </div>

      <div *ngIf="errorMessage" class="text-center py-4 text-red-600 text-sm">
        {{ errorMessage }}
      </div>

      <table *ngIf="!isLoading" class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Hora
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Paciente
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Doctor
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Especialidad
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr *ngFor="let app of appointments">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ app.appointment_time | date: 'shortTime' }} -
              {{ app.appointment_end_time | date: 'shortTime' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ app.patients?.first_name }} {{ app.patients?.last_name }} <br /><span
                class="text-xs text-gray-500"
                >DNI: {{ app.patients?.dni }}</span
              >
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              Dr/Dra. {{ app.doctors?.profiles?.first_name }} {{ app.doctors?.profiles?.last_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ app.doctors?.specialty }}
            </td>
          </tr>
          <tr *ngIf="appointments.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              No hay citas para este día.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class AgendaDiariaComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);
  appointments: Appointment[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading = false;
  errorMessage = '';

  ngOnInit() {
    // Pequeño delay para asegurar que el token ya está disponible en el interceptor
    setTimeout(() => this.loadAppointments(), 100);
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.appointmentsService.getAppointments(this.selectedDate).subscribe({
      next: (data) => {
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.errorMessage = 'No se pudieron cargar las citas. Intenta de nuevo.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
