import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-doctor-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Recetas Emitidas</h2>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div class="flex flex-wrap gap-3 items-end mb-6">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
            <input
              type="date"
              [(ngModel)]="filterDate"
              (ngModelChange)="loadAppointments()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-bold text-slate-500 mb-1">Buscar</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Paciente o ID..."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div *ngIf="isLoading" class="p-8 text-center text-slate-400">Cargando...</div>

        <table *ngIf="!isLoading" class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Fecha</th>
              <th class="px-6 py-4">Paciente</th>
              <th class="px-6 py-4">Estado Cita</th>
              <th class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let app of filteredAppointments">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ app.appointment_time | date: 'mediumDate' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ app.patients?.first_name }} {{ app.patients?.last_name }}
              </td>
              <td class="px-6 py-4">
                <span class="text-xs font-bold px-2 py-1 rounded-full"
                  [ngClass]="{
                    'bg-amber-100 text-amber-700': app.status === 'SCHEDULED',
                    'bg-green-100 text-green-700': app.status === 'COMPLETED',
                    'bg-rose-100 text-rose-700': app.status === 'CANCELLED'
                  }"
                >{{ app.status }}</span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  (click)="openPrescription(app)"
                  class="text-blue-600 font-bold text-xs hover:text-blue-700"
                >
                  Ver receta
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredAppointments.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                No hay recetas registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      *ngIf="showPrescription"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">Receta Medica</h3>
          <button (click)="closePrescription()" class="text-slate-400 hover:text-slate-600">
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
          <div *ngIf="isLoadingPrescription" class="text-center text-slate-400 py-6">Cargando...</div>
          <div *ngIf="!isLoadingPrescription && !selectedPrescription" class="text-slate-500">
            No se encontro receta.
          </div>
          <div *ngIf="selectedPrescription">
            <p class="text-sm text-slate-600 mb-3">
              <span class="font-bold">Notas:</span> {{ selectedPrescription.notes || 'Sin notas.' }}
            </p>
            <div *ngIf="selectedPrescription.medications?.length" class="space-y-2">
              <div
                *ngFor="let med of selectedPrescription.medications"
                class="p-3 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div class="font-bold text-slate-800">{{ med.name }}</div>
                <div class="text-xs text-slate-500">
                  {{ med.dosage }} - {{ med.frequency }} - {{ med.duration }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DoctorRecetasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  filterDate = new Date().toISOString().split('T')[0];
  searchTerm = '';
  isLoading = false;

  showPrescription = false;
  isLoadingPrescription = false;
  selectedPrescription: any = null;

  get filteredAppointments() {
    let filtered = this.appointments.filter((a) => a.status === 'COMPLETED');
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.patients?.first_name?.toLowerCase().includes(term) ||
          a.patients?.last_name?.toLowerCase().includes(term) ||
          a.id?.toLowerCase().includes(term),
      );
    }
    return filtered;
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments(this.filterDate || undefined).subscribe({
      next: (data) => {
        this.appointments = data;
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

  openPrescription(app: Appointment) {
    if (!app.id) return;
    this.showPrescription = true;
    this.isLoadingPrescription = true;
    this.selectedPrescription = null;
    this.appointmentsService.getPrescription(app.id).subscribe({
      next: (data) => {
        const pres = Array.isArray(data) ? data[0] : data;
        this.selectedPrescription = pres || null;
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePrescription() {
    this.showPrescription = false;
    this.selectedPrescription = null;
  }
}
