import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicalAttentionPatient {
  id: string;
  first_name: string;
  last_name: string;
  dni?: string;
}

export interface ClinicalAttentionDoctor {
  id: string;
  specialty?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface ClinicalAttention {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  notes?: string | null;
  vitals?: Record<string, unknown> | null;
  diagnosis?: string | null;
  treatment?: string | null;
  created_at?: string;
  patients?: ClinicalAttentionPatient;
  doctors?: ClinicalAttentionDoctor;
}

@Injectable({
  providedIn: 'root',
})
export class ClinicalAttentionsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/clinical-attentions`;

  getAll(filters?: {
    patientId?: string;
    doctorId?: string;
    appointmentId?: string;
  }): Observable<ClinicalAttention[]> {
    let params = new HttpParams();
    if (filters?.patientId) params = params.set('patientId', filters.patientId);
    if (filters?.doctorId) params = params.set('doctorId', filters.doctorId);
    if (filters?.appointmentId) params = params.set('appointmentId', filters.appointmentId);
    return this.http.get<ClinicalAttention[]>(this.apiUrl, { params });
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
