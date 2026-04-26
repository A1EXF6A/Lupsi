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
        <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
        </div>
        Mis Citas Médicas
      </h2>

      <div *ngIf="isLoading" class="text-center py-10">
        <div class="inline-flex items-center gap-2 text-green-600 font-medium">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Cargando citas...
        </div>
      </div>

      <div *ngIf="!isLoading && appointments.length === 0" class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-300 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <p class="text-slate-500 font-medium mb-1">Aún no tienes citas agendadas.</p>
        <p class="text-slate-400 text-sm mb-4">Puedes agendar tu primera consulta médica desde la sección de Nueva Reserva.</p>
      </div>

      <div *ngIf="!isLoading && appointments.length > 0" class="space-y-4">
        <div *ngFor="let apt of appointments" class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all gap-4">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
              <span class="text-xs font-bold text-slate-500 uppercase">{{ apt.appointment_time | date:'MMM' }}</span>
              <span class="text-lg font-black text-gray-900 leading-none">{{ apt.appointment_time | date:'dd' }}</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900">Consulta con Dr/Dra. {{ apt.doctors?.profiles?.first_name || 'No especificado' }} {{ apt.doctors?.profiles?.last_name || '' }}</h3>
              <p class="text-sm text-slate-500 font-medium mt-0.5">Especialidad: <span class="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs ml-1">{{ apt.doctors?.specialty || 'General' }}</span></p>
              <div class="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Hora: {{ apt.appointment_time | date:'h:mm a' }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
             <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1.5">
               <span class="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
               {{ apt.status || 'PROGRAMADA' }}
             </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MisCitasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        // Sort by date mostly ascending or descending depending on what's best, let's just reverse to show latest potentially or keep as is.
        this.appointments = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
