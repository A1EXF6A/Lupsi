import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, AppointmentSlot } from '../../core/services/appointments.service';
import {
  CatalogsService,
  Doctor,
  Specialty,
  AppointmentType,
} from '../../core/services/catalogs.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-green-50/50">
      <div class="flex items-center gap-4 mb-8">
        <div
          class="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200 text-white flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
          </svg>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 leading-tight">Agendar Nueva Cita</h2>
          <p class="text-slate-500 font-medium text-sm mt-1">
            Completa los pasos para tu próxima reserva médica.
          </p>
        </div>
      </div>

      <div
        *ngIf="isLoadingBase"
        class="flex items-center gap-3 text-green-600 font-bold mb-6 bg-green-50 p-4 rounded-2xl"
      >
        <svg
          class="animate-spin h-5 w-5"
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
        <span>Cargando catálogos de atención...</span>
      </div>

      <div
        *ngIf="successMessage"
        class="bg-green-50 text-green-700 p-4 mb-6 rounded-2xl font-medium border border-green-100 flex items-start gap-3"
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
          class="mt-0.5"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <div>
          <h4 class="font-bold">¡Reserva Exitosa!</h4>
          <p class="text-sm mt-1">{{ successMessage }}</p>
        </div>
      </div>

      <div
        *ngIf="errorMessage"
        class="bg-red-50 text-red-600 p-4 mb-6 rounded-2xl font-medium border border-red-100 flex items-start gap-3"
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
          class="mt-0.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12" y1="16" y2="16" />
        </svg>
        <div>
          <h4 class="font-bold">Aviso</h4>
          <p class="text-sm mt-1">{{ errorMessage }}</p>
        </div>
      </div>

      <div class="space-y-6" *ngIf="!isLoadingBase && !successMessage">
        <!-- Paso 1: Fecha -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1"
            >1. Fecha de Cita</label
          >
          <input
            type="date"
            [(ngModel)]="selectedDate"
            [min]="minDate"
            (ngModelChange)="onDateChange()"
            class="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium font-sans"
          />
        </div>

        <!-- Paso 2: Especialidad -->
        <div class="space-y-3" *ngIf="selectedDate">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between"
            ><span>2. Especialidad Médica</span>
            <span *ngIf="selectedSpecialty" class="text-green-600 font-bold text-xs bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100 uppercase tracking-wider">Seleccionado</span>
          </label>

          <!-- Input de búsqueda Premium -->
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="specialtySearchQuery"
              placeholder="Buscar especialidad (ej: Cardiología, Medicina General...)"
              class="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium font-sans text-sm shadow-sm"
            />
            <button
              *ngIf="specialtySearchQuery"
              (click)="specialtySearchQuery = ''"
              type="button"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cuadrícula (Grid) de Especialidades -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            <button
              *ngFor="let spec of getFilteredSpecialties()"
              type="button"
              (click)="selectSpecialty(spec)"
              [class.ring-2]="selectedSpecialty?.id === spec.id"
              [class.ring-green-500]="selectedSpecialty?.id === spec.id"
              [class.bg-green-50]="selectedSpecialty?.id === spec.id"
              [class.border-green-300]="selectedSpecialty?.id === spec.id"
              [class.bg-slate-50]="selectedSpecialty?.id !== spec.id"
              [class.border-slate-200]="selectedSpecialty?.id !== spec.id"
              class="border rounded-2xl p-4 transition-all duration-200 text-left hover:border-green-300 hover:shadow-md flex flex-row items-center gap-3 relative overflow-hidden group min-h-[4.5rem]"
            >
              <!-- Icono sutil del elemento principal -->
              <span 
                [class.text-green-600]="selectedSpecialty?.id === spec.id"
                [class.text-slate-500]="selectedSpecialty?.id !== spec.id"
                class="inline-flex items-center justify-center h-10 w-10 rounded-xl transition-all duration-200 flex-shrink-0"
                [class.bg-green-100]="selectedSpecialty?.id === spec.id"
                [class.bg-white]="selectedSpecialty?.id !== spec.id"
              >
                <ng-container [ngSwitch]="spec.name">
                  <!-- Cardiología (Pulso cardíaco ECG) -->
                  <svg *ngSwitchCase="'Cardiología'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                  
                  <!-- Cirugía General (Tijeras quirúrgicas) -->
                  <svg *ngSwitchCase="'Cirugía General'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="6" cy="6" r="3"/>
                    <circle cx="6" cy="18" r="3"/>
                    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
                    <line x1="14.8" y1="14.8" x2="20" y2="20"/>
                    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                  </svg>
                  
                  <!-- Fisioterapia (Figura humana en estiramiento/rehab) -->
                  <svg *ngSwitchCase="'Fisioterapia'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="5" r="2"/>
                    <path d="m12 7-4 3v4M12 7l4 3v4M8 14h8M10 14v6M14 14v6"/>
                  </svg>
                  
                  <!-- Geriatría (Corazón con cruz universal de cuidado) -->
                  <svg *ngSwitchCase="'Geriatría'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    <path d="M12 5v6M9 8h6"/>
                  </svg>
                  
                  <!-- Medicina del Dolor (Escudo protector contra el dolor) -->
                  <svg *ngSwitchCase="'Medicina del Dolor'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  
                  <!-- Medicina Estética (Flor de Loto - belleza y piel) -->
                  <svg *ngSwitchCase="'Medicina Estética'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3c-1.5 3-4.5 6-7.5 6 3 0 6 3 7.5 6 1.5-3 4.5-6 7.5-6-3 0-6-3-7.5-6Z"/>
                    <path d="M12 9c-1 2-3 4-5 4 2 0 4 2 5 4 1-2 3-4 5-4-2 0-4-2-5-4Z"/>
                  </svg>
                  
                  <!-- Medicina General (Estetoscopio detallado) -->
                  <svg *ngSwitchCase="'Medicina General'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4.8 2.3A.3.3 0 1 0 5 2v0a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2v0a.3.3 0 1 0 .2.3"/>
                    <path d="M9 14v3a3 3 0 0 0 6 0v-3"/>
                    <path d="M17 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                  </svg>
                  
                  <!-- Medicina Interna (Cápsula de medicina) -->
                  <svg *ngSwitchCase="'Medicina Interna'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
                    <path d="m8.5 8.5 7 7"/>
                  </svg>
                  
                  <!-- Neurocirugía (Cerebro con hemisferios) -->
                  <svg *ngSwitchCase="'Neurocirugía'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                    <path d="M12 5v14"/>
                  </svg>
                  
                  <!-- Neurología (Cerebro con hemisferios) -->
                  <svg *ngSwitchCase="'Neurología'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                    <path d="M12 5v14"/>
                  </svg>
                  
                  <!-- Neuropsicología (Cerebro con hemisferios) -->
                  <svg *ngSwitchCase="'Neuropsicología'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
                    <path d="M12 5v14"/>
                  </svg>
                  
                  <!-- Nutrición (Manzana saludable con tallo) -->
                  <svg *ngSwitchCase="'Nutrición'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22c4.97 0 9-3.03 9-8c0-3.86-3.14-7-7-7a5.2 5.2 0 0 0-2 1a5.2 5.2 0 0 0-2-1c-3.86 0-7 3.14-7 7c0 4.97 4.03 8 9 8z"/>
                    <path d="M12 7c.5-2 1.5-4 4-4"/>
                  </svg>
                  
                  <!-- Psicología Clínica (Carita feliz - bienestar mental) -->
                  <svg *ngSwitchCase="'Psicología Clínica'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                  
                  <!-- Psicopedagogía (Libro abierto de aprendizaje) -->
                  <svg *ngSwitchCase="'Psicopedagogía'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  
                  <!-- Traumatología y Ortopedia (Bandita adhesiva/curita para golpes/fracturas) -->
                  <svg *ngSwitchCase="'Traumatología y Ortopedia'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m18 6-12 12"/>
                    <path d="m15 3-12 12a3 3 0 0 0 4 4l12-12a3 3 0 0 0-4-4z"/>
                    <path d="m9 9 6 6"/>
                  </svg>
                  
                  <!-- Urología (Gota de líquido con reflejo) -->
                  <svg *ngSwitchCase="'Urología'" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7Z"/>
                    <path d="M12 18a3 3 0 0 1-3-3"/>
                  </svg>
                  
                  <!-- Default fallback -->
                  <svg *ngSwitchDefault class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8M8 12h8"/>
                  </svg>
                </ng-container>
              </span>

              <!-- Nombre de la especialidad -->
              <div class="font-bold text-slate-800 text-sm tracking-tight leading-snug group-hover:text-green-700 transition-colors">
                {{ spec.name }}
              </div>
            </button>
          </div>

          <div
            *ngIf="getFilteredSpecialties().length === 0"
            class="py-8 text-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-2xl"
          >
            No encontramos la especialidad "{{ specialtySearchQuery }}".
          </div>
        </div>
        <!-- Paso 3: Tipo de Consulta -->
        <div class="space-y-2" *ngIf="selectedSpecialty">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1"
            >3. Tipo de Consulta</label
          >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              *ngFor="let type of filteredAppointmentTypes"
              type="button"
              (click)="selectAppointmentType(type)"
              [class.bg-green-600]="selectedAppointmentType?.id === type.id"
              [class.text-white]="selectedAppointmentType?.id === type.id"
              [class.border-transparent]="selectedAppointmentType?.id === type.id"
              [class.hover:bg-green-700]="selectedAppointmentType?.id === type.id"
              [class.hover:text-white]="selectedAppointmentType?.id === type.id"
              [class.bg-slate-50]="selectedAppointmentType?.id !== type.id"
              [class.text-slate-600]="selectedAppointmentType?.id !== type.id"
              [class.border-slate-200]="selectedAppointmentType?.id !== type.id"
              [class.hover:bg-green-50]="selectedAppointmentType?.id !== type.id"
              [class.hover:text-green-700]="selectedAppointmentType?.id !== type.id"
              [class.hover:border-green-300]="selectedAppointmentType?.id !== type.id"
              class="text-left border rounded-2xl p-4 transition-all focus:outline-none"
            >
              <div class="font-bold text-sm">{{ type.name }}</div>
              <div
                class="text-xs mt-1"
                [class.text-green-100]="selectedAppointmentType?.id === type.id"
                [class.text-slate-400]="selectedAppointmentType?.id !== type.id"
              >
                Duración: {{ type.duration_minutes }} min | Costo: \${{ getAppointmentPrice(type.name) }}.00
              </div>
            </button>
          </div>
        </div>

        <!-- Paso 4: Profesional de la Salud -->
        <div class="space-y-2" *ngIf="selectedAppointmentType">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1"
            >4. Profesional de la Salud</label
          >
          <select
            [(ngModel)]="selectedDoctor"
            (ngModelChange)="onDoctorChange()"
            class="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
          >
            <option [ngValue]="null">-- Selecciona Profesional --</option>
            <option *ngFor="let doc of filteredDoctors" [ngValue]="doc">
              Dr/Dra. {{ doc.profiles.first_name || '?' }} {{ doc.profiles.last_name || '?' }}
            </option>
          </select>
          <div
            *ngIf="filteredDoctors.length === 0"
            class="px-2 text-sm text-amber-600 font-medium mt-2 flex items-center gap-1.5"
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
              class="mt-0.5"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
            No hay doctores con esta especialidad.
          </div>
        </div>
        <!-- Paso 5: Horarios -->
        <div class="space-y-3" *ngIf="selectedDoctor">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1"
            >5. Horarios Disponibles</label
          >

          <div
            *ngIf="isLoadingSlots"
            class="text-sm font-medium text-slate-500 flex items-center gap-2 px-2"
          >
            <svg
              class="animate-spin h-4 w-4"
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
            Buscando horarios...
          </div>

          <div
            *ngIf="!isLoadingSlots && slots.length > 0"
            class="grid grid-cols-3 sm:grid-cols-4 gap-3"
          >
            <button
              *ngFor="let slot of slots"
              (click)="selectSlot(slot)"
              [class.bg-green-600]="selectedSlot === slot"
              [class.text-white]="selectedSlot === slot"
              [class.border-transparent]="selectedSlot === slot"
              [class.hover:bg-green-700]="selectedSlot === slot"
              [class.hover:text-white]="selectedSlot === slot"
              [class.bg-white]="selectedSlot !== slot"
              [class.text-slate-600]="selectedSlot !== slot"
              [class.border-slate-200]="selectedSlot !== slot"
              [class.hover:bg-green-50]="selectedSlot !== slot"
              [class.hover:text-green-700]="selectedSlot !== slot"
              [class.hover:border-green-300]="selectedSlot !== slot"
              class="border rounded-2xl p-3 text-sm font-bold transition-all focus:outline-none"
            >
              {{ slot.start | date: 'shortTime' }}
            </button>
          </div>

          <div
            *ngIf="!isLoadingSlots && slots.length === 0"
            class="text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200"
          >
            No hay horarios disponibles para el profesional seleccionado en esta fecha. Intenta con
            otra fecha u otro horario.
          </div>
        </div>

        <!-- Resumen de Costo y Cita -->
        <div class="mb-4 bg-emerald-50/50 border border-emerald-100/50 p-4 rounded-2xl flex justify-between items-center" *ngIf="selectedSlot && selectedAppointmentType">
          <div>
            <h4 class="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">Monto a Liquidar</h4>
            <p class="text-slate-500 text-xs font-semibold">{{ selectedSpecialty?.name }} - {{ selectedAppointmentType.name }}</p>
          </div>
          <div class="text-right">
            <span class="text-2xl font-black text-emerald-700">\${{ getAppointmentPrice(selectedAppointmentType.name) }}.00</span>
            <span class="text-[10px] font-bold text-slate-400 block uppercase">USD</span>
          </div>
        </div>

        <!-- Confirmar -->
        <div class="pt-6 border-t border-slate-100" *ngIf="selectedSlot">
          <button
            (click)="confirmBooking()"
            [disabled]="isSubmitting"
            class="w-full bg-gray-900 hover:bg-black disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span *ngIf="!isSubmitting">Confirmar Reserva de Cita</span>
            <span *ngIf="isSubmitting" class="flex items-center gap-2">
              <svg
                class="animate-spin h-5 w-5"
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
              Procesando...
            </span>
          </button>
        </div>
      </div>

      <div *ngIf="successMessage" class="mt-4">
        <button
          (click)="resetForm()"
          class="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-2xl transition-all"
        >
          Agendar Otra Cita
        </button>
      </div>
    </div>
  `,
})
export class ReservaComponent implements OnInit {
  specialtySearchQuery = '';

  getFilteredSpecialties(): Specialty[] {
    if (!this.specialtySearchQuery.trim()) {
      return this.specialties;
    }
    const q = this.specialtySearchQuery.toLowerCase();
    return this.specialties.filter((s) => s.name.toLowerCase().includes(q));
  }

  selectSpecialty(spec: Specialty) {
    if (this.selectedSpecialty?.id === spec.id) {
      this.selectedSpecialty = null;
      this.onSpecialtyChange();
    } else {
      this.selectedSpecialty = spec;
      this.onSpecialtyChange();
    }
  }

  getSpecialtyIconSvg(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('cardio')) {
      // Cardiología
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28"/>';
    }
    if (n.includes('cirug') || n.includes('cirugia')) {
      // Cirugía General
      return '<path d="M14.5 2v20M9.5 2v20M12 5h8M4 19h8"/><path d="M3 22h18"/>';
    }
    if (n.includes('fisio')) {
      // Fisioterapia
      return '<path d="m18 8-4-4-4 4M14 4v12M10 20h8"/><circle cx="14" cy="20" r="1"/>';
    }
    if (n.includes('geria')) {
      // Geriatría
      return '<path d="M12 22v-5M9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0M19 22H5"/>';
    }
    if (n.includes('dolor')) {
      // Medicina del Dolor
      return '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="M12 8v8M8 12h8"/>';
    }
    if (n.includes('estét') || n.includes('estet')) {
      // Medicina Estética
      return '<path d="m12 3-1.912 5.886L4.2 10.8l5.888 1.912L12 18.6l1.912-5.888L19.8 10.8l-5.888-1.912Z"/><path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>';
    }
    if (n.includes('general')) {
      // Medicina General
      return '<path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5h20c0-2.31-1-4.24-2.5-5.5"/><path d="M12 2v10m-4-6h8"/><circle cx="12" cy="14" r="2"/>';
    }
    if (n.includes('interna')) {
      // Medicina Interna
      return '<path d="M12 3v18M12 10H5M12 14H19M5 6h14M5 18h14"/>';
    }
    if (n.includes('neuroc')) {
      // Neurocirugía
      return '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.9-.7M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.9-.7"/><path d="M12 12h7M5 12h7"/>';
    }
    if (n.includes('neuro')) {
      // Neurología / Neuropsicología
      return '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.9-.7M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.9-.7"/><path d="M12 7h5M7 7h5M12 17h5M7 17h5"/>';
    }
    if (n.includes('nutri')) {
      // Nutrición
      return '<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"/><path d="M12 2v4M12 6a4 4 0 0 0-4 4"/>';
    }
    if (n.includes('psicope')) {
      // Psicopedagogía
      return '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10M6 10h10"/>';
    }
    if (n.includes('psicol')) {
      // Psicología Clínica
      return '<path d="M12 2v20M5 5a7 7 0 0 0 14 0M5 10c0 4 3.5 7 7 7s7-3 7-7"/>';
    }
    if (n.includes('trauma') || n.includes('ortop')) {
      // Traumatología
      return '<path d="M17 3a2.82 2.82 0 1 1 4 4L7.5 21H3v-4.5L17 3Z"/><path d="m15 5 4 4M9 11l3 3"/>';
    }
    if (n.includes('urol')) {
      // Urología
      return '<path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7Z"/>';
    }
    // Default fallback (Cruz médica limpia)
    return '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>';
  }

  appointmentsService = inject(AppointmentsService);
  catalogsService = inject(CatalogsService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  doctors: Doctor[] = [];
  specialties: Specialty[] = [];
  appointmentTypes: AppointmentType[] = [];
  filteredAppointmentTypes: AppointmentType[] = [];
  filteredDoctors: Doctor[] = [];
  slots: AppointmentSlot[] = [];

  isLoadingBase = false;
  isLoadingSlots = false;
  isSubmitting = false;

  getLocalYYYYMMDD(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAppointmentPrice(typeName: string): number {
    const name = typeName.toLowerCase();
    if (name.includes('procedimiento') || name.includes('cirugía menor') || name.includes('cirugia menor') || name.includes('cirugía') || name.includes('cirugia')) {
      return 30.00;
    }
    return 15.00;
  }

  selectedDate: string = this.getLocalYYYYMMDD();
  minDate: string = this.getLocalYYYYMMDD();
  selectedAppointmentType: AppointmentType | null = null;
  selectedSpecialty: Specialty | null = null;
  selectedDoctor: Doctor | null = null;
  selectedSlot: AppointmentSlot | null = null;

  successMessage = '';
  errorMessage = '';

  ngOnInit() {
    this.loadBaseCatalogs();
  }

  loadBaseCatalogs() {
    this.isLoadingBase = true;

    // Using simple parallel fetching for the initial config
    let loaded = 0;
    const checkDone = () => {
      loaded++;
      if (loaded === 3) {
        this.isLoadingBase = false;
        this.cdr.detectChanges();
      }
    };

    this.catalogsService.getDoctors().subscribe({
      next: (docs) => {
        this.doctors = docs;
        checkDone();
      },
      error: () => checkDone(),
    });

    this.catalogsService.getSpecialties().subscribe({
      next: (specs) => {
        this.specialties = specs;
        checkDone();
      },
      error: () => checkDone(),
    });

    this.catalogsService.getAppointmentTypes().subscribe({
      next: (types) => {
        this.appointmentTypes = types;
        this.filterAppointmentTypes();
        checkDone();
      },
      error: () => checkDone(),
    });
  }

  filterAppointmentTypes() {
    if (!this.selectedSpecialty) {
      this.filteredAppointmentTypes = [];
      return;
    }

    const specName = this.selectedSpecialty.name;

    this.filteredAppointmentTypes = this.appointmentTypes.filter((type) => {
      const name = type.name.toLowerCase();

      // Regla 1: "Sesión de Terapia" -> Fisioterapia, Psicología Clínica, Psicopedagogía
      if (name.includes('terapia')) {
        return (
          specName === 'Fisioterapia' ||
          specName === 'Psicología Clínica' ||
          specName === 'Psicopedagogía'
        );
      }

      // Regla 2: "Procedimiento Estético" -> Medicina Estética
      if (name.includes('estético') || name.includes('estetico')) {
        return specName === 'Medicina Estética';
      }

      // Regla 3: "Procedimiento Clínico / Cirugía Menor" -> Medicina General, Urología, Cardiología, Cirugía General, Traumatología y Ortopedia, Medicina Estética
      if (name.includes('clínico') || name.includes('clinico') || name.includes('cirugía menor') || name.includes('cirugia menor')) {
        return (
          specName === 'Medicina General' ||
          specName === 'Urología' ||
          specName === 'Cardiología' ||
          specName === 'Cirugía General' ||
          specName === 'Traumatología y Ortopedia' ||
          specName === 'Medicina Estética'
        );
      }

      // Regla 4: Consultas de rutina (Consulta Inicial y Consulta de Control) son universales
      return true;
    });
  }

  onDateChange() {
    this.resetFrom(1);
  }

  selectAppointmentType(type: AppointmentType) {
    this.selectedAppointmentType = type;
    this.resetFrom(3);
    if (this.selectedSpecialty) {
      // Filter the doctors where their specialty text matches the selected one exactly
      this.filteredDoctors = this.doctors.filter(
        (d) => d.specialty === this.selectedSpecialty?.name,
      );
    } else {
      this.filteredDoctors = [];
    }
  }

  onSpecialtyChange() {
    this.resetFrom(2);
    this.filterAppointmentTypes();
  }

  onDoctorChange() {
    this.resetFrom(4);
    if (this.selectedDoctor && this.selectedDate) {
      this.loadSlots();
    }
  }

  loadSlots() {
    if (!this.selectedDoctor) return;

    this.isLoadingSlots = true;
    this.slots = [];
    this.selectedSlot = null;
    this.successMessage = '';
    this.errorMessage = '';

    this.appointmentsService
      .getAvailableSlots(this.selectedDoctor.id, this.selectedDate)
      .subscribe({
        next: (res) => {
          this.slots = res;
          this.isLoadingSlots = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Error al cargar horarios disponibles.';
          this.isLoadingSlots = false;
          this.cdr.detectChanges();
        },
      });
  }

  selectSlot(slot: AppointmentSlot) {
    this.selectedSlot = slot;
  }

  confirmBooking() {
    const token = this.authService.currentUserToken();
    if (!token) {
      this.errorMessage = 'Debes iniciar sesión para reservar una cita.';
      return;
    }

    if (!this.selectedDoctor || !this.selectedSlot) return;

    this.isSubmitting = true;
    const price = this.selectedAppointmentType ? this.getAppointmentPrice(this.selectedAppointmentType.name) : 15.00;
    const payload = {
      doctor_id: this.selectedDoctor.id,
      appointment_time: this.selectedSlot.start,
      appointment_type: this.selectedAppointmentType?.name || undefined,
      specialty: this.selectedSpecialty?.name || undefined,
      price: price
    };

    this.appointmentsService.createAppointment(payload).subscribe({
      next: () => {
        this.successMessage = 'Tu consulta médica ha sido confirmada con éxito.';
        this.errorMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err.error?.message ||
          'Error al confirmar la reserva. El horario podría no estar disponible.';
        this.successMessage = '';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
    });
  }

  resetFrom(level: number) {
    if (level <= 1) {
      this.selectedSpecialty = null;
      this.filteredAppointmentTypes = [];
    }
    if (level <= 2) {
      this.selectedAppointmentType = null;
      this.filteredDoctors = [];
    }
    if (level <= 3) {
      this.selectedDoctor = null;
    }
    if (level <= 4) {
      this.selectedSlot = null;
      this.slots = [];
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  resetForm() {
    this.selectedSpecialty = null;
    this.selectedAppointmentType = null;
    this.selectedDoctor = null;
    this.selectedSlot = null;
    this.filteredDoctors = [];
    this.filteredAppointmentTypes = [];
    this.slots = [];
    this.successMessage = '';
    this.errorMessage = '';
    this.selectedDate = this.getLocalYYYYMMDD();
  }
}