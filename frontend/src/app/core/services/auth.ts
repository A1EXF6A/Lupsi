import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Servicio encargado de gestionar el registro y la sesión del usuario.
 * Sigue el patrón Fricción Cero: Al registrarse, el JWT se emite y guarda automáticamente.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/auth`;

  // Usamos Signals de Angular 17+ para mantener el estado reactivo del usuario
  public currentUserToken = signal<string | null>(this.getTokenFromStorage());
  public currentUserRole = signal<string | null>(this.getRoleFromStorage());

  constructor(private http: HttpClient) {}

  /**
   * Registra a un nuevo paciente y lo loguea automáticamente,
   * almacenando la sesión de Supabase si la petición tiene éxito.
   */
  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        if (response?.session?.access_token) {
          this.setSession(response.session.access_token, response.role);
        }
      }),
    );
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => {
        if (response?.session?.access_token) {
          this.setSession(response.session.access_token, response.role);
        }
      }),
    );
  }

  /**
   * Guarda de forma persistente la sesión.
   */
  private setSession(token: string, role: string) {
    localStorage.setItem('lupsi_token', token);
    localStorage.setItem('lupsi_role', role || 'PATIENT');
    this.currentUserToken.set(token);
    this.currentUserRole.set(role || 'PATIENT');
  }

  /**
   * Recupera el JWT al iniciar la app.
   */
  private getTokenFromStorage(): string | null {
    return localStorage.getItem('lupsi_token');
  }

  private getRoleFromStorage(): string | null {
    return localStorage.getItem('lupsi_role');
  }

  /**
   * Cierra sesión
   */
  logout() {
    localStorage.removeItem('lupsi_token');
    localStorage.removeItem('lupsi_role');
    this.currentUserToken.set(null);
    this.currentUserRole.set(null);
  }

  changePassword(payload: {
    current_password: string;
    new_password: string;
    access_token: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, payload);
  }
}
