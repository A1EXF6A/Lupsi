import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-perfil-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          Mi Perfil
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Change Password Section -->
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Cambiar Contraseña
          </h3>
          
          <div *ngIf="successMsg" class="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium">
            {{ successMsg }}
          </div>
          <div *ngIf="errorMsg" class="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-sm font-medium">
            {{ errorMsg }}
          </div>

          <form (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Contraseña Actual</label>
              <input type="password" [(ngModel)]="passwords.current_password" name="current_password" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">Nueva Contraseña</label>
              <input type="password" [(ngModel)]="passwords.new_password" name="new_password" required class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all">
            </div>
            <button type="submit" [disabled]="isSubmitting" class="w-full py-3 mt-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
              {{ isSubmitting ? 'Cambiando...' : 'Actualizar Contraseña' }}
            </button>
          </form>
        </div>
        
        <!-- Info Info placeholder -->
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center text-center">
           <div class="w-24 h-24 bg-gradient-to-tr from-green-400 to-blue-500 rounded-full shadow-lg mb-4"></div>
           <h3 class="text-xl font-bold text-slate-800">Paciente Lupsi</h3>
           <p class="text-sm text-slate-500 mt-1">Tu salud en las mejores manos.</p>
        </div>
      </div>
    </div>
  `
})
export class PerfilPacienteComponent {
  authService = inject(AuthService);

  passwords = {
    current_password: '',
    new_password: ''
  };

  isSubmitting = false;
  successMsg = '';
  errorMsg = '';

  changePassword() {
    this.errorMsg = '';
    this.successMsg = '';
    const token = this.authService.currentUserToken();

    if (!token) {
      this.errorMsg = 'No hay sesión activa.';
      return;
    }

    if (!this.passwords.current_password || !this.passwords.new_password) {
      this.errorMsg = 'Por favor complete ambos campos.';
      return;
    }

    this.isSubmitting = true;
    this.authService.changePassword({
      current_password: this.passwords.current_password,
      new_password: this.passwords.new_password,
      access_token: token
    }).subscribe({
      next: () => {
        this.successMsg = 'Contraseña actualizada correctamente.';
        this.passwords = { current_password: '', new_password: '' };
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Error al cambiar contraseña. Verifica tu contraseña actual.';
        this.isSubmitting = false;
      }
    });
  }
}
