import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalAttentionsService } from '../../core/services/clinical-attentions.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-historial-medico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-4 sm:p-6 rounded-3xl shadow-xl border border-blue-50/50">
      <!-- Encabezado Principal -->
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <div
            class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-md shadow-blue-100"
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
          Mi Historial de Consultas
        </h2>
      </div>

      <!-- Estado de Carga -->
      <div *ngIf="isLoading" class="text-center py-16">
        <div class="inline-flex items-center gap-3 text-blue-600 font-black text-sm">
          <svg
            class="animate-spin h-6 w-6 text-blue-600"
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
          Cargando tu historial de salud...
        </div>
      </div>

      <!-- Estado Vacío (Sin registros) -->
      <div
        *ngIf="!isLoading && records.length === 0"
        class="text-center py-16 px-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
      >
        <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-slate-400"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
        <p class="text-slate-700 font-bold text-lg mb-1">Aún no registras consultas médicas</p>
        <p class="text-slate-400 text-sm max-w-md mx-auto">
          Tus diagnósticos, signos vitales y recetas emitidas por los especialistas de LUPSI aparecerán aquí automáticamente tras tu primera consulta.
        </p>
      </div>

      <!-- Listado de Historial Clínico (Premium Cards) -->
      <div *ngIf="!isLoading && records.length > 0" class="space-y-8 animate-fade-in">
        <div
          *ngFor="let record of records"
          class="bg-white border border-slate-150 rounded-3xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-6"
        >
          <!-- Encabezado de la Tarjeta (Fecha y Especialista) -->
          <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Consulta Completada
              </span>
              <span class="text-slate-500 font-bold text-xs flex items-center gap-1">
                📅 {{ record.created_at | date: 'dd MMM, yyyy' }} a las {{ record.created_at | date: 'HH:mm' }}
              </span>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Especialista Atendiendo</p>
              <h4 class="text-sm font-black text-slate-800 mt-0.5">
                {{ record.doctors?.profiles?.first_name ? ('Dr/Dra. ' + record.doctors.profiles.first_name + ' ' + record.doctors.profiles.last_name) : 'Especialista LUPSI' }}
              </h4>
              <span class="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-widest mt-1 inline-block">
                {{ record.doctors?.specialty || 'Medicina General' }}
              </span>
            </div>
          </div>

          <!-- Sección: Signos Vitales Registrados -->
          <div *ngIf="record.vitals" class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">🎛️ Tus Signos Vitales Evaluados</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs font-bold">
              <div *ngIf="record.vitals.peso" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">⚖️ Peso</span>
                <span class="text-slate-700">{{ record.vitals.peso }} kg</span>
              </div>
              <div *ngIf="record.vitals.talla" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">📏 Talla</span>
                <span class="text-slate-700">{{ record.vitals.talla }} cm</span>
              </div>
              <div *ngIf="record.vitals.presion" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">🩺 Presión</span>
                <span class="text-slate-700">{{ record.vitals.presion }}</span>
              </div>
              <div *ngIf="record.vitals.temperatura" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">🌡️ Temp</span>
                <span class="text-slate-700">{{ record.vitals.temperatura }} °C</span>
              </div>
              <div *ngIf="record.vitals.pulso" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">💓 Pulso</span>
                <span class="text-slate-700">{{ record.vitals.pulso }} lpm</span>
              </div>
              <div *ngIf="record.vitals.respiracion" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">🫁 Resp</span>
                <span class="text-slate-700">{{ record.vitals.respiracion }} rpm</span>
              </div>
              <div *ngIf="record.vitals.saturacion" class="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
                <span class="text-slate-400 text-[9px] uppercase mb-1">🩸 Sat. O₂</span>
                <span class="text-slate-700">{{ record.vitals.saturacion }} %</span>
              </div>
            </div>
          </div>

          <!-- Diagnóstico e Indicaciones Médicas -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm font-semibold">
            <div *ngIf="record.diagnosis" class="space-y-1.5">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Diagnóstico Establecido</h4>
              <div class="bg-white p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                {{ record.diagnosis }}
              </div>
            </div>
            <div *ngIf="record.treatment" class="space-y-1.5">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Indicaciones / Plan de Cuidado</h4>
              <div class="bg-white p-4 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed shadow-sm">
                {{ record.treatment }}
              </div>
            </div>
          </div>

          <!-- Receta Médica y Medicamentos -->
          <div *ngIf="record.prescription" class="bg-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-100/30 space-y-4">
            <div class="flex items-center gap-2 pb-2 border-b border-blue-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <h4 class="text-sm font-black text-blue-800 uppercase tracking-wider">💊 Receta de Medicamentos Emitida</h4>
            </div>

            <!-- Listado de Medicamentos -->
            <div *ngIf="record.prescription.medications?.length > 0" class="divide-y divide-blue-100/40">
              <div *ngFor="let med of record.prescription.medications" class="py-3 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
                <div class="space-y-0.5">
                  <span class="text-sm font-black text-slate-800">{{ med.name }}</span>
                  <p class="text-slate-400 font-bold">Dosis: {{ med.dosage }}</p>
                </div>
                <div class="flex gap-4">
                  <span class="bg-blue-100/60 text-blue-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                    ⏱️ {{ med.frequency }}
                  </span>
                  <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold flex items-center gap-1">
                    📅 {{ med.duration }}
                  </span>
                </div>
              </div>
            </div>

            <div *ngIf="!record.prescription.medications || record.prescription.medications.length === 0" class="text-slate-400 text-xs italic">
              No se detallaron medicamentos específicos para esta receta.
            </div>

            <!-- Notas de Receta -->
            <div *ngIf="record.prescription.notes" class="bg-white p-3.5 rounded-xl border border-blue-100/50 text-xs text-slate-600 font-semibold italic shadow-sm">
              💡 <span class="font-bold text-slate-500">Recomendaciones:</span> {{ record.prescription.notes }}
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class HistorialMedicoComponent implements OnInit {
  clinicalAttentionsService = inject(ClinicalAttentionsService);
  appointmentsService = inject(AppointmentsService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  records: any[] = [];
  isLoading = false;

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
      // Decodificar el token JWT para obtener el ID de paciente (sub)
      const payload = token.split('.')[1];
      const decoded: any = JSON.parse(atob(payload));
      const patientId = decoded.sub;

      this.isLoading = true;
      this.clinicalAttentionsService.getAll({ patientId }).subscribe({
        next: (attentions) => {
          this.records = attentions.sort((a, b) => {
            const dateA = a.created_at || '';
            const dateB = b.created_at || '';
            return dateB.localeCompare(dateA);
          });

          // Recuperar recetas médicas asociadas en paralelo
          const prescriptionRequests = this.records.map((record) => {
            return new Promise<void>((resolve) => {
              if (!record.appointment_id) {
                record.prescription = null;
                resolve();
                return;
              }
              this.appointmentsService.getPrescription(record.appointment_id).subscribe({
                next: (prescData) => {
                  const prescription = Array.isArray(prescData) ? prescData[0] : prescData;
                  record.prescription = prescription || null;
                  resolve();
                },
                error: () => {
                  record.prescription = null;
                  resolve();
                },
              });
            });
          });

          Promise.all(prescriptionRequests).then(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          console.error('Error fetching clinical attentions', err);
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
