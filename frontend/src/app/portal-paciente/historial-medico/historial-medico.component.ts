import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ClinicalHistoryService,
  ClinicalHistory,
} from '../../core/services/clinical-history.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-3xl shadow-xl border border-blue-50/50">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          Historial Médico
        </h2>
      </div>

      <div *ngIf="isLoading" class="text-center py-10">
        <div class="inline-flex items-center gap-2 text-blue-600 font-medium">
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
          Cargando historial...
        </div>
      </div>

      <div
        *ngIf="!isLoading && records.length === 0"
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
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <p class="text-slate-500 font-medium mb-1">No tienes registros en tu historial médico.</p>
        <p class="text-slate-400 text-sm mb-4">
          Los doctores añadirán notas a tu historial después de las consultas.
        </p>
      </div>

      <div
        *ngIf="!isLoading && records.length > 0"
        class="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent"
      >
        <div
          *ngFor="let record of records"
          class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
        >
          <div
            class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"
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
              <path d="M2 12h4l3-9 5 18 3-9h5" />
            </svg>
          </div>

          <div
            class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{{
                record.created_at | date: 'dd MMM, yyyy'
              }}</span>
              <span class="text-xs font-bold text-slate-500"
                >Dr/Dra. {{ record.doctors?.profiles?.last_name || 'Especialista' }}</span
              >
            </div>

            <div class="space-y-3">
              <div *ngIf="record.previous_conditions && record.previous_conditions.length > 0">
                <h4 class="text-xs font-bold text-slate-400 uppercase">Condiciones Previas</h4>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    *ngFor="let cond of record.previous_conditions"
                    class="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                    >{{ cond }}</span
                  >
                </div>
              </div>

              <div *ngIf="record.allergies && record.allergies.length > 0">
                <h4 class="text-xs font-bold text-rose-400 uppercase">Alergias</h4>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    *ngFor="let alg of record.allergies"
                    class="text-xs bg-rose-50 border border-rose-100 text-rose-600 px-2 py-0.5 rounded-md"
                    >{{ alg }}</span
                  >
                </div>
              </div>

              <div *ngIf="record.notes">
                <h4 class="text-xs font-bold text-slate-400 uppercase mb-1">Notas</h4>
                <p
                  class="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed"
                >
                  {{ record.notes }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HistorialMedicoComponent implements OnInit {
  clinicalHistoryService = inject(ClinicalHistoryService);
  authService = inject(AuthService);

  records: ClinicalHistory[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const token = this.authService.currentUserToken();
    if (!token) return;

    try {
      // Decode JWT to get patient (user) ID
      const payload = token.split('.')[1];
      const decoded: any = JSON.parse(atob(payload));
      const patientId = decoded.sub;

      this.isLoading = true;
      this.clinicalHistoryService.getByPatient(patientId).subscribe({
        next: (data) => {
          this.records = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching history', err);
          this.isLoading = false;
        },
      });
    } catch (e) {
      console.error('Invalid token', e);
    }
  }
}
