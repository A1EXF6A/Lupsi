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

@Injectable({
  providedIn: 'root'
})
export class CatalogsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/catalogs`;

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.apiUrl}/doctors`);
  }
}
