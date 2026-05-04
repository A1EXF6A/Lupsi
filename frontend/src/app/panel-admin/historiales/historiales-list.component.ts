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
        <button
          (click)="openModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Nueva Ficha
        </button>
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
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let record of histories" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{{ record.id | slice:0:8 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">{{ record.patient_id | slice:0:8 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-slate-500">{{ record.doctor_id | slice:0:8 }}</td>
              <td class="px-6 py-4 text-slate-500 truncate max-w-[200px]">{{ record.diagnosis || 'Sin diagnóstico' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(record)" class="text-slate-400 hover:text-blue-600 transition-colors mx-1" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button (click)="deleteRecord(record.id)" class="text-slate-400 hover:text-red-500 transition-colors mx-1" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="histories.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 font-medium">
                No hay fichas clínicas registradas en el sistema.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Ficha Clínica -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">{{ isEditing ? 'Editar Ficha Clínica' : 'Nueva Ficha Clínica' }}</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form (ngSubmit)="saveRecord()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">ID Paciente</label>
              <input type="text" [(ngModel)]="formData.patient_id" name="patient_id" required [disabled]="isEditing" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">ID Doctor</label>
              <input type="text" [(ngModel)]="formData.doctor_id" name="doctor_id" required [disabled]="isEditing" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Diagnóstico / Condiciones</label>
            <textarea [(ngModel)]="formData.diagnosis" name="diagnosis" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">URL Documento (Opcional)</label>
            <input type="url" [(ngModel)]="formData.document_url" name="document_url" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" (click)="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="isSaving" class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
              {{ isSaving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
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

  showModal = false;
  isEditing = false;
  isSaving = false;
  selectedId: string | null = null;
  
  formData = {
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    document_url: ''
  };

  ngOnInit() {
    this.loadData();
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

  openModal(item?: any) {
    if (item) {
      this.isEditing = true;
      this.selectedId = item.id;
      this.formData = { 
        patient_id: item.patient_id, 
        doctor_id: item.doctor_id, 
        diagnosis: item.diagnosis || '',
        document_url: item.document_url || ''
      };
    } else {
      this.isEditing = false;
      this.selectedId = null;
      this.formData = { patient_id: '', doctor_id: '', diagnosis: '', document_url: '' };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveRecord() {
    if (!this.formData.patient_id || !this.formData.doctor_id) return;
    this.isSaving = true;

    if (this.isEditing && this.selectedId) {
      this.historyService.update(this.selectedId, {
        diagnosis: this.formData.diagnosis,
        document_url: this.formData.document_url
      }).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.closeModal();
        }
      });
    } else {
      this.historyService.create(this.formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.isSaving = false;
          this.closeModal();
        }
      });
    }
  }

  deleteRecord(id: string) {
    if (confirm('¿Eliminar esta ficha médica permanentemente?')) {
      this.historyService.delete(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }
}
