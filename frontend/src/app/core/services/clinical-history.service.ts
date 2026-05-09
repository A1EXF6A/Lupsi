import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClinicalHistory {
  id: string;
  patient_id: string;
  doctor_id: string;
  previous_conditions?: string[];
  allergies?: string[];
  notes?: string;
  diagnosis?: string;
  document_url?: string;
  created_at: string;
  doctors?: any;
  patients?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ClinicalHistoryService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/clinical-history`;

  getByPatient(patientId: string): Observable<ClinicalHistory[]> {
    return this.http.get<ClinicalHistory[]>(this.apiUrl, {
      params: { patientId },
    });
  }

  getByDoctor(doctorId: string): Observable<ClinicalHistory[]> {
    return this.http.get<ClinicalHistory[]>(this.apiUrl, {
      params: { doctorId },
    });
  }

  getAll(): Observable<ClinicalHistory[]> {
    return this.http.get<ClinicalHistory[]>(this.apiUrl);
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
