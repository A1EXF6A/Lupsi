import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      <!-- Top Navigation -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div class="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-md shadow-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="15" y1="12" y2="12"/><line x1="3" x2="15" y1="12" y2="12"/></svg>
             </div>
             <h1 class="text-xl font-black text-gray-900 tracking-tight">Portal <span class="text-green-600">Paciente</span></h1>
          </div>
          
          <nav class="flex gap-2 items-center">
            <a routerLink="mis-citas" routerLinkActive="bg-green-50 text-green-700 font-bold border-green-200" class="px-4 py-2 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
              Mis Citas
            </a>
            <a routerLink="reserva" routerLinkActive="bg-green-50 text-green-700 font-bold border-green-200" class="px-4 py-2 text-sm font-medium text-slate-500 rounded-xl hover:bg-slate-100 transition-colors border border-transparent">
              Agendar Cita
            </a>
            <div class="h-6 w-px bg-slate-200 mx-1"></div>
            <button (click)="logout()" class="text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              Salir
            </button>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 py-8">
        <router-outlet></router-outlet>
      </main>
      
    </div>
  `,
})
export class PortalPacienteComponent {
  authService = inject(AuthService);
  router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

