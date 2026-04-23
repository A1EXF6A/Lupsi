import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.currentUserToken();

  // Clonar la solicitud y agregar el header de autorización si existe el token
  if (token && req.url.includes('/api/v1/')) {
    console.log(`[AuthInterceptor] Inyectando Token en: ${req.url}`);
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  if (req.url.includes('/api/v1/')) {
    console.warn(`[AuthInterceptor] ADVERTENCIA: No hay token para la ruta: ${req.url}`);
  }

  return next(req);
};
