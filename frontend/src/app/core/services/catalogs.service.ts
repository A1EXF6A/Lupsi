import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Doctor {
  id: string;
  specialty: string;
  profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface Specialty {
  id: string;
  name: string;
  description: string;
}

export interface AppointmentType {
  id: string;
  name: string;
  durationMinutes: number;
}

export interface Office {
  id: string;
  name: string;
  floor: string;
}

@Injectable({
  providedIn: 'root',
})
export class CatalogsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/catalogs`;

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`);
  }

  // Specialties
  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.apiUrl}/specialties`);
  }
  createSpecialty(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/specialties`, data);
  }
  updateSpecialty(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/specialties/${id}`, data);
  }
  deleteSpecialty(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/specialties/${id}`);
  }

  // Appointment Types
  getAppointmentTypes(): Observable<AppointmentType[]> {
    return this.http.get<AppointmentType[]>(`${this.apiUrl}/appointment-types`);
  }
  createAppointmentType(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointment-types`, data);
  }
  updateAppointmentType(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointment-types/${id}`, data);
  }
  deleteAppointmentType(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointment-types/${id}`);
  }

  // Offices
  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.apiUrl}/offices`);
  }
  createOffice(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/offices`, data);
  }
  updateOffice(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/offices/${id}`, data);
  }
  deleteOffice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/offices/${id}`);
  }
}
