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
  patients?: any;
  doctors?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/appointments`;

  getAvailableSlots(doctorId: string, date: string): Observable<AppointmentSlot[]> {
    return this.http.get<AppointmentSlot[]>(`${this.apiUrl}/available-slots`, {
      params: { doctorId, date },
    });
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
}
