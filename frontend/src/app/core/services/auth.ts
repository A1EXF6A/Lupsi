import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * Servicio encargado de gestionar el registro y la sesión del usuario.
 * Sigue el patrón Fricción Cero: Al registrarse, el JWT se emite y guarda automáticamente.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Ajustar la URL a la variable de entorno según el proyecto, asumiendo local para dev
  private readonly apiUrl = 'http://localhost:3000/api/v1/auth';

  // Usamos Signals de Angular 17+ para mantener el estado reactivo del usuario
  public currentUserToken = signal<string | null>(this.getTokenFromStorage());

  constructor(private http: HttpClient) {}

  /**
   * Registra a un nuevo paciente y lo loguea automáticamente,
   * almacenando la sesión de Supabase si la petición tiene éxito.
   */
  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => {
        if (response?.session?.access_token) {
          this.setToken(response.session.access_token);
        }
      }),
    );
  }

  /**
   * Guarda el JWT del usuario de forma persistente.
   */
  private setToken(token: string) {
    localStorage.setItem('lupsi_token', token);
    this.currentUserToken.set(token);
  }

  /**
   * Recupera el JWT al iniciar la app.
   */
  private getTokenFromStorage(): string | null {
    return localStorage.getItem('lupsi_token');
  }

  /**
   * Cierra sesión
   */
  logout() {
    localStorage.removeItem('lupsi_token');
    this.currentUserToken.set(null);
  }
}
