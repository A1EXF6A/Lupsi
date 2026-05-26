import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-3xl shadow-xl border border-green-50/50">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div
            class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600"
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
          </div>
          Mis Citas Médicas
        </h2>
      </div>

      <div *ngIf="isLoading" class="text-center py-10">
        <div class="inline-flex items-center gap-2 text-green-600 font-medium">
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
          Cargando citas...
        </div>
      </div>

      <div
        *ngIf="!isLoading && appointments.length === 0"
        class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="mx-auto text-slate-300 mb-4"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <p class="text-slate-500 font-medium mb-1">Aún no tienes citas agendadas.</p>
        <p class="text-slate-400 text-sm mb-4">
          Puedes agendar tu primera consulta médica desde la sección de Nueva Reserva.
        </p>
      </div>

      <div *ngIf="!isLoading && appointments.length > 0" class="flex flex-wrap gap-2 mb-6">
        <button
          (click)="setFilter('ALL')"
          [class.bg-slate-800]="currentFilter === 'ALL'"
          [class.text-white]="currentFilter === 'ALL'"
          [class.bg-slate-100]="currentFilter !== 'ALL'"
          [class.text-slate-600]="currentFilter !== 'ALL'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-slate-200"
        >
          Todas
        </button>
        <button
          (click)="setFilter('SCHEDULED')"
          [class.bg-amber-500]="currentFilter === 'SCHEDULED'"
          [class.text-white]="currentFilter === 'SCHEDULED'"
          [class.bg-slate-100]="currentFilter !== 'SCHEDULED'"
          [class.text-slate-600]="currentFilter !== 'SCHEDULED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-amber-100"
        >
          Programadas
        </button>
        <button
          (click)="setFilter('COMPLETED')"
          [class.bg-green-500]="currentFilter === 'COMPLETED'"
          [class.text-white]="currentFilter === 'COMPLETED'"
          [class.bg-slate-100]="currentFilter !== 'COMPLETED'"
          [class.text-slate-600]="currentFilter !== 'COMPLETED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-green-100"
        >
          Completadas
        </button>
        <button
          (click)="setFilter('CANCELLED')"
          [class.bg-rose-500]="currentFilter === 'CANCELLED'"
          [class.text-white]="currentFilter === 'CANCELLED'"
          [class.bg-slate-100]="currentFilter !== 'CANCELLED'"
          [class.text-slate-600]="currentFilter !== 'CANCELLED'"
          class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-rose-100"
        >
          Canceladas
        </button>
      </div>

      <div
        *ngIf="!isLoading && filteredAppointments.length === 0 && appointments.length > 0"
        class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200"
      >
        <p class="text-slate-500 font-medium">No se encontraron citas con este estado.</p>
      </div>

      <div *ngIf="!isLoading && paginatedAppointments.length > 0" class="space-y-4">
        <div
          *ngFor="let apt of paginatedAppointments"
          class="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all gap-4"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100 flex-shrink-0"
              >
                <span class="text-xs font-bold text-slate-500 uppercase">{{
                  apt.appointment_time | date: 'MMM'
                }}</span>
                <span class="text-lg font-black text-gray-900 leading-none">{{
                  apt.appointment_time | date: 'dd'
                }}</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">
                  Consulta con Dr/Dra. {{ apt.doctors?.profiles?.first_name || 'No especificado' }}
                  {{ apt.doctors?.profiles?.last_name || '' }}
                </h3>
                <p class="text-sm text-slate-500 font-medium mt-0.5">
                  Especialidad:
                  <span class="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs ml-1">{{
                    apt.doctors?.specialty || 'General'
                  }}</span>
                </p>
                <div class="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Hora: {{ apt.appointment_time | date: 'h:mm a' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span
                [class.bg-amber-50]="apt.status === 'SCHEDULED'"
                [class.text-amber-700]="apt.status === 'SCHEDULED'"
                [class.border-amber-100]="apt.status === 'SCHEDULED'"
                [class.bg-green-50]="apt.status === 'COMPLETED'"
                [class.text-green-700]="apt.status === 'COMPLETED'"
                [class.border-green-100]="apt.status === 'COMPLETED'"
                [class.bg-rose-50]="apt.status === 'CANCELLED'"
                [class.text-rose-700]="apt.status === 'CANCELLED'"
                [class.border-rose-100]="apt.status === 'CANCELLED'"
                [class.bg-slate-50]="!apt.status"
                [class.text-slate-700]="!apt.status"
                [class.border-slate-200]="!apt.status"
                class="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5"
              >
                <span
                  [class.bg-amber-500]="apt.status === 'SCHEDULED'"
                  [class.bg-green-500]="apt.status === 'COMPLETED'"
                  [class.bg-rose-500]="apt.status === 'CANCELLED'"
                  [class.bg-slate-400]="!apt.status"
                  class="w-1.5 h-1.5 rounded-full"
                ></span>
                {{
                  apt.status === 'SCHEDULED'
                    ? 'PROGRAMADA'
                    : apt.status === 'COMPLETED'
                      ? 'COMPLETADA'
                      : apt.status === 'CANCELLED'
                        ? 'CANCELADA'
                        : 'DESCONOCIDO'
                }}
              </span>
            </div>
          </div>

          <!-- Actions Menu -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60 justify-end">
            <button
              *ngIf="apt.status === 'COMPLETED'"
              (click)="openPrescriptionModal(apt)"
              class="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
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
              Ver Receta
            </button>
              <button
                *ngIf="apt.status === 'SCHEDULED' && !checkIfPast(apt.appointment_time) && !apt.paid && !apt.hasPendingPayment"
                (click)="goToPayment(apt)"
                class="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                Pagar Cita
              </button>

              <span 
                *ngIf="apt.status === 'SCHEDULED' && !apt.paid && apt.hasPendingPayment" 
                class="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 flex items-center gap-1.5 select-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 animate-pulse text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pago Pendiente de Aprobación
              </span>

              <span *ngIf="apt.paid" class="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-600 rounded-lg border border-green-200 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Pagada
              </span>
              <button
                *ngIf="apt.paid"
                (click)="viewReceipt(apt)"
                class="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Ver Recibo
              </button>
            <button
              *ngIf="apt.status === 'SCHEDULED' && !checkIfPast(apt.appointment_time)"
              (click)="confirmCancelAppointment(apt.id!)"
              class="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div
        *ngIf="totalPages > 1"
        class="flex items-center justify-between mt-6 pt-6 border-t border-slate-100"
      >
        <button
          (click)="prevPage()"
          [disabled]="currentPage === 1"
          class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <span class="text-sm font-bold text-slate-400"
          >Página {{ currentPage }} de {{ totalPages }}</span
        >
        <button
          (click)="nextPage()"
          [disabled]="currentPage === totalPages"
          class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modals -->
    <!-- Prescription Modal -->
    <div
      *ngIf="showPrescriptionModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
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
          <div *ngIf="isLoadingModal" class="text-center py-8 text-slate-500">
            Cargando receta...
          </div>
          <div
            *ngIf="!isLoadingModal && prescriptions.length === 0"
            class="text-center py-8 text-slate-500"
          >
            No hay recetas registradas para esta cita.
          </div>
          <div *ngIf="!isLoadingModal && prescriptions.length > 0" class="space-y-4">
            <div
              *ngFor="let pres of prescriptions"
              class="p-4 bg-slate-50 rounded-xl border border-slate-100"
            >
              <p class="text-sm text-slate-700 mb-2">
                <span class="font-bold">Notas del Doctor:</span><br />
                {{ pres.notes || 'Sin notas.' }}
              </p>
              <div *ngIf="pres.medications && pres.medications.length > 0" class="mt-4">
                <span class="font-bold text-sm text-slate-700">Medicamentos:</span>
                <ul class="mt-2 space-y-2">
                  <li
                    *ngFor="let med of pres.medications"
                    class="text-sm bg-white p-2 rounded border border-slate-200"
                  >
                    <span class="font-bold text-slate-800">{{ med.name }}</span> -
                    {{ med.dosage }} ({{ med.frequency }}) durante {{ med.duration }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            (click)="closePrescriptionModal()"
            class="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div
      *ngIf="showPaymentModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"
        >
          <h3 class="font-bold text-lg text-slate-800">Gestionar Pago</h3>
          <button
            (click)="closePaymentModal()"
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
          <div *ngIf="isLoadingModal" class="text-center py-8 text-slate-500">
            Cargando pagos...
          </div>

          <div *ngIf="!isLoadingModal">
            <!-- Bloqueo si la cita es pasada -->
            <div
              *ngIf="isPastAppointment"
              class="mb-6 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-sm font-medium flex items-start gap-2"
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
                class="mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              La fecha de esta cita ya pasó. El pago ya no puede ser modificado.
            </div>

            <!-- Lista de Pagos -->
            <div *ngIf="payments.length > 0" class="space-y-3 mb-6">
              <h4 class="font-bold text-slate-700 text-sm">Pagos Registrados</h4>
              <div
                *ngFor="let p of payments"
                class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center"
              >
                <div>
                  <p class="font-bold text-slate-800">\${{ p.amount }}</p>
                  <p class="text-xs text-slate-500">
                    Método: {{ p.method || 'N/A' }} | Estado:
                    <span
                      class="font-bold"
                      [class.text-green-600]="p.status === 'COMPLETED'"
                      [class.text-amber-600]="p.status === 'PENDING'"
                      >{{ p.status }}</span
                    >
                  </p>
                </div>
                <div class="flex gap-2" *ngIf="!isPastAppointment && p.status !== 'COMPLETED'">
                  <button
                    (click)="editPayment(p)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
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
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Formulario de Pago (Nuevo o Edición) -->
            <div *ngIf="!isPastAppointment" class="bg-white p-4 rounded-xl border border-slate-200">
              <h4 class="font-bold text-slate-700 text-sm mb-3">
                {{ selectedPayment ? 'Editar Pago' : 'Nuevo Pago' }}
              </h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Monto ($)</label>
                  <input
                    type="number"
                    [(ngModel)]="paymentForm.amount"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Método</label>
                  <select
                    [(ngModel)]="paymentForm.method"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="CASH">Efectivo</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                  <select
                    [(ngModel)]="paymentForm.status"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
                <div class="pt-2 flex gap-2">
                  <button
                    (click)="savePayment()"
                    class="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    *ngIf="selectedPayment"
                    (click)="cancelEditPayment()"
                    class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                  >
                    Cancelar Edición
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div
      *ngIf="showConfirmModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all"
      >
        <div class="p-6 text-center">
          <div
            class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">{{ confirmConfig.title }}</h3>
          <p class="text-sm text-slate-500">{{ confirmConfig.message }}</p>
        </div>
        <div class="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button
            (click)="closeConfirmModal()"
            class="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
          >
            No, volver
          </button>
          <button
            (click)="executeConfirm()"
            class="flex-1 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors"
          >
            Sí, continuar
          </button>
    </div>

    <!-- Modal Alerta/Advertencia Personalizado -->
    <div
      *ngIf="showWarningModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100 animate-fade-in-up"
      >
        <div class="p-6 text-center">
          <div
            class="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mx-auto mb-4 border border-indigo-100/50"
          >
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <h3 class="text-xl font-black text-slate-800 mb-2">Comprobante No Disponible</h3>
          <p class="text-sm text-slate-500 leading-relaxed">{{ warningModalMessage }}</p>
        </div>
        <div class="p-4 bg-slate-50 flex border-t border-slate-100">
          <button
            (click)="showWarningModal = false"
            class="w-full py-3 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md shadow-indigo-100 focus:outline-none"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  `,
})
export class MisCitasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);
  router = inject(Router);

  goToPayment(apt: Appointment) {
    this.router.navigate(['/portal-paciente/pagos'], { queryParams: { appointmentId: apt.id } });
  }

  viewReceipt(apt: Appointment) {
    if (!apt.id) return;
    this.appointmentsService.getPayments(apt.id).subscribe({
      next: (payments) => {
        const completedPayment = payments.find(
          (p) => p.status === 'COMPLETED'
        );
        if (completedPayment) {
          const dateStr = new Date(completedPayment.paid_at || completedPayment.created_at || new Date()).toLocaleString('es-EC', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });
          
          const receiptWindow = window.open('', '_blank');
          if (receiptWindow) {
            receiptWindow.document.write(`
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Comprobante de Pago #LUPSI-${completedPayment.id.substring(0,8).toUpperCase()} - Clínica Lupsi</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
                <style>
                  body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f8fafc;
                    color: #0f172a;
                    margin: 0;
                    padding: 50px 20px;
                    display: flex;
                    justify-content: center;
                    -webkit-font-smoothing: antialiased;
                  }
                  .receipt-container {
                    background: white;
                    max-width: 620px;
                    width: 100%;
                    border-radius: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    padding: 40px;
                    box-sizing: border-box;
                  }
                  .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 24px;
                    margin-bottom: 28px;
                  }
                  .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                  }
                  .logo-img {
                    height: 40px;
                    object-fit: contain;
                  }
                  .logo-fallback {
                    background: linear-gradient(135deg, #059669, #10b981);
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    font-size: 18px;
                    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
                  }
                  .brand-name {
                    font-family: 'Outfit', sans-serif;
                    font-weight: 800;
                    font-size: 22px;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.5px;
                  }
                  .brand-name span {
                    color: #10b981;
                  }
                  .meta-info {
                    text-align: right;
                  }
                  .invoice-title {
                    font-family: 'Outfit', sans-serif;
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin: 0 0 4px 0;
                  }
                  .invoice-id {
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                  }
                  .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background-color: #ecfdf5;
                    color: #065f46;
                    padding: 5px 12px;
                    border-radius: 9999px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-top: 8px;
                    border: 1px solid #a7f3d0;
                  }
                  .status-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #10b981;
                    border-radius: 50%;
                  }
                  .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 28px;
                  }
                  .details-section-title {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #94a3b8;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    display: block;
                  }
                  .details-text {
                    font-size: 13px;
                    line-height: 1.5;
                    color: #475569;
                    margin: 0;
                  }
                  .details-highlight {
                    font-weight: 600;
                    color: #0f172a;
                  }
                  .summary-card {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 20px;
                    margin-bottom: 28px;
                  }
                  .summary-title {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    letter-spacing: 1px;
                    margin-bottom: 14px;
                    display: block;
                  }
                  .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                  }
                  .summary-label {
                    color: #475569;
                    font-size: 13px;
                    font-weight: 500;
                  }
                  .summary-value {
                    color: #0f172a;
                    font-size: 13px;
                    font-weight: 600;
                  }
                  .amount-row {
                    border-top: 1px dashed #cbd5e1;
                    margin-top: 14px;
                    padding-top: 14px;
                  }
                  .amount-label {
                    font-family: 'Outfit', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                  }
                  .amount-value {
                    font-family: 'Outfit', sans-serif;
                    font-size: 22px;
                    font-weight: 800;
                    color: #047857;
                  }
                  .footer {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 24px;
                    text-align: center;
                  }
                  .footer-text {
                    font-size: 12px;
                    color: #64748b;
                    line-height: 1.6;
                    margin: 0 0 16px 0;
                  }
                  .footer-text a {
                    color: #059669;
                    text-decoration: none;
                    font-weight: 600;
                  }
                  .stripe-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 500;
                  }
                  .stripe-badge svg {
                    fill: #94a3b8;
                  }
                  .actions-container {
                    display: flex;
                    justify-content: center;
                    margin-top: 20px;
                  }
                  .btn-print {
                    font-family: 'Inter', sans-serif;
                    background-color: #0f172a;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 10px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04);
                    transition: all 0.15s ease;
                  }
                  .btn-print:hover {
                    background-color: #1e293b;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
                  }
                  .btn-print:active {
                    transform: translateY(0);
                  }
                  @media print {
                    body {
                      background: white;
                      padding: 0;
                    }
                    .receipt-container {
                      box-shadow: none;
                      border: none;
                      padding: 0;
                      max-width: 100%;
                    }
                    .btn-print {
                      display: none;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="receipt-container">
                  <div class="header">
                    <div class="logo-container">
                      <img src="/lupsi_logo-Photoroom.png" alt="LUPSI+" class="logo-img" onerror="this.style.display='none'; document.getElementById('logo-fallback-id').style.display='flex'">
                      <div id="logo-fallback-id" class="logo-fallback" style="display:none">L</div>
                      <h1 class="brand-name">LUPSI<span>+</span></h1>
                    </div>
                    <div class="meta-info">
                      <p class="invoice-title">Comprobante Digital</p>
                      <p class="invoice-id">#LUPSI-${completedPayment.id.substring(0, 8).toUpperCase()}</p>
                      <div class="status-badge">
                        <span class="status-dot"></span>
                        PAGO COMPLETADO
                      </div>
                    </div>
                  </div>
                  
                  <div class="details-grid">
                    <div>
                      <span class="details-section-title">Información del Paciente</span>
                      <p class="details-text details-highlight">Paciente Registrado</p>
                      <p class="details-text">Portal de Pacientes Lupsi</p>
                    </div>
                    <div>
                      <span class="details-section-title">Detalles del Proveedor</span>
                      <p class="details-text details-highlight">Clínica Lupsi S.A.</p>
                      <p class="details-text">Ambato, Ecuador</p>
                      <p class="details-text">RUC: 1792847583001</p>
                    </div>
                  </div>

                  <div class="summary-card">
                    <span class="summary-title">Resumen de la Transacción</span>
                    <div class="summary-row">
                      <span class="summary-label">Concepto</span>
                      <span class="summary-value">Agendamiento de Cita Médica</span>
                    </div>
                    <div class="summary-row">
                      <span class="summary-label">Médico Tratante</span>
                      <span class="summary-value">Dr/Dra. ${apt.doctors?.profiles?.first_name || 'No especificado'} ${apt.doctors?.profiles?.last_name || ''}</span>
                    </div>
                    <div class="summary-row">
                      <span class="summary-label">Fecha y Hora</span>
                      <span class="summary-value">${dateStr}</span>
                    </div>
                    <div class="summary-row">
                      <span class="summary-label">Método de Pago</span>
                      <span class="summary-value">Tarjeta de Crédito (Stripe Secure)</span>
                    </div>
                    <div class="summary-row amount-row">
                      <span class="amount-label">Monto Total Liquidado</span>
                      <span class="amount-value">$50.00 USD</span>
                    </div>
                  </div>

                  <div class="footer">
                    <p class="footer-text">
                      Si tienes alguna duda o deseas solicitar asistencia con tu cita médica, contáctanos a:<br>
                      <a href="mailto:soporte@lupsi.com">soporte@lupsi.com</a> o llama a nuestra central técnica.
                    </p>
                    <div class="stripe-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                      Procesado de forma segura con Stripe Secure
                    </div>
                    <div class="actions-container">
                      <button class="btn-print" onclick="window.print()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        Imprimir o Guardar Recibo (PDF)
                      </button>
                    </div>
                  </div>
                </div>
              </body>
              </html>
            `);
            receiptWindow.document.close();
          }
        } else {
          this.warningModalMessage = 'Este pago fue realizado por un método alternativo o no cuenta con comprobante digital en Stripe.';
          this.showWarningModal = true;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al obtener el recibo:', err);
      },
    });
  }

  appointments: Appointment[] = [];
  isLoading = false;

  currentFilter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  currentPage = 1;
  itemsPerPage = 4;

  // Modal states
  showPrescriptionModal = false;
  showPaymentModal = false;
  showConfirmModal = false;
  showWarningModal = false;
  warningModalMessage = '';
  isLoadingModal = false;
  selectedAppointment: Appointment | null = null;

  prescriptions: any[] = [];
  payments: any[] = [];
  isPastAppointment = false;

  paymentForm = {
    amount: 0,
    method: 'CASH',
    status: 'PENDING',
  };
  selectedPayment: any = null;

  confirmConfig = {
    title: '',
    message: '',
    action: () => {},
  };

  get filteredAppointments() {
    if (this.currentFilter === 'ALL') {
      return this.appointments;
    }
    return this.appointments.filter((a) => a.status === this.currentFilter);
  }

  get totalPages() {
    return Math.ceil(this.filteredAppointments.length / this.itemsPerPage) || 1;
  }

  get paginatedAppointments() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  setFilter(filter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentsService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data.reverse();
        
        // Consultar el estado de los pagos asociados a cada cita en paralelo
        this.appointments.forEach((apt) => {
          if (apt.id) {
            this.appointmentsService.getPayments(apt.id).subscribe({
              next: (payments) => {
                const hasPending = payments.some((p) => p.status === 'PENDING');
                const hasCompleted = payments.some((p) => p.status === 'COMPLETED');
                
                (apt as any).hasPendingPayment = hasPending;
                (apt as any).hasCompletedPayment = hasCompleted;
                
                // Si ya está pagado en base a Stripe o aprobación, forzamos renderizado
                if (hasCompleted) {
                  apt.paid = true;
                }
                
                this.cdr.detectChanges();
              },
              error: () => {
                (apt as any).hasPendingPayment = false;
                (apt as any).hasCompletedPayment = false;
              }
            });
          }
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openConfirmModal(title: string, message: string, action: () => void) {
    this.confirmConfig = { title, message, action };
    this.showConfirmModal = true;
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  executeConfirm() {
    if (this.confirmConfig.action) {
      this.confirmConfig.action();
    }
    this.closeConfirmModal();
  }

  confirmCancelAppointment(id: string) {
    this.openConfirmModal('Cancelar Cita', '¿Está seguro de que desea cancelar esta cita?', () => {
      this.cancelAppointment(id);
    });
  }

  cancelAppointment(id: string) {
    this.appointmentsService.updateAppointment(id, { status: 'CANCELLED' }).subscribe({
      next: () => this.loadAppointments(),
      error: (err) => console.error('Error canceling appointment', err),
    });
  }

  openPrescriptionModal(apt: Appointment) {
    this.selectedAppointment = apt;
    this.showPrescriptionModal = true;
    this.isLoadingModal = true;
    this.prescriptions = [];

    this.appointmentsService.getPrescription(apt.id!).subscribe({
      next: (data) => {
        this.prescriptions = Array.isArray(data) ? data : [data];
        this.isLoadingModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching prescriptions', err);
        this.isLoadingModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePrescriptionModal() {
    this.showPrescriptionModal = false;
    this.selectedAppointment = null;
  }

  checkIfPast(appointmentDateStr: string): boolean {
    const aptDate = new Date(appointmentDateStr);
    const today = new Date();
    return aptDate < today;
  }

  openPaymentModal(apt: Appointment) {
    this.selectedAppointment = apt;
    this.showPaymentModal = true;
    this.isLoadingModal = true;
    this.payments = [];
    this.cancelEditPayment();

    this.isPastAppointment = this.checkIfPast(apt.appointment_time);

    this.appointmentsService.getPayments(apt.id!).subscribe({
      next: (data) => {
        this.payments = Array.isArray(data) ? data : [data];
        this.isLoadingModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching payments', err);
        this.isLoadingModal = false;
        this.cdr.detectChanges();
      },
    });
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.selectedAppointment = null;
  }

  editPayment(p: any) {
    this.selectedPayment = p;
    this.paymentForm = {
      amount: p.amount,
      method: p.method || 'CASH',
      status: p.status || 'PENDING',
    };
  }

  cancelEditPayment() {
    this.selectedPayment = null;
    this.paymentForm = { amount: 0, method: 'CASH', status: 'PENDING' };
  }

  savePayment() {
    if (!this.selectedAppointment || this.isPastAppointment) return;

    if (this.selectedPayment) {
      this.appointmentsService
        .updatePayment(this.selectedAppointment.id!, this.selectedPayment.id, this.paymentForm)
        .subscribe({
          next: () => this.openPaymentModal(this.selectedAppointment!),
          error: (err) => console.error(err),
        });
    } else {
      this.appointmentsService
        .createPayment(this.selectedAppointment.id!, this.paymentForm)
        .subscribe({
          next: () => this.openPaymentModal(this.selectedAppointment!),
          error: (err) => console.error(err),
        });
    }
  }
}
