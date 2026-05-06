import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentsService } from '../../core/services/appointments.service';
import { CatalogsService } from '../../core/services/catalogs.service';

@Component({
  selector: 'app-metricas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <h2 class="text-3xl font-black text-slate-800 tracking-tight">Métricas Generales</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <!-- Total Doctors -->
        <div
          class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div
            class="w-14 h-14 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl"
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-800">{{ totalDoctors }}</div>
            <div class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-[10px]">
              Doctores Activos
            </div>
          </div>
        </div>

        <!-- Total Appointments -->
        <div
          class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div
            class="w-14 h-14 bg-blue-50 text-blue-600 flex items-center justify-center rounded-2xl"
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
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-800">{{ totalAppointments }}</div>
            <div class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-[10px]">
              Citas Registradas
            </div>
          </div>
        </div>

        <!-- Specialties -->
        <div
          class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div
            class="w-14 h-14 bg-amber-50 text-amber-600 flex items-center justify-center rounded-2xl"
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-800">{{ totalSpecialties }}</div>
            <div class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-[10px]">
              Especialidades
            </div>
          </div>
        </div>

        <!-- Appointment Types -->
        <div
          class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div
            class="w-14 h-14 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-2xl"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-800">{{ totalApptTypes }}</div>
            <div class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-[10px]">
              Tipos de Cita
            </div>
          </div>
        </div>

        <!-- Offices -->
        <div
          class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6"
        >
          <div
            class="w-14 h-14 bg-rose-50 text-rose-600 flex items-center justify-center rounded-2xl"
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
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
            </svg>
          </div>
          <div>
            <div class="text-3xl font-black text-slate-800">{{ totalOffices }}</div>
            <div class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-wider text-[10px]">
              Oficinas
            </div>
          </div>
        </div>
      </div>

      <!-- CSS Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- Appointments Status Chart -->
        <div
          class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
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
              class="text-blue-500"
            >
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Estado de Citas
          </h3>

          <div
            *ngIf="totalAppointments === 0"
            class="flex flex-col items-center justify-center py-10 text-slate-400"
          >
            <p>No hay citas registradas</p>
          </div>

          <div *ngIf="totalAppointments > 0" class="space-y-5">
            <!-- Pending -->
            <div>
              <div class="flex justify-between text-sm mb-1 font-bold">
                <span class="text-amber-600 flex items-center gap-1"
                  ><span class="w-2 h-2 rounded-full bg-amber-500"></span> Programadas</span
                >
                <span class="text-slate-600"
                  >{{ appointmentsByStatus.pending }} ({{
                    (appointmentsByStatus.pending / totalAppointments) * 100 | number: '1.0-0'
                  }}%)</span
                >
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  class="bg-amber-500 h-2.5 rounded-full transition-all duration-1000"
                  [style.width]="(appointmentsByStatus.pending / totalAppointments) * 100 + '%'"
                ></div>
              </div>
            </div>

            <!-- Completed -->
            <div>
              <div class="flex justify-between text-sm mb-1 font-bold">
                <span class="text-green-600 flex items-center gap-1"
                  ><span class="w-2 h-2 rounded-full bg-green-500"></span> Completadas</span
                >
                <span class="text-slate-600"
                  >{{ appointmentsByStatus.completed }} ({{
                    (appointmentsByStatus.completed / totalAppointments) * 100 | number: '1.0-0'
                  }}%)</span
                >
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  class="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                  [style.width]="(appointmentsByStatus.completed / totalAppointments) * 100 + '%'"
                ></div>
              </div>
            </div>

            <!-- Cancelled -->
            <div>
              <div class="flex justify-between text-sm mb-1 font-bold">
                <span class="text-rose-600 flex items-center gap-1"
                  ><span class="w-2 h-2 rounded-full bg-rose-500"></span> Canceladas</span
                >
                <span class="text-slate-600"
                  >{{ appointmentsByStatus.cancelled }} ({{
                    (appointmentsByStatus.cancelled / totalAppointments) * 100 | number: '1.0-0'
                  }}%)</span
                >
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  class="bg-rose-500 h-2.5 rounded-full transition-all duration-1000"
                  [style.width]="(appointmentsByStatus.cancelled / totalAppointments) * 100 + '%'"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Specialties Chart -->
        <div
          class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden"
        >
          <h3 class="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
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
              class="text-indigo-500"
            >
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Top Especialidades (por # Doctores)
          </h3>

          <div
            *ngIf="doctorsBySpecialty.length === 0"
            class="flex flex-col items-center justify-center py-10 text-slate-400"
          >
            <p>No hay doctores registrados</p>
          </div>

          <div *ngIf="doctorsBySpecialty.length > 0" class="space-y-4">
            <div *ngFor="let spec of doctorsBySpecialty">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-bold text-slate-700">{{ spec.specialty }}</span>
                <span class="font-bold text-indigo-600">{{ spec.count }} docs</span>
              </div>
              <div class="w-full bg-indigo-50 rounded-full h-3">
                <div
                  class="bg-gradient-to-r from-indigo-500 to-indigo-400 h-3 rounded-full transition-all duration-1000"
                  [style.width]="spec.percent + '%'"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class MetricasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  catalogsService = inject(CatalogsService);
  cdr = inject(ChangeDetectorRef);

  totalDoctors = 0;
  totalAppointments = 0;
  totalSpecialties = 0;
  totalApptTypes = 0;
  totalOffices = 0;

  appointmentsByStatus = { pending: 0, completed: 0, cancelled: 0 };
  doctorsBySpecialty: { specialty: string; count: number; percent: number }[] = [];

  ngOnInit() {
    this.catalogsService.getDoctors().subscribe({
      next: (d) => {
        this.totalDoctors = d.length;

        // Calculate doctors by specialty
        const specialtyCount: Record<string, number> = {};
        d.forEach((doc) => {
          const spec = doc.specialty || 'General';
          specialtyCount[spec] = (specialtyCount[spec] || 0) + 1;
        });
        this.doctorsBySpecialty = Object.keys(specialtyCount)
          .map((spec) => ({
            specialty: spec,
            count: specialtyCount[spec],
            percent: Math.round((specialtyCount[spec] / Math.max(1, d.length)) * 100),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        this.cdr.detectChanges();
      },
      error: (e) => console.error('Metrics getDoctors Error:', e),
    });
    this.catalogsService.getSpecialties().subscribe({
      next: (s) => {
        this.totalSpecialties = s.length;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Metrics getSpecialties Error:', e),
    });
    this.catalogsService.getAppointmentTypes().subscribe({
      next: (at) => {
        this.totalApptTypes = at.length;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Metrics getAppointmentTypes Error:', e),
    });
    this.catalogsService.getOffices().subscribe({
      next: (o) => {
        this.totalOffices = o.length;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Metrics getOffices Error:', e),
    });
    this.appointmentsService.getAppointments().subscribe({
      next: (a) => {
        this.totalAppointments = a.length;

        // Calculate appointments status
        this.appointmentsByStatus = { pending: 0, completed: 0, cancelled: 0 };
        a.forEach((appt) => {
          const s = appt.status?.toUpperCase() || 'SCHEDULED';
          if (s === 'SCHEDULED' || s === 'PENDING') this.appointmentsByStatus.pending++;
          else if (s === 'COMPLETED') this.appointmentsByStatus.completed++;
          else if (s === 'CANCELLED') this.appointmentsByStatus.cancelled++;
        });

        this.cdr.detectChanges();
      },
      error: (e) => console.error('Metrics getAppointments Error:', e),
    });
  }
}
