import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
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
         class="space-y-6"
       >
         <div
           *ngFor="let record of records"
           class="p-5 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm"
         >
           <div class="flex items-center justify-between mb-3">
             <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
               {{ record.created_at | date: 'dd MMM, yyyy' }}
             </span>
             <span class="text-xs font-bold text-slate-500">
               Dr/Dra. {{ record.doctors?.profiles?.last_name || 'Especialista' }}
             </span>
           </div>

           <div class="space-y-3">
             <div *ngIf="record.diagnosis">
               <h4 class="text-xs font-bold text-slate-400 uppercase mb-1">Diagnostico</h4>
               <p class="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                 {{ record.diagnosis }}
               </p>
             </div>
             <div *ngIf="record.notes">
               <h4 class="text-xs font-bold text-slate-400 uppercase mb-1">Notas</h4>
               <p class="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                 {{ record.notes }}
               </p>
             </div>
              <div *ngIf="isValidDocumentUrl(record.document_url)">
                <h4 class="text-xs font-bold text-slate-400 uppercase mb-1">Documento</h4>
                <a
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  [href]="record.document_url"
                  target="_blank"
                  rel="noopener"
                >
                  Ver documento
                </a>
              </div>
              <div *ngIf="record.document_url && !isValidDocumentUrl(record.document_url)">
                <h4 class="text-xs font-bold text-slate-400 uppercase mb-1">Documento</h4>
                <p class="text-sm text-slate-500">Sin documento adjunto.</p>
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
  cdr = inject(ChangeDetectorRef);

  records: ClinicalHistory[] = [];
  isLoading = false;

  isValidDocumentUrl(url?: string | null): boolean {
    if (!url) return false;
    if (url === '-') return false;
    return /^https?:\/\//i.test(url);
  }

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    const token = this.authService.currentUserToken();
    if (!token) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

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
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching history', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
    } catch (e) {
      console.error('Invalid token', e);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
