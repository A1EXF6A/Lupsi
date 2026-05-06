import { HttpInterceptorFn, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentUserToken();

  const publicUrls = [
    '/api/v1/catalogs/specialties',
    '/api/v1/catalogs/appointment-types',
    '/api/v1/catalogs/offices',
    '/api/v1/catalogs/doctors',
  ];

  const isPublicUrl = publicUrls.some((url) => req.url.includes(url));
  let finalReq = req;

  // Clonar la solicitud y agregar el header de autorización si existe el token y no es publica
  if (token && req.url.includes('/api/v1/') && !isPublicUrl) {
    // Usamos HttpHeaders para asegurar compatibilidad total con Fetch API
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    console.log(
      `[AuthInterceptor] 🔐 Inyectando Token (Inicia con: ${token.substring(0, 10)}...) en: ${req.url}`,
    );

    finalReq = req.clone({ headers });
  } else if (!isPublicUrl && req.url.includes('/api/v1/')) {
    console.warn(`[AuthInterceptor] ⚠️ No hay token disponible para la ruta privada: ${req.url}`);
  }

  return next(finalReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 504) {
        console.error(
          '[AuthInterceptor] 🚨 Error 504 (Gateway Timeout): El servidor no respondió a tiempo.',
        );
      } else if (error.status === 401) {
        console.error(
          '[AuthInterceptor] ❌ Error 401 (Unauthorized): El servidor dice que NO recibió el token o es inválido.',
          error.error,
        );
      }
      return throwError(() => error);
    }),
  );
};
