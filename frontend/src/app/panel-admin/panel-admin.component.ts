import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 flex font-sans overflow-hidden">
      <!-- Sidebar -->
      <aside
        [class.translate-x-0]="isSidebarOpen"
        [class.-translate-x-full]="!isSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl transition-transform duration-300 ease-in-out"
      >
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            Admin
          </h2>
          <!-- Close button -->
          <button (click)="toggleSidebar()" class="text-slate-400 hover:text-white">
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
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a
            (click)="onLinkClick()"
            routerLink="metricas"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            Métricas
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="doctores"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Doctores
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="especialidades"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Especialidades
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="tipos-cita"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Tipos de Cita
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="oficinas"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="8" y1="14" x2="16" y2="14" />
            </svg>
            Oficinas
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="citas"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <path d="M8 14h.01" />
              <path d="M12 14h.01" />
              <path d="M16 14h.01" />
              <path d="M8 18h.01" />
              <path d="M12 18h.01" />
              <path d="M16 18h.01" />
            </svg>
            Gestión de Citas
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="historiales"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Fichas Clínicas
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="medicamentos"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M10.5 20.5l6-6M17 14l-6-6M8.5 8.5l6 6M14 17l-6-6" />
              <path d="M4.5 14.5l6-6a2.12 2.12 0 013 3l-6 6a2.12 2.12 0 01-3-3z" />
              <path d="M14.5 4.5l6 6a2.12 2.12 0 01-3 3l-6-6a2.12 2.12 0 013-3z" />
            </svg>
            Medicamentos
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="usuarios"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium"
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Usuarios
          </a>

          <div class="h-6"></div>
          <!-- separator -->

          <a
            (click)="onLinkClick()"
            routerLink="agenda"
            routerLinkActive="bg-green-600 text-white"
            class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium text-slate-400"
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
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            Agenda Diaria
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
          <button
            (click)="logout()"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium"
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
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile when sidebar is open -->
      <div
        *ngIf="isSidebarOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
      ></div>

      <!-- Content -->
      <main
        [class.md:pl-64]="isSidebarOpen"
        class="flex-1 flex flex-col min-w-0 bg-slate-50 relative h-screen transition-all duration-300 ease-in-out"
      >
        <header
          class="bg-white border-b border-slate-200 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0"
        >
          <div class="flex items-center gap-4">
            <button
              (click)="toggleSidebar()"
              class="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none transition-colors"
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
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 class="text-xl font-bold text-slate-800 hidden sm:block">Panel de Control</h1>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <div class="text-sm font-bold text-slate-800">Administrador</div>
              <div class="text-xs font-medium text-slate-400">Acceso Total</div>
            </div>
            <div
              class="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-slate-500"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>
        </header>

        <div class="p-4 md:p-8 flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
})
export class PanelAdminComponent {
  authService = inject(AuthService);
  router = inject(Router);

  isSidebarOpen = true; // Open by default on desktop

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLinkClick() {
    // Only auto-close sidebar if on mobile view
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
