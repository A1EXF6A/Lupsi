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

  getSpecialties(): Observable<Specialty[]> {
    return this.http.get<Specialty[]>(`${this.apiUrl}/specialties`);
  }

  getAppointmentTypes(): Observable<AppointmentType[]> {
    return this.http.get<AppointmentType[]>(`${this.apiUrl}/appointment-types`);
  }

  getOffices(): Observable<Office[]> {
    return this.http.get<Office[]>(`${this.apiUrl}/offices`);
  }
}

