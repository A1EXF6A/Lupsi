import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService } from '../../core/services/appointments.service';
import { CatalogsService } from '../../core/services/catalogs.service';

@Component({
  selector: 'app-agenda-diaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Agenda de Disponibilidad</h2>
        <button
          *ngIf="selectedDoctor"
          (click)="openModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Abrir Horario
        </button>
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden p-6">
        <div class="flex flex-wrap gap-4 items-end mb-6">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-bold text-slate-500 mb-1">Doctor</label>
            <select [(ngModel)]="selectedDoctor" (ngModelChange)="loadSlots()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">Seleccione un doctor...</option>
              <option *ngFor="let doc of doctors" [value]="doc.id">
                Dr/Dra. {{ doc.profiles?.first_name }} {{ doc.profiles?.last_name }} ({{ doc.specialty }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Fecha</label>
            <input type="date" [(ngModel)]="selectedDate" (ngModelChange)="loadSlots()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          </div>
          <div>
            <button (click)="loadSlots()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 text-sm h-10">
              Actualizar
            </button>
          </div>
        </div>

        <div *ngIf="isLoading" class="p-10 flex flex-col items-center justify-center text-slate-400">
          <svg class="animate-spin h-8 w-8 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando agenda...
        </div>

        <div *ngIf="errorMessage" class="mb-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-bold">
          {{ errorMessage }}
        </div>

        <div *ngIf="!selectedDoctor && !isLoading" class="text-center py-12 text-slate-500 font-medium">
          Seleccione un doctor para ver su disponibilidad.
        </div>

        <div *ngIf="selectedDoctor && !isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div *ngFor="let slot of slots" class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center items-center group relative hover:border-green-300 transition-colors">
            <div class="text-sm font-bold text-slate-800">
              {{ slot.start_time | slice:11:16 }}
            </div>
            <div class="text-xs font-medium text-slate-500">
              a {{ slot.end_time | slice:11:16 }}
            </div>
            
            <button *ngIf="!slot.is_booked" (click)="deleteSlot(slot.id)" class="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200" title="Eliminar bloque">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <span *ngIf="slot.is_booked" class="absolute -top-2 -right-2 bg-amber-100 text-amber-600 rounded-full p-1 opacity-100" title="Ocupado">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
          </div>
          
          <div *ngIf="slots.length === 0" class="col-span-full text-center py-8 text-slate-500">
            El doctor no tiene disponibilidad registrada en esta fecha.
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Horario -->
    <div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">Aperturar Horario</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form (ngSubmit)="saveSlot()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Hora Inicio</label>
              <input type="time" [(ngModel)]="formData.startTime" name="startTime" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Hora Fin</label>
              <input type="time" [(ngModel)]="formData.endTime" name="endTime" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            </div>
          </div>
          <p class="text-xs text-slate-400">Apertura un bloque continuo. Se registrará la disponibilidad para que los pacientes agenden citas.</p>
          
          <div class="pt-4 flex gap-3">
            <button type="button" (click)="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="isSaving" class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
              {{ isSaving ? 'Guardando...' : 'Aperturar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class AgendaDiariaComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  catalogsService = inject(CatalogsService);
  cdr = inject(ChangeDetectorRef);
  
  doctors: any[] = [];
  slots: any[] = [];
  selectedDoctor: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  showModal = false;

  formData = {
    startTime: '08:00',
    endTime: '08:30'
  };

  ngOnInit() {
    this.catalogsService.getDoctors().subscribe({
      next: (data) => this.doctors = data,
      error: () => this.errorMessage = 'Error cargando doctores.'
    });
  }

  loadSlots() {
    if (!this.selectedDoctor) {
      this.slots = [];
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.appointmentsService.getAvailableSlots(this.selectedDoctor, this.selectedDate).subscribe({
      next: (data) => {
        this.slots = data.sort((a, b) => a.start_time.localeCompare(b.start_time));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error cargando la disponibilidad.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveSlot() {
    if (!this.formData.startTime || !this.formData.endTime || !this.selectedDoctor) return;
    this.isSaving = true;

    // Convert time to ISO strings
    const startIso = `${this.selectedDate}T${this.formData.startTime}:00.000Z`;
    const endIso = `${this.selectedDate}T${this.formData.endTime}:00.000Z`;

    const payload = {
      doctor_id: this.selectedDoctor,
      start_time: startIso,
      end_time: endIso
    };

    this.appointmentsService.createAvailableSlot(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadSlots();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.message || 'Error al guardar el bloque.';
        this.isSaving = false;
        this.closeModal();
      }
    });
  }

  deleteSlot(id: string) {
    if (confirm('¿Eliminar bloque de disponibilidad?')) {
      this.appointmentsService.deleteAvailableSlot(id).subscribe({
        next: () => this.loadSlots(),
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al eliminar.';
        }
      });
    }
  }
}
