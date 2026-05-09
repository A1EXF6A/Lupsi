import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppointmentSlot {
  start: string;
  end: string;
}

export interface Appointment {
  id?: string;
  patient_id: string;
  doctor_id: string;
  appointment_time: string;
  appointment_end_time?: string;
  status?: string;
  paid?: boolean;
  patients?: any;
  doctors?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/appointments`;

  getAvailableSlots(doctorId: string, date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/available-slots`, {
      params: { doctorId, date },
    });
  }

  createAvailableSlot(payload: {
    doctor_id: string;
    start_time: string;
    end_time: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/available-slots`, payload);
  }

  updateAvailableSlot(
    id: string,
    payload: { start_time: string; end_time: string },
  ): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/available-slots/${id}`, payload);
  }

  deleteAvailableSlot(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/available-slots/${id}`);
  }

  createAppointment(payload: { doctor_id: string; appointment_time: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  getAppointments(date?: string): Observable<Appointment[]> {
    const params: any = {};
    if (date) {
      params.date = date;
    }
    return this.http.get<Appointment[]>(this.apiUrl, { params });
  }

  updateAppointment(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getPrescription(appointmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${appointmentId}/prescription`);
  }

  createPrescription(appointmentId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${appointmentId}/prescription`, payload);
  }

  updatePrescription(appointmentId: string, prescriptionId: string, payload: any): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${appointmentId}/prescription/${prescriptionId}`,
      payload,
    );
  }

  deletePrescription(appointmentId: string, prescriptionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${appointmentId}/prescription/${prescriptionId}`);
  }

  getPayments(appointmentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${appointmentId}/payments`);
  }

  createPayment(appointmentId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${appointmentId}/payments`, payload);
  }

  updatePayment(appointmentId: string, paymentId: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${appointmentId}/payments/${paymentId}`, payload);
  }

  deletePayment(appointmentId: string, paymentId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${appointmentId}/payments/${paymentId}`);
  }
}
