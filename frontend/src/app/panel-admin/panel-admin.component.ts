import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex">
      <!-- Sidebar Basico -->
      <div class="w-64 bg-gray-900 text-white min-h-screen">
        <div class="p-6">
          <h2 class="text-2xl font-bold">LUPSI Admin</h2>
        </div>
        <nav class="mt-6 flex flex-col space-y-2 px-4">
          <a routerLink="agenda" class="p-2 bg-gray-800 rounded hover:bg-gray-700">Agenda Diaria</a>
        </nav>
      </div>
      
      <!-- Content -->
      <div class="flex-1 bg-gray-100 p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class PanelAdminComponent {}
