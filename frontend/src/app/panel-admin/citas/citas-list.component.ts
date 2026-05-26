import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Gestión de Citas</h2>
        <div class="flex gap-4">
          <input
            type="date"
            [(ngModel)]="filterDate"
            (ngModelChange)="loadAppointments()"
            class="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
          />
          <button
            (click)="loadAppointments()"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm"
          >
            Actualizar
          </button>
        </div>
      </div>

      <!-- Búsqueda -->
      <div class="mb-4">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          placeholder="Buscar por nombre de paciente, doctor o DNI..."
          class="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
        />
      </div>

      <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div
          *ngIf="isLoading"
          class="p-10 flex flex-col items-center justify-center text-slate-400"
        >
          <svg
            class="animate-spin h-8 w-8 text-green-500 mb-4"
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
          Cargando citas...
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
              <th scope="col" class="px-6 py-4">Fecha y Hora</th>
              <th scope="col" class="px-6 py-4">Paciente</th>
              <th scope="col" class="px-6 py-4">Doctor</th>
              <th scope="col" class="px-6 py-4 text-center">Estado</th>
              <th scope="col" class="px-6 py-4 text-center">Pago</th>
              <th scope="col" class="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              *ngFor="let app of filteredAppointments | slice: 0 : visibleCount; let i = index"
              class="hover:bg-slate-50 transition-colors animate-fade-in-up"
              [style.animation-delay.ms]="i * 50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  {{ app.appointment_time | date: 'mediumDate' }}
                </div>
                <div class="text-xs text-slate-500">
                  {{ app.appointment_time | date: 'shortTime' }} -
                  {{ app.appointment_end_time | date: 'shortTime' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  {{ app.patients?.first_name }} {{ app.patients?.last_name }}
                </div>
                <div class="text-xs text-slate-500">DNI: {{ app.patients?.dni }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-bold text-slate-800">
                  Dr/a. {{ app.doctors?.profiles?.first_name }}
                  {{ app.doctors?.profiles?.last_name }}
                </div>
                <div class="text-xs text-slate-500">{{ app.doctors?.specialty }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-amber-50 text-amber-700 border border-amber-100':
                      app.status === 'SCHEDULED',
                    'bg-green-50 text-green-700 border border-green-100':
                      app.status === 'COMPLETED',
                    'bg-red-50 text-red-700 border border-red-100': app.status === 'CANCELLED',
                  }"
                >
                  {{
                    app.status === 'SCHEDULED'
                      ? 'Programada'
                      : app.status === 'COMPLETED'
                        ? 'Completada'
                      : 'Cancelada'
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center select-none">
                <!-- Transferencia Pendiente para Recepcionista -->
                <span
                  *ngIf="!app.paid && app.hasPendingTransfer"
                  (click)="openTransferModal(app)"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:text-blue-800 transition-all cursor-pointer shadow-sm animate-pulse"
                  title="Ver comprobante de transferencia y aprobar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Comprobante 📥
                </span>

                <span
                  *ngIf="app.paid || !app.hasPendingTransfer"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
                  [ngClass]="
                    app.paid
                      ? 'bg-green-50 text-green-700 border border-green-100'
                      : 'bg-red-50 text-red-700 border border-red-100'
                  "
                >
                  {{ app.paid ? 'Pagado' : 'Pendiente' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  *ngIf="app.status === 'COMPLETED'"
                  (click)="openPrescriptionModal(app)"
                  [class.hidden]="isReceptionist"
                  class="text-slate-400 hover:text-green-600 transition-colors mx-1"
                  title="Ver Receta"
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
                </button>
                <button
                  (click)="openStatusModal(app)"
                  class="text-slate-400 hover:text-blue-600 transition-colors mx-1"
                  title="Cambiar Estado"
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button
                  (click)="triggerDelete(app.id!)"
                  class="text-slate-400 hover:text-red-500 transition-colors mx-1"
                  title="Eliminar"
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr *ngIf="filteredAppointments.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-500 font-medium">
                No hay citas médicas registradas.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Paginación local -->
        <div
          *ngIf="filteredAppointments.length > visibleCount"
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
            Mostrar más resultados
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Cambio de Estado -->
    <div
      *ngIf="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
        >
          <h3 class="font-bold text-lg text-slate-800">Actualizar Estado</h3>
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

        <div class="p-6 space-y-4">
          <p class="text-sm text-slate-500">Seleccione el nuevo estado para esta cita médica:</p>
          <select
            [(ngModel)]="newStatus"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="SCHEDULED">Programada</option>
            <option *ngIf="!isReceptionist" value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          <div class="pt-4 flex gap-3">
            <button
              (click)="closeModal()"
              class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              (click)="updateStatus()"
              [disabled]="isSaving"
              class="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {{ isSaving ? 'Guardando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Receta -->
    <div
      *ngIf="showPrescriptionModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"
        >
          <h3 class="font-bold text-lg text-slate-800">Receta Médica</h3>
          <button
            (click)="closePrescriptionModal()"
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

        <div class="p-6 overflow-y-auto">
          <div
            *ngIf="isLoadingPrescription"
            class="py-8 flex flex-col items-center justify-center text-slate-400"
          >
            <svg
              class="animate-spin h-8 w-8 text-green-500 mb-4"
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
            Buscando receta...
          </div>

          <div
            *ngIf="!isLoadingPrescription && prescriptions.length === 0"
            class="py-8 text-center text-slate-500 font-medium"
          >
            No se ha emitido ninguna receta para esta cita.
          </div>

          <div *ngIf="!isLoadingPrescription && prescriptions.length > 0" class="space-y-4">
            <div
              *ngFor="let pres of prescriptions"
              class="p-4 border border-slate-200 rounded-xl bg-slate-50"
            >
              <p class="text-sm text-slate-600 mb-3">
                <span class="font-bold">Notas:</span>
                {{ pres.notes || 'Sin notas.' }}
              </p>
              <div *ngIf="pres.medications?.length" class="space-y-2">
                <div
                  *ngFor="let med of pres.medications"
                  class="p-3 bg-white rounded-xl border border-slate-200"
                >
                  <div class="font-bold text-slate-800">{{ med.name }}</div>
                  <div class="text-xs text-slate-500">
                    {{ med.dosage }} - {{ med.frequency }} - {{ med.duration }}
                  </div>
                </div>
              </div>
              <div *ngIf="!pres.medications?.length" class="text-xs text-slate-500">
                Sin medicamentos registrados.
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button
              (click)="closePrescriptionModal()"
              class="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Verificación de Transferencia -->
    <div
      *ngIf="showTransferModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up border border-slate-100"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0"
        >
          <h3 class="font-black text-lg text-slate-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Verificación de Transferencia
          </h3>
          <button
            (click)="closeTransferModal()"
            class="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
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

        <div class="p-6 overflow-y-auto space-y-4">
          <!-- Detalles Cita -->
          <div class="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100/30 text-xs text-slate-700 space-y-2">
            <div class="flex justify-between">
              <span class="font-bold text-slate-400">Paciente:</span>
              <span class="font-black text-slate-800">
                {{ selectedAppForTransfer?.patients?.first_name }} {{ selectedAppForTransfer?.patients?.last_name }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold text-slate-400">DNI:</span>
              <span class="font-mono font-bold text-slate-800">{{ selectedAppForTransfer?.patients?.dni }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold text-slate-400">Médico:</span>
              <span class="font-bold text-slate-800">
                Dr/a. {{ selectedAppForTransfer?.doctors?.profiles?.first_name }} {{ selectedAppForTransfer?.doctors?.profiles?.last_name }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold text-slate-400">Fecha y Hora:</span>
              <span class="font-bold text-slate-800">
                {{ selectedAppForTransfer?.appointment_time | date: 'mediumDate' }} | {{ selectedAppForTransfer?.appointment_time | date: 'shortTime' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold text-slate-400">Monto del Pago:</span>
              <span class="font-black text-emerald-600 text-sm">$50.00 USD</span>
            </div>
          </div>

          <!-- Imagen del Comprobante -->
          <div class="space-y-2">
            <label class="block text-xs font-black text-slate-500 uppercase tracking-wider">Comprobante Recibido</label>
            <div class="relative bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-2 flex flex-col items-center justify-center min-h-[220px] overflow-hidden group">
              <img 
                *ngIf="pendingTransfer?.receipt_url" 
                [src]="pendingTransfer.receipt_url" 
                alt="Comprobante de Pago" 
                class="max-w-full max-h-[300px] object-contain rounded-xl shadow-sm transition-all group-hover:scale-[1.02]"
              />
              <div *ngIf="!pendingTransfer?.receipt_url" class="text-slate-400 text-xs font-semibold italic text-center p-6">
                ⚠️ No se pudo obtener la imagen del comprobante bancario.
              </div>
            </div>
          </div>

          <div *ngIf="pendingTransfer?.receipt_url" class="text-center">
            <a 
              [href]="pendingTransfer.receipt_url" 
              target="_blank"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Abrir comprobante en pantalla completa
            </a>
          </div>

          <!-- Acciones de Aprobación -->
          <div class="pt-4 flex gap-3">
            <button
              (click)="closeTransferModal()"
              class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all active:scale-[0.98] focus:outline-none"
            >
              Cerrar
            </button>
            <button
              (click)="approveTransfer()"
              [disabled]="isApprovingPayment"
              class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-200 flex items-center justify-center gap-2 focus:outline-none"
            >
              <svg *ngIf="!isApprovingPayment" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg *ngIf="isApprovingPayment" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Aprobar Pago
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmación Personalizado -->
    <div
      *ngIf="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 items-center text-center animate-fade-in-up border border-slate-100"
      >
        <!-- Icono Alerta Personalizado -->
        <div class="h-14 w-14 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-100/50 select-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h3 class="font-black text-xl text-slate-800 mb-2">¿Confirmar Eliminación?</h3>
        <p class="text-sm text-slate-500 mb-6 leading-relaxed">
          Esta acción es permanente y eliminará el registro seleccionado de forma irreversible del sistema.
        </p>

        <div class="flex gap-3 w-full">
          <button
            type="button"
            (click)="cancelDelete()"
            class="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors focus:outline-none"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="confirmDelete()"
            class="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors focus:outline-none shadow-md shadow-red-100"
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
})
export class CitasListComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  isLoading = true;
  errorMessage = '';
  filterDate = new Date().toISOString().split('T')[0];
  visibleCount = 10;

  showModal = false;
  isSaving = false;
  selectedAppointmentId: string | null = null;
  newStatus = 'SCHEDULED';
  searchTerm = '';

  showPrescriptionModal = false;
  isLoadingPrescription = false;
  prescriptions: any[] = [];
  isReceptionist = false;

  showTransferModal = false;
  selectedAppForTransfer: Appointment | null = null;
  pendingTransfer: any = null;
  isApprovingPayment = false;

  get filteredAppointments() {
    if (!this.searchTerm) return this.appointments;
    const term = this.searchTerm.toLowerCase();
    return this.appointments.filter(
      (a) =>
        a.patients?.first_name?.toLowerCase().includes(term) ||
        a.patients?.last_name?.toLowerCase().includes(term) ||
        a.patients?.dni?.toLowerCase().includes(term) ||
        a.doctors?.profiles?.first_name?.toLowerCase().includes(term) ||
        a.doctors?.profiles?.last_name?.toLowerCase().includes(term),
    );
  }

  ngOnInit() {
    this.isReceptionist = this.authService.currentUserRole() === 'RECEPTIONIST';
    this.loadAppointments();
  }

  loadMore() {
    this.visibleCount += 10;
  }

  loadAppointments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentsService.getAppointments(this.filterDate || undefined).subscribe({
      next: (data) => {
        this.appointments = data;
        
        // Consultar el estado de los pagos asociados a cada cita en paralelo para recepcionista
        this.appointments.forEach((app) => {
          if (app.id) {
            this.appointmentsService.getPayments(app.id).subscribe({
              next: (payments) => {
                const pendingTransfer = payments.find(
                  (p) => p.method === 'TRANSFER' && p.status === 'PENDING'
                );
                if (pendingTransfer) {
                  app.pendingTransferPayment = pendingTransfer;
                  app.hasPendingTransfer = true;
                } else {
                  app.pendingTransferPayment = null;
                  app.hasPendingTransfer = false;
                }
                this.cdr.detectChanges();
              },
              error: () => {
                app.pendingTransferPayment = null;
                app.hasPendingTransfer = false;
              }
            });
          }
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.errorMessage = 'No se pudieron cargar las citas.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openStatusModal(app: Appointment) {
    if (!app.id) return;
    this.selectedAppointmentId = app.id;
    const currentStatus = app.status || 'SCHEDULED';
    if (this.isReceptionist && currentStatus === 'COMPLETED') {
      this.newStatus = 'SCHEDULED';
    } else {
      this.newStatus = currentStatus;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedAppointmentId = null;
  }

  openPrescriptionModal(app: Appointment) {
    if (!app.id) return;
    this.showPrescriptionModal = true;
    this.isLoadingPrescription = true;
    this.prescriptions = [];

    this.appointmentsService.getPrescription(app.id).subscribe({
      next: (data) => {
        this.prescriptions = Array.isArray(data) ? data : [data];
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching prescription', err);
        this.isLoadingPrescription = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePrescriptionModal() {
    this.showPrescriptionModal = false;
  }

  updateStatus() {
    if (!this.selectedAppointmentId) return;
    if (this.isReceptionist && this.newStatus === 'COMPLETED') {
      this.errorMessage = 'No tienes permisos para marcar citas como completadas.';
      this.closeModal();
      return;
    }
    this.isSaving = true;

    this.appointmentsService
      .updateAppointment(this.selectedAppointmentId, { status: this.newStatus })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.closeModal();
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.message || 'Error al actualizar el estado.';
          this.isSaving = false;
          this.closeModal();
        },
      });
  }

  showDeleteConfirm = false;
  idToDelete: string | null = null;

  triggerDelete(id: string) {
    this.idToDelete = id;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.idToDelete = null;
  }

  confirmDelete() {
    if (!this.idToDelete) return;
    this.appointmentsService.deleteAppointment(this.idToDelete).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.idToDelete = null;
        this.loadAppointments();
      },
      error: (err) => {
        console.error(err);
        this.showDeleteConfirm = false;
        this.idToDelete = null;
      },
    });
  }

  openTransferModal(app: Appointment) {
    this.selectedAppForTransfer = app;
    this.pendingTransfer = app.pendingTransferPayment;
    this.showTransferModal = true;
    this.cdr.detectChanges();
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedAppForTransfer = null;
    this.pendingTransfer = null;
  }

  approveTransfer() {
    if (!this.selectedAppForTransfer?.id || !this.pendingTransfer?.id) return;
    this.isApprovingPayment = true;

    const payload = {
      amount: this.pendingTransfer.amount,
      method: this.pendingTransfer.method,
      status: 'COMPLETED'
    };

    this.appointmentsService.updatePayment(
      this.selectedAppForTransfer.id,
      this.pendingTransfer.id,
      payload
    ).subscribe({
      next: () => {
        this.isApprovingPayment = false;
        this.closeTransferModal();
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Error approving transfer:', err);
        this.errorMessage = 'Error al aprobar el pago de la transferencia.';
        this.isApprovingPayment = false;
      }
    });
  }
}
