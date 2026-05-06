import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Medication {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class MedicationsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/medications`;

  getAll(): Observable<Medication[]> {
    return this.http.get<Medication[]>(this.apiUrl);
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
