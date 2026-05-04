import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentsService, Appointment } from '../../core/services/appointments.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white p-6 rounded-3xl shadow-xl border border-green-50/50">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
          </div>
          Mis Citas Médicas
        </h2>
      </div>

      <div *ngIf="isLoading" class="text-center py-10">
        <div class="inline-flex items-center gap-2 text-green-600 font-medium">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Cargando citas...
        </div>
      </div>

      <div *ngIf="!isLoading && appointments.length === 0" class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto text-slate-300 mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <p class="text-slate-500 font-medium mb-1">Aún no tienes citas agendadas.</p>
        <p class="text-slate-400 text-sm mb-4">Puedes agendar tu primera consulta médica desde la sección de Nueva Reserva.</p>
      </div>

      <div *ngIf="!isLoading && appointments.length > 0" class="flex flex-wrap gap-2 mb-6">
        <button (click)="setFilter('ALL')" [class.bg-slate-800]="currentFilter === 'ALL'" [class.text-white]="currentFilter === 'ALL'" [class.bg-slate-100]="currentFilter !== 'ALL'" [class.text-slate-600]="currentFilter !== 'ALL'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-slate-200">Todas</button>
        <button (click)="setFilter('SCHEDULED')" [class.bg-amber-500]="currentFilter === 'SCHEDULED'" [class.text-white]="currentFilter === 'SCHEDULED'" [class.bg-slate-100]="currentFilter !== 'SCHEDULED'" [class.text-slate-600]="currentFilter !== 'SCHEDULED'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-amber-100">Programadas</button>
        <button (click)="setFilter('COMPLETED')" [class.bg-green-500]="currentFilter === 'COMPLETED'" [class.text-white]="currentFilter === 'COMPLETED'" [class.bg-slate-100]="currentFilter !== 'COMPLETED'" [class.text-slate-600]="currentFilter !== 'COMPLETED'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-green-100">Completadas</button>
        <button (click)="setFilter('CANCELLED')" [class.bg-rose-500]="currentFilter === 'CANCELLED'" [class.text-white]="currentFilter === 'CANCELLED'" [class.bg-slate-100]="currentFilter !== 'CANCELLED'" [class.text-slate-600]="currentFilter !== 'CANCELLED'" class="px-4 py-2 rounded-full text-sm font-bold transition-colors hover:bg-rose-100">Canceladas</button>
      </div>

      <div *ngIf="!isLoading && filteredAppointments.length === 0 && appointments.length > 0" class="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p class="text-slate-500 font-medium">No se encontraron citas con este estado.</p>
      </div>

      <div *ngIf="!isLoading && paginatedAppointments.length > 0" class="space-y-4">
        <div *ngFor="let apt of paginatedAppointments" class="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-green-200 hover:shadow-md transition-all gap-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
                <span class="text-xs font-bold text-slate-500 uppercase">{{ apt.appointment_time | date: 'MMM' }}</span>
                <span class="text-lg font-black text-gray-900 leading-none">{{ apt.appointment_time | date: 'dd' }}</span>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">
                  Consulta con Dr/Dra. {{ apt.doctors?.profiles?.first_name || 'No especificado' }} {{ apt.doctors?.profiles?.last_name || '' }}
                </h3>
                <p class="text-sm text-slate-500 font-medium mt-0.5">
                  Especialidad: <span class="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs ml-1">{{ apt.doctors?.specialty || 'General' }}</span>
                </p>
                <div class="flex items-center gap-2 mt-2 text-xs font-medium text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Hora: {{ apt.appointment_time | date: 'h:mm a' }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span [class.bg-amber-50]="apt.status === 'SCHEDULED'" [class.text-amber-700]="apt.status === 'SCHEDULED'" [class.border-amber-100]="apt.status === 'SCHEDULED'" [class.bg-green-50]="apt.status === 'COMPLETED'" [class.text-green-700]="apt.status === 'COMPLETED'" [class.border-green-100]="apt.status === 'COMPLETED'" [class.bg-rose-50]="apt.status === 'CANCELLED'" [class.text-rose-700]="apt.status === 'CANCELLED'" [class.border-rose-100]="apt.status === 'CANCELLED'" [class.bg-slate-50]="!apt.status" [class.text-slate-700]="!apt.status" [class.border-slate-200]="!apt.status" class="px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5">
                <span [class.bg-amber-500]="apt.status === 'SCHEDULED'" [class.bg-green-500]="apt.status === 'COMPLETED'" [class.bg-rose-500]="apt.status === 'CANCELLED'" [class.bg-slate-400]="!apt.status" class="w-1.5 h-1.5 rounded-full"></span>
                {{ apt.status === 'SCHEDULED' ? 'PROGRAMADA' : apt.status === 'COMPLETED' ? 'COMPLETADA' : apt.status === 'CANCELLED' ? 'CANCELADA' : 'DESCONOCIDO' }}
              </span>
            </div>
          </div>
          
          <!-- Actions Menu -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-slate-200/60 justify-end">
            <button *ngIf="apt.status === 'COMPLETED'" (click)="openPrescriptionModal(apt)" class="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              Ver Receta
            </button>
            <button (click)="openPaymentModal(apt)" class="text-xs font-bold px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Gestionar Pago
            </button>
            <button *ngIf="apt.status === 'SCHEDULED' && !checkIfPast(apt.appointment_time)" (click)="confirmCancelAppointment(apt.id!)" class="text-xs font-bold px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="totalPages > 1" class="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
        <button (click)="prevPage()" [disabled]="currentPage === 1" class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Anterior</button>
        <span class="text-sm font-bold text-slate-400">Página {{ currentPage }} de {{ totalPages }}</span>
        <button (click)="nextPage()" [disabled]="currentPage === totalPages" class="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Siguiente</button>
      </div>
    </div>

    <!-- Modals -->
    <!-- Prescription Modal -->
    <div *ngIf="showPrescriptionModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">Receta Médica</h3>
          <button (click)="closePrescriptionModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div *ngIf="isLoadingModal" class="text-center py-8 text-slate-500">Cargando receta...</div>
          <div *ngIf="!isLoadingModal && prescriptions.length === 0" class="text-center py-8 text-slate-500">
            No hay recetas registradas para esta cita.
          </div>
          <div *ngIf="!isLoadingModal && prescriptions.length > 0" class="space-y-4">
            <div *ngFor="let pres of prescriptions" class="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p class="text-sm text-slate-700 mb-2"><span class="font-bold">Notas del Doctor:</span><br/> {{ pres.notes || 'Sin notas.' }}</p>
              <div *ngIf="pres.medications && pres.medications.length > 0" class="mt-4">
                <span class="font-bold text-sm text-slate-700">Medicamentos:</span>
                <ul class="mt-2 space-y-2">
                  <li *ngFor="let med of pres.medications" class="text-sm bg-white p-2 rounded border border-slate-200">
                    <span class="font-bold text-slate-800">{{med.name}}</span> - {{med.dosage}} ({{med.frequency}}) durante {{med.duration}}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button (click)="closePrescriptionModal()" class="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <div *ngIf="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 class="font-bold text-lg text-slate-800">Gestionar Pago</h3>
          <button (click)="closePaymentModal()" class="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto">
          <div *ngIf="isLoadingModal" class="text-center py-8 text-slate-500">Cargando pagos...</div>
          
          <div *ngIf="!isLoadingModal">
            <!-- Bloqueo si la cita es pasada -->
            <div *ngIf="isPastAppointment" class="mb-6 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-sm font-medium flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              La fecha de esta cita ya pasó. El pago ya no puede ser modificado.
            </div>

            <!-- Lista de Pagos -->
            <div *ngIf="payments.length > 0" class="space-y-3 mb-6">
              <h4 class="font-bold text-slate-700 text-sm">Pagos Registrados</h4>
              <div *ngFor="let p of payments" class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <p class="font-bold text-slate-800">\${{p.amount}}</p>
                  <p class="text-xs text-slate-500">Método: {{p.method || 'N/A'}} | Estado: <span class="font-bold" [class.text-green-600]="p.status==='COMPLETED'" [class.text-amber-600]="p.status==='PENDING'">{{p.status}}</span></p>
                </div>
                <div class="flex gap-2" *ngIf="!isPastAppointment && p.status !== 'COMPLETED'">
                  <button (click)="editPayment(p)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                </div>
              </div>
            </div>

            <!-- Formulario de Pago (Nuevo o Edición) -->
            <div *ngIf="!isPastAppointment" class="bg-white p-4 rounded-xl border border-slate-200">
              <h4 class="font-bold text-slate-700 text-sm mb-3">{{ selectedPayment ? 'Editar Pago' : 'Nuevo Pago' }}</h4>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Monto ($)</label>
                  <input type="number" [(ngModel)]="paymentForm.amount" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Método</label>
                  <select [(ngModel)]="paymentForm.method" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="CASH">Efectivo</option>
                    <option value="CARD">Tarjeta</option>
                    <option value="TRANSFER">Transferencia</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-500 mb-1">Estado</label>
                  <select [(ngModel)]="paymentForm.status" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    <option value="PENDING">Pendiente</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
                <div class="pt-2 flex gap-2">
                  <button (click)="savePayment()" class="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">Guardar</button>
                  <button *ngIf="selectedPayment" (click)="cancelEditPayment()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors">Cancelar Edición</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div *ngIf="showConfirmModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">{{ confirmConfig.title }}</h3>
          <p class="text-sm text-slate-500">{{ confirmConfig.message }}</p>
        </div>
        <div class="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button (click)="closeConfirmModal()" class="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">No, volver</button>
          <button (click)="executeConfirm()" class="flex-1 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors">Sí, continuar</button>
        </div>
      </div>
    </div>
  `,
})
export class MisCitasComponent implements OnInit {
  appointmentsService = inject(AppointmentsService);
  cdr = inject(ChangeDetectorRef);

  appointments: Appointment[] = [];
  isLoading = false;

  currentFilter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' = 'ALL';
  currentPage = 1;
  itemsPerPage = 4;

  // Modal states
  showPrescriptionModal = false;
  showPaymentModal = false;
  showConfirmModal = false;
  isLoadingModal = false;
  selectedAppointment: Appointment | null = null;
  
  prescriptions: any[] = [];
  payments: any[] = [];
  isPastAppointment = false;

  paymentForm = {
    amount: 0,
    method: 'CASH',
    status: 'PENDING'
  };
  selectedPayment: any = null;

  confirmConfig = {
    title: '',
    message: '',
    action: () => {}
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
      error: (err) => console.error('Error canceling appointment', err)
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
      }
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
      }
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
      status: p.status || 'PENDING'
    };
  }

  cancelEditPayment() {
    this.selectedPayment = null;
    this.paymentForm = { amount: 0, method: 'CASH', status: 'PENDING' };
  }

  savePayment() {
    if (!this.selectedAppointment || this.isPastAppointment) return;

    if (this.selectedPayment) {
      this.appointmentsService.updatePayment(this.selectedAppointment.id!, this.selectedPayment.id, this.paymentForm).subscribe({
        next: () => this.openPaymentModal(this.selectedAppointment!),
        error: (err) => console.error(err)
      });
    } else {
      this.appointmentsService.createPayment(this.selectedAppointment.id!, this.paymentForm).subscribe({
        next: () => this.openPaymentModal(this.selectedAppointment!),
        error: (err) => console.error(err)
      });
    }
  }
}
