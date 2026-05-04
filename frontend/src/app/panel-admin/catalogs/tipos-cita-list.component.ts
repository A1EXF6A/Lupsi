import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogsService, AppointmentType } from '../../core/services/catalogs.service';

@Component({
  selector: 'app-tipos-cita-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Tipos de Citas</h2>
        <button
          (click)="openModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Nuevo Tipo
        </button>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex flex-col items-center justify-center text-slate-400">
          <svg class="animate-spin h-8 w-8 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando tipos de cita...
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
              <th scope="col" class="px-6 py-4">ID</th>
              <th scope="col" class="px-6 py-4">Nombre Tipo de Cita</th>
              <th scope="col" class="px-6 py-4 text-center">Duración (Mins)</th>
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let item of types" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap font-bold text-slate-500">{{ item.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{{ item.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {{ item.durationMinutes }} min
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal(item)" class="text-slate-400 hover:text-blue-600 transition-colors mx-1" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button (click)="deleteAppointmentType(item.id)" class="text-slate-400 hover:text-red-500 transition-colors mx-1" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="types.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                No se encontraron tipos de cita.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">{{ isEditing ? 'Editar Tipo de Cita' : 'Nuevo Tipo de Cita' }}</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form (ngSubmit)="saveAppointmentType()" class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Nombre del Tipo</label>
            <input type="text" [(ngModel)]="formData.name" name="name" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Duración (minutos)</label>
            <input type="number" [(ngModel)]="formData.durationMinutes" name="durationMinutes" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
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
export class TiposCitaListComponent implements OnInit {
  catalogsService = inject(CatalogsService);
  cdr = inject(ChangeDetectorRef);

  types: AppointmentType[] = [];
  isLoading = true;
  errorMessage = '';

  showModal = false;
  isEditing = false;
  isSaving = false;
  selectedId: string | null = null;
  
  formData = {
    name: '',
    durationMinutes: 30
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.catalogsService.getAppointmentTypes().subscribe({
      next: (data) => {
        this.types = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointment types:', err);
        this.errorMessage = 'No se pudo cargar la información.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openModal(item?: AppointmentType) {
    if (item) {
      this.isEditing = true;
      this.selectedId = item.id;
      this.formData = { name: item.name, durationMinutes: item.durationMinutes || 30 };
    } else {
      this.isEditing = false;
      this.selectedId = null;
      this.formData = { name: '', durationMinutes: 30 };
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveAppointmentType() {
    if (!this.formData.name || !this.formData.durationMinutes) return;
    this.isSaving = true;

    if (this.isEditing && this.selectedId) {
      this.catalogsService.updateAppointmentType(this.selectedId, this.formData).subscribe({
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
      this.catalogsService.createAppointmentType(this.formData).subscribe({
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

  deleteAppointmentType(id: string) {
    if (confirm('¿Eliminar este tipo de cita permanentemente?')) {
      this.catalogsService.deleteAppointmentType(id).subscribe({
        next: () => this.loadData(),
        error: (err) => console.error(err)
      });
    }
  }
}
