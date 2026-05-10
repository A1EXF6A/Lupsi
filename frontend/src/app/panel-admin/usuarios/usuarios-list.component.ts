import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../core/services/users.service';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Usuarios del Sistema</h2>
        <button
          (click)="openModal()"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Añadir Recepcionista
        </button>
      </div>

      <!-- Búsqueda -->
      <div class="mb-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Buscar por nombre o correo..."
          class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div
          *ngIf="isLoading"
          class="p-10 flex flex-col items-center justify-center text-slate-400"
        >
          <svg
            class="animate-spin h-8 w-8 text-indigo-500 mb-4"
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
          Cargando usuarios...
        </div>

        <div
          *ngIf="errorMessage"
          class="p-6 bg-red-50 text-red-600 border-b border-red-100 text-sm font-bold flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {{ errorMessage }}
        </div>

        <table *ngIf="!isLoading && !errorMessage" class="w-full text-left text-sm text-slate-600">
          <thead
            class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs tracking-wider"
          >
            <tr>
              <th scope="col" class="px-6 py-4">Usuario</th>
              <th scope="col" class="px-6 py-4">Correo</th>
              <th scope="col" class="px-6 py-4 text-center">Rol</th>
              <th scope="col" class="px-6 py-4 text-right">Fecha de Registro</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              *ngFor="let user of filteredUsers | slice: 0 : visibleCount; let i = index"
              class="hover:bg-slate-50 transition-colors animate-fade-in-up"
              [style.animation-delay.ms]="i * 50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center"
                  >
                    {{ user.first_name.charAt(0) || 'U' }}{{ user.last_name.charAt(0) || '' }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-800">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">{{ user.email }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-amber-100 text-amber-700': user.role === 'ADMIN',
                    'bg-blue-100 text-blue-700': user.role === 'DOCTOR',
                    'bg-slate-100 text-slate-700': user.role === 'PATIENT',
                    'bg-purple-100 text-purple-700': user.role === 'RECEPTIONIST',
                  }"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                {{ user.created_at | date: 'mediumDate' }}
              </td>
            </tr>
            <tr *ngIf="filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-slate-500">
                No se encontraron usuarios en el sistema.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación local -->
        <div
          *ngIf="filteredUsers.length > visibleCount"
          class="p-6 border-t border-slate-100 flex justify-center"
        >
          <button
            (click)="loadMore()"
            class="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors border border-slate-200 shadow-sm flex items-center gap-2"
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
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            Mostrar más usuarios
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Formulario -->
    <div
      *ngIf="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
        >
          <h3 class="font-bold text-lg text-slate-800">Añadir Recepcionista</h3>
          <button
            (click)="closeModal()"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form (ngSubmit)="saveReceptionist()" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Nombre</label>
              <input
                type="text"
                [(ngModel)]="formData.first_name"
                name="first_name"
                required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Apellido</label>
              <input
                type="text"
                [(ngModel)]="formData.last_name"
                name="last_name"
                required
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
            <input
              type="email"
              [(ngModel)]="formData.email"
              name="email"
              required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">Contraseña</label>
            <input
              type="password"
              [(ngModel)]="formData.password"
              name="password"
              required
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              (click)="closeModal()"
              class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Guardando...' : 'Guardar Recepcionista' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UsuariosListComponent implements OnInit {
  usersService = inject(UsersService);
  cdr = inject(ChangeDetectorRef);

  users: User[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  searchTerm = '';
  visibleCount = 10;
  showModal = false;

  get filteredUsers() {
    if (!this.searchTerm) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(
      (u) =>
        (u.first_name && u.first_name.toLowerCase().includes(term)) ||
        (u.last_name && u.last_name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term)),
    );
  }

  ngOnInit() {
    this.loadData();
  }

  openModal() {
    this.formData = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  loadMore() {
    this.visibleCount += 10;
  }

  loadData() {
    this.isLoading = true;
    this.errorMessage = '';
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users = data;
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

  formData = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  };

  saveReceptionist() {
    if (!this.formData.email || !this.formData.password) return;
    this.isSaving = true;

    this.usersService.createReceptionist(this.formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadData();
      },
      error: (err) => {
        console.error('Error saving receptionist', err);
        this.errorMessage = err.error?.message || 'Error al guardar el recepcionista';
        this.isSaving = false;
        this.closeModal();
        this.cdr.detectChanges();
      },
    });
  }
}
