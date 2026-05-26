import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ClinicalAttentionsService,
  ClinicalAttention,
} from '../../core/services/clinical-attentions.service';

@Component({
  selector: 'app-doctor-fichas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Fichas Clínicas</h2>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <!-- Filtros de Búsqueda -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            [(ngModel)]="filters.search"
            type="text"
            placeholder="Buscar por paciente, diagnóstico o ID..."
            class="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
          />
          <input
            [(ngModel)]="filters.date"
            type="date"
            class="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-slate-600"
          />
          <button
            (click)="loadData()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-100 active:scale-[0.99]"
          >
            🔄 Actualizar Listado
          </button>
        </div>

        <!-- Estado de Carga -->
        <div *ngIf="isLoading" class="p-16 text-center text-slate-400 font-bold flex flex-col justify-center items-center gap-3">
          <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando expedientes médicos...</span>
        </div>

        <!-- Error -->
        <div *ngIf="errorMessage" class="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-medium mb-6">
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Tabla de Fichas Clínicas -->
        <div class="overflow-x-auto" *ngIf="!isLoading && !errorMessage">
          <table class="w-full text-left text-sm text-slate-600 border-collapse">
            <thead class="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="px-6 py-4">Fecha</th>
                <th class="px-6 py-4">Paciente</th>
                <th class="px-6 py-4">Diagnóstico</th>
                <th class="px-6 py-4">Tratamiento</th>
                <th class="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100/50">
              <tr 
                *ngFor="let record of filteredRecords"
                (click)="selectedRecord = record"
                class="hover:bg-blue-50/30 cursor-pointer transition-colors group"
              >
                <td class="px-6 py-4 whitespace-nowrap font-bold text-slate-700">
                  {{ record.created_at | date: 'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-extrabold text-blue-900 group-hover:text-blue-700 transition-colors">
                    {{ record.patients?.first_name }} {{ record.patients?.last_name }}
                  </div>
                  <div class="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                    DNI: {{ record.patients?.dni || 'N/D' }}
                  </div>
                </td>
                <td class="px-6 py-4 max-w-[200px] truncate font-medium text-slate-600">
                  {{ record.diagnosis || 'Sin diagnóstico' }}
                </td>
                <td class="px-6 py-4 max-w-[250px] truncate font-medium text-slate-600">
                  {{ record.treatment || 'Sin indicaciones' }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap">
                  <button 
                    class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-black px-3.5 py-1.5 rounded-xl border border-blue-100 transition-colors"
                  >
                    👁️ Abrir Ficha
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredRecords.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 font-bold">
                  No se encontraron fichas clínicas registradas.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Detalle de Ficha Clínica Premium -->
      <div
        *ngIf="selectedRecord"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <div class="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Encabezado del Modal -->
          <div class="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold">Ficha Clínica Detallada</h3>
                <p class="text-xs text-slate-300">Registro histórico de atención médica</p>
              </div>
            </div>
            <button
              (click)="selectedRecord = null"
              class="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cuerpo del Modal -->
          <div class="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
            
            <!-- Resumen de Paciente y Cita -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-sm">
              <div class="space-y-3">
                <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Paciente</p>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-black text-blue-700 text-sm uppercase">
                    {{ selectedRecord.patients?.first_name?.charAt(0) }}{{ selectedRecord.patients?.last_name?.charAt(0) }}
                  </div>
                  <div>
                    <h4 class="font-extrabold text-slate-800 leading-tight">
                      {{ selectedRecord.patients?.first_name }} {{ selectedRecord.patients?.last_name }}
                    </h4>
                    <p class="text-xs text-slate-500 mt-0.5">DNI: {{ selectedRecord.patients?.dni || 'No registrado' }}</p>
                  </div>
                </div>
              </div>
              <div class="space-y-1.5">
                <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Detalles de la Consulta</p>
                <p class="text-slate-700 font-medium"><strong>Fecha:</strong> {{ selectedRecord.created_at | date: 'dd MMM, yyyy - HH:mm' }}</p>
                <p class="text-slate-700 font-medium">
                  <strong>Atendido por:</strong>
                  {{ selectedRecord.doctors?.profiles?.first_name ? 'Dr/Dra. ' + selectedRecord.doctors?.profiles?.first_name + ' ' + selectedRecord.doctors?.profiles?.last_name : 'Médico General' }}
                </p>
                <span class="inline-block text-[10px] font-black bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded uppercase tracking-wider mt-1">
                  {{ selectedRecord.doctors?.specialty || 'Medicina General' }}
                </span>
              </div>
            </div>

            <!-- Panel de Alertas Clínicas Automatizadas (Think Well!) -->
            <div
              *ngIf="getClinicalAlerts(selectedRecord.vitals).length > 0"
              class="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3"
            >
              <div class="text-rose-500 mt-0.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="space-y-1">
                <h5 class="font-extrabold text-rose-900 text-sm">Alertas y Hallazgos Clínicos</h5>
                <ul class="list-disc pl-5 text-xs text-rose-800 font-bold space-y-1">
                  <li *ngFor="let alert of getClinicalAlerts(selectedRecord.vitals)">
                    {{ alert.message }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- Signos Vitales y Cálculo del IMC -->
            <div *ngIf="selectedRecord.vitals" class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-xs font-black text-slate-400 uppercase tracking-wider">🎛️ Signos Vitales Evaluados</p>
                <!-- IMC Autocalculado -->
                <span
                  *ngIf="calculateBMI(selectedRecord.vitals['peso'], selectedRecord.vitals['talla']) as bmi"
                  class="border text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 transition-all {{ bmi.class }}"
                >
                  ⚖️ IMC Calculado: {{ bmi.value }} ({{ bmi.label }})
                </span>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs font-bold">
                <div *ngIf="selectedRecord.vitals['peso']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">⚖️ Peso</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['peso'] }} kg</span>
                </div>
                <div *ngIf="selectedRecord.vitals['talla']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">📏 Talla</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['talla'] }} cm</span>
                </div>
                <div *ngIf="selectedRecord.vitals['presion']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">🩺 Presión</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['presion'] }}</span>
                </div>
                <div *ngIf="selectedRecord.vitals['temperatura']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">🌡️ Temp</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['temperatura'] }} °C</span>
                </div>
                <div *ngIf="selectedRecord.vitals['pulso']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">💓 Pulso</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['pulso'] }} lpm</span>
                </div>
                <div *ngIf="selectedRecord.vitals['respiracion']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">🫁 Resp</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['respiracion'] }} rpm</span>
                </div>
                <div *ngIf="selectedRecord.vitals['saturacion']" class="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span class="text-slate-400 text-[9px] uppercase mb-1">🩸 Sat. O₂</span>
                  <span class="text-slate-700 text-sm font-black">{{ selectedRecord.vitals['saturacion'] }} %</span>
                </div>
              </div>
            </div>

            <!-- Notas clínicas, Diagnóstico y Tratamiento -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-semibold">
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">🔬 Diagnóstico Médico</h4>
                  <div class="bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50 text-slate-800 leading-relaxed shadow-sm min-h-[5rem]">
                    {{ selectedRecord.diagnosis || 'Sin diagnóstico registrado' }}
                  </div>
                </div>

                <div class="space-y-1.5">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">📝 Notas de Evolución / Anamnesis</h4>
                  <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-750 leading-relaxed shadow-sm min-h-[7rem] whitespace-pre-wrap font-medium">
                    {{ selectedRecord.notes || 'Sin anotaciones clínicas de evolución registradas.' }}
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="space-y-1.5">
                  <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 Prescripción / Plan de Tratamiento</h4>
                  <div class="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/30 text-slate-800 leading-relaxed shadow-sm min-h-[14rem] whitespace-pre-wrap">
                    {{ selectedRecord.treatment || 'Sin indicaciones de tratamiento registradas' }}
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Pie del Modal (Acciones) -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              (click)="printRecord(selectedRecord)"
              class="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2 active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir Expediente Completo
            </button>
            <button
              (click)="selectedRecord = null"
              class="border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all"
            >
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class DoctorFichasComponent implements OnInit {
  clinicalAttentionsService = inject(ClinicalAttentionsService);
  cdr = inject(ChangeDetectorRef);

  records: ClinicalAttention[] = [];
  isLoading = true;
  errorMessage = '';
  selectedRecord: ClinicalAttention | null = null;

  filters = {
    search: '',
    date: '',
  };

  get filteredRecords() {
    let filtered = this.records;
    if (this.filters.date) {
      filtered = filtered.filter((r) => (r.created_at || '').startsWith(this.filters.date));
    }
    if (this.filters.search) {
      const term = this.filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.id?.toLowerCase().includes(term) ||
          r.patients?.first_name?.toLowerCase().includes(term) ||
          r.patients?.last_name?.toLowerCase().includes(term) ||
          r.diagnosis?.toLowerCase().includes(term),
      );
    }
    return filtered;
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    this.clinicalAttentionsService.getAll().subscribe({
      next: (data) => {
        this.records = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'No se pudo cargar la información.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Métodos Clínicos de Valor Añadido para el Médico

  calculateBMI(pesoStr: any, tallaStr: any): { value: number; label: string; class: string } | null {
    const peso = parseFloat(pesoStr);
    const talla = parseFloat(tallaStr);
    if (isNaN(peso) || isNaN(talla) || talla <= 0) return null;
    
    // Si la talla se ingresó en cm (ej. 170), la pasamos a metros (1.7)
    const tallaMetros = talla > 3 ? talla / 100 : talla;
    const bmi = parseFloat((peso / (tallaMetros * tallaMetros)).toFixed(1));
    
    let label = 'Normal';
    let css = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (bmi < 18.5) {
      label = 'Bajo peso';
      css = 'bg-amber-50 text-amber-700 border-amber-100';
    } else if (bmi >= 25 && bmi < 30) {
      label = 'Sobrepeso';
      css = 'bg-orange-50 text-orange-700 border-orange-100';
    } else if (bmi >= 30) {
      label = 'Obesidad';
      css = 'bg-rose-50 text-rose-700 border-rose-100';
    }
    return { value: bmi, label, class: css };
  }

  getClinicalAlerts(vitals: any): { message: string; type: 'warning' | 'danger' | 'info' }[] {
    const alerts: { message: string; type: 'warning' | 'danger' | 'info' }[] = [];
    if (!vitals) return alerts;

    // Presión arterial
    if (vitals.presion) {
      const parts = vitals.presion.split('/');
      const systolic = parseInt(parts[0]);
      const diastolic = parseInt(parts[1]);
      if (!isNaN(systolic) && (systolic >= 140 || (diastolic && diastolic >= 90))) {
        alerts.push({ message: 'Presión Arterial Elevada (Posible Hipertensión)', type: 'danger' });
      } else if (!isNaN(systolic) && (systolic < 90)) {
        alerts.push({ message: 'Presión Arterial Baja (Posible Hipotensión)', type: 'warning' });
      }
    }

    // Temperatura
    if (vitals.temperatura) {
      const temp = parseFloat(vitals.temperatura);
      if (!isNaN(temp)) {
        if (temp >= 38.0) {
          alerts.push({ message: `Fiebre (${temp}°C)`, type: 'danger' });
        } else if (temp >= 37.5) {
          alerts.push({ message: `Febrícula (${temp}°C)`, type: 'warning' });
        } else if (temp < 35.0) {
          alerts.push({ message: `Hipotermia (${temp}°C)`, type: 'danger' });
        }
      }
    }

    // Pulso / Frecuencia Cardíaca
    if (vitals.pulso) {
      const pulse = parseInt(vitals.pulso);
      if (!isNaN(pulse)) {
        if (pulse > 100) {
          alerts.push({ message: `Taquicardia (${pulse} lpm en reposo)`, type: 'danger' });
        } else if (pulse < 60) {
          alerts.push({ message: `Bradicardia (${pulse} lpm en reposo)`, type: 'warning' });
        }
      }
    }

    // Saturación de oxígeno
    if (vitals.saturacion) {
      const sat = parseInt(vitals.saturacion);
      if (!isNaN(sat) && sat < 95) {
        alerts.push({ message: `Saturación de Oxígeno Baja (${sat}% - Hipoxia sutil)`, type: 'danger' });
      }
    }

    return alerts;
  }

  printRecord(record: ClinicalAttention) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedDate = new Date(record.created_at || '').toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const vitalsHtml = record.vitals ? Object.entries(record.vitals)
      .map(([key, val]) => `<li><strong>${key.toUpperCase()}:</strong> ${val}</li>`)
      .join('') : 'Sin registro de signos vitales';

    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha Clínica - ${record.patients?.first_name} ${record.patients?.last_name}</title>
          <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; padding: 40px; }
            .header { text-align: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1e3a8a; font-size: 26px; font-weight: 900; letter-spacing: 0.5px; }
            .header p { margin: 6px 0 0; color: #64748b; font-size: 13px; font-weight: 700; letter-spacing: 1px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .section { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
            .section-title { font-weight: 800; color: #1e3a8a; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
            .val { font-size: 14px; color: #334155; margin: 6px 0; }
            ul { padding-left: 20px; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            li { font-size: 13px; color: #475569; }
            .footer { text-align: center; margin-top: 60px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LUPSI - CENTRO MÉDICO</h1>
            <p>HISTORIAL CLÍNICO Y REGISTRO DE ATENCIÓN OFICIAL</p>
          </div>
          
          <div class="grid">
            <div class="section">
              <div class="section-title">Información del Paciente</div>
              <p class="val"><strong>Nombre Completo:</strong> ${record.patients?.first_name} ${record.patients?.last_name}</p>
              <p class="val"><strong>Cédula / DNI:</strong> ${record.patients?.dni || 'No registrado'}</p>
              <p class="val"><strong>Código Expediente:</strong> ${record.patient_id}</p>
            </div>
            <div class="section">
              <div class="section-title">Detalles de la Consulta</div>
              <p class="val"><strong>Fecha y Hora:</strong> ${formattedDate}</p>
              <p class="val"><strong>Médico Tratante:</strong> ${record.doctors?.profiles?.first_name ? 'Dr/Dra. ' + record.doctors?.profiles?.first_name + ' ' + record.doctors?.profiles?.last_name : 'Médico General'}</p>
              <p class="val"><strong>Especialidad:</strong> ${record.doctors?.specialty || 'Medicina General'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Signos Vitales y Mediciones Fisiológicas</div>
            <ul>${vitalsHtml}</ul>
          </div>

          <div class="section">
            <div class="section-title">Diagnóstico Clínico</div>
            <p class="val" style="font-size: 15px; font-weight: bold; color: #1e293b;">${record.diagnosis || 'Sin diagnóstico registrado'}</p>
          </div>

          <div class="section">
            <div class="section-title">Indicaciones, Prescripción y Plan de Tratamiento</div>
            <p class="val" style="white-space: pre-wrap;">${record.treatment || 'Sin indicaciones de cuidado registradas'}</p>
          </div>

          <div class="section">
            <div class="section-title">Evolución y Notas Médicas Adicionales</div>
            <p class="val" style="white-space: pre-wrap;">${record.notes || 'Sin anotaciones privadas registradas para esta atención.'}</p>
          </div>

          <div class="footer">
            <p>Este expediente clínico es estrictamente confidencial bajo la Ley de Derechos de Pacientes. Centro Médico LUPSI © 2026</p>
          </div>

          <script>
            window.onload = function() { 
              window.print(); 
              setTimeout(function(){ window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }
}
