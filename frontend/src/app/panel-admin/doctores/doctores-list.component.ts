import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogsService, Doctor } from '../../core/services/catalogs.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-doctores-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Doctores Registrados</h2>
        <button
          (click)="openModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Añadir Doctor
        </button>
      </div>

      <!-- Búsqueda -->
      <div class="mb-4">
        <input type="text" [(ngModel)]="searchTerm" placeholder="Buscar doctor por nombre o especialidad..." class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm">
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div *ngIf="isLoading" class="p-10 flex flex-col items-center justify-center text-slate-400">
          <svg class="animate-spin h-8 w-8 text-green-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando datos...
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
              <th scope="col" class="px-6 py-4">Profesional</th>
              <th scope="col" class="px-6 py-4">Especialidad</th>
              <th scope="col" class="px-6 py-4 text-center">Estado</th>
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr *ngFor="let doc of filteredDoctors" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center">
                    {{ doc.profiles?.first_name?.[0] || '?' }}{{ doc.profiles?.last_name?.[0] || '?' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800 text-sm">
                      Dr/Dra. {{ doc.profiles?.first_name || 'Desconocido' }} {{ doc.profiles?.last_name || '' }}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5">{{ doc.profiles?.email || 'Sin correo' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100/50">
                  {{ doc.specialty || 'General' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100/50">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Activo
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button (click)="openModal()" class="text-slate-400 hover:text-blue-600 transition-colors mx-1" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredDoctors.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                No se encontraron doctores registrados.
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
          <h3 class="font-bold text-lg text-slate-800">Añadir Doctor</h3>
          <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form (ngSubmit)="saveDoctor()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
              <input type="text" [(ngModel)]="formData.first_name" name="first_name" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Apellido</label>
              <input type="text" [(ngModel)]="formData.last_name" name="last_name" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
            <input type="email" [(ngModel)]="formData.email" name="email" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
            <input type="password" [(ngModel)]="formData.password" name="password" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Especialidad</label>
            <select [(ngModel)]="formData.specialty" name="specialty" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="General">General</option>
              <option *ngFor="let spec of specialties" [value]="spec.name">{{spec.name}}</option>
            </select>
          </div>
          
          <div class="pt-4 flex gap-3">
            <button type="button" (click)="closeModal()" class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
            <button type="submit" [disabled]="isSaving" class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50">
              {{ isSaving ? 'Guardando...' : 'Guardar Doctor' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class DoctoresListComponent implements OnInit {
  catalogsService = inject(CatalogsService);
  usersService = inject(UsersService);
  cdr = inject(ChangeDetectorRef);

  doctors: any[] = [];
  specialties: any[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  showModal = false;
  searchTerm = '';
  
  get filteredDoctors() {
    if (!this.searchTerm) return this.doctors;
    const term = this.searchTerm.toLowerCase();
    return this.doctors.filter(d => 
      (d.profiles?.first_name?.toLowerCase().includes(term)) ||
      (d.profiles?.last_name?.toLowerCase().includes(term)) ||
      (d.specialty?.toLowerCase().includes(term))
    );
  }

  formData = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    specialty: 'General'
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Load specialties for the dropdown
    this.catalogsService.getSpecialties().subscribe({
      next: (data) => this.specialties = data,
      error: () => console.error('Error loading specialties')
    });

    this.catalogsService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.errorMessage = 'No se pudieron cargar los datos de doctores.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openModal() {
    this.formData = { first_name: '', last_name: '', email: '', password: '', specialty: 'General' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveDoctor() {
    if (!this.formData.email || !this.formData.password) return;
    this.isSaving = true;
    
    this.usersService.createDoctor(this.formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error saving doctor', err);
        this.errorMessage = err.error?.message || 'Error al guardar el doctor';
        this.isSaving = false;
        this.closeModal();
        this.cdr.detectChanges();
      }
    });
  }
}
