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
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Fichas Clinicas</h2>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            [(ngModel)]="filters.search"
            type="text"
            placeholder="Buscar por paciente, diagnostico o ID..."
            class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            [(ngModel)]="filters.date"
            type="date"
            class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            (click)="loadData()"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors"
          >
            Actualizar
          </button>
        </div>

        <div *ngIf="isLoading" class="p-10 text-center text-slate-400">Cargando...</div>
        <div *ngIf="errorMessage" class="p-4 bg-rose-50 text-rose-700 rounded-xl">
          {{ errorMessage }}
        </div>

        <table *ngIf="!isLoading && !errorMessage" class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs">
            <tr>
              <th class="px-6 py-4">Fecha</th>
              <th class="px-6 py-4">Paciente</th>
              <th class="px-6 py-4">Diagnostico</th>
              <th class="px-6 py-4">Tratamiento</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let record of filteredRecords">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ record.created_at | date: 'shortDate' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ record.patients?.first_name }} {{ record.patients?.last_name }}
              </td>
              <td class="px-6 py-4 text-slate-500">
                {{ record.diagnosis || 'Sin diagnostico' }}
              </td>
              <td class="px-6 py-4 text-slate-500">
                {{ record.treatment || 'Sin tratamiento' }}
              </td>
            </tr>
            <tr *ngIf="filteredRecords.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                No hay fichas clinicas registradas.
              </td>
            </tr>
          </tbody>
        </table>
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
        this.errorMessage = 'No se pudo cargar la informacion.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
