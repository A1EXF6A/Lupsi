import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../core/services/auth';
import { UsersService } from '../core/services/users.service';

@Component({
  selector: 'app-panel-doctor',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-100 flex font-sans overflow-hidden">
      <aside
        [class.translate-x-0]="isSidebarOpen"
        [class.-translate-x-full]="!isSidebarOpen"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-xl transition-transform duration-300 ease-in-out"
      >
        <div class="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 class="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <img src="/lupsi_logo-Photoroom.png" alt="LUPSI" class="h-8 w-auto object-contain">
            <span class="text-slate-200">Doctor</span>
          </h2>
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
            routerLink="agenda"
            routerLinkActive="bg-blue-600 text-white"
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
            </svg>
            Agenda Diaria
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="atender"
            routerLinkActive="bg-blue-600 text-white"
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
              <path d="M12 8v8" />
              <path d="M8 12h8" />
              <circle cx="12" cy="12" r="10" />
            </svg>
            Atender
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="fichas"
            routerLinkActive="bg-blue-600 text-white"
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
            Ver Fichas
          </a>
          <a
            (click)="onLinkClick()"
            routerLink="recetas"
            routerLinkActive="bg-blue-600 text-white"
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
            Recetas
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800 space-y-2">
          <a
            (click)="onLinkClick()"
            routerLink="perfil"
            routerLinkActive="bg-slate-800 text-white"
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium"
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Mi Perfil
          </a>
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
            Cerrar Sesion
          </button>
        </div>
      </aside>

      <div
        *ngIf="isSidebarOpen"
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
      ></div>

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
            <h1 class="text-xl font-bold text-slate-800 hidden sm:block">Panel Medico</h1>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right hidden sm:block">
              <div class="text-sm font-bold text-slate-800">{{ doctorName }}</div>
              <div class="text-xs font-medium text-slate-400">Atención Médica</div>
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
export class PanelDoctorComponent implements OnInit {
  authService = inject(AuthService);
  usersService = inject(UsersService);
  router = inject(Router);

  isSidebarOpen = true;
  doctorName = 'Cargando...';

  ngOnInit() {
    this.usersService.getMe().subscribe({
      next: (user) => {
        if (user) {
          this.doctorName = `Dr/Dra. ${user.first_name} ${user.last_name}`;
        } else {
          this.doctorName = 'Médico Especialista';
        }
      },
      error: () => {
        this.doctorName = 'Médico Especialista';
      }
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onLinkClick() {
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
