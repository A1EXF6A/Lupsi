import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClinicalHistoryService, ClinicalHistory } from '../../core/services/clinical-history.service';

@Component({
  selector: 'app-historiales-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Fichas Clínicas</h2>
      </div>

      <!-- Búsqueda -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar por ID de ficha, paciente o doctor..." class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm">
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex flex-col items-center justify-center text-slate-400">
          <svg class="animate-spin h-8 w-8 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando historiales médicos...
        </div>

        <div *ngIf="errorMessage" class="p-6 bg-red-50 text-red-600 border-b border-red-100 text-sm font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ errorMessage }}
        </div>

        <table *ngIf="!isLoading && !errorMessage" class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th scope="col" class="px-6 py-4">ID de Ficha</th>
              <th scope="col" class="px-6 py-4">ID Paciente</th>
              <th scope="col" class="px-6 py-4">ID Doctor</th>
              <th scope="col" class="px-6 py-4">Diagnóstico</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let record of filteredHistories | slice:0:visibleCount; let i = index" class="hover:bg-slate-50 transition-colors animate-fade-in-up" [style.animation-delay.ms]="i * 50">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{{ record.id | slice:0:8 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">{{ record.patient_id | slice:0:8 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">{{ record.doctor_id | slice:0:8 }}</td>
              <td class="px-6 py-4 text-slate-500 truncate max-w-[200px]">{{ record.diagnosis || 'Sin diagnóstico' }}</td>
            </tr>
            <tr *ngIf="filteredHistories.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500 font-medium">
                No hay fichas clínicas registradas en el sistema.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación local -->
        <div *ngIf="filteredHistories.length > visibleCount" class="p-6 border-t border-slate-100 flex justify-center">
          <button (click)="loadMore()" class="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors border border-slate-200 shadow-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            Mostrar más fichas
          </button>
        </div>
      </div>
    </div>
  `,
})
export class HistorialesListComponent implements OnInit {
  historyService = inject(ClinicalHistoryService);
  cdr = inject(ChangeDetectorRef);

  histories: ClinicalHistory[] = [];
  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  visibleCount = 10;
  
  get filteredHistories() {
    if (!this.searchTerm) return this.histories;
    const term = this.searchTerm.toLowerCase();
    return this.histories.filter(h => 
      h.id?.toLowerCase().includes(term) ||
      h.patient_id?.toLowerCase().includes(term) ||
      h.doctor_id?.toLowerCase().includes(term)
    );
  }

  ngOnInit() {
    this.loadData();
  }

  loadMore() {
    this.visibleCount += 10;
  }

  loadData() {
    this.isLoading = true;
    this.historyService.getAll().subscribe({
      next: (data) => {
        this.histories = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching clinical histories:', err);
        this.errorMessage = 'No se pudo cargar la información.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
