import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-portal-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col pt-10 px-4">
      <div class="max-w-4xl w-full mx-auto">
        <h1 class="text-3xl font-bold text-gray-800 mb-6">Portal del Paciente LUPSI</h1>
        <div class="bg-white p-4 shadow rounded mb-4 flex gap-4">
          <a routerLink="reserva" class="text-blue-600 hover:underline">Agendar Cita</a>
        </div>
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class PortalPacienteComponent {}
