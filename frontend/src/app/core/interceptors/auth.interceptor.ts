import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

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

  // Clonar la solicitud y agregar el header de autorización si existe el token y no es publica
  if (token && req.url.includes('/api/v1/') && !isPublicUrl) {
    console.log(`[AuthInterceptor] Inyectando Token en: ${req.url}`);
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  if (req.url.includes('/api/v1/') && !isPublicUrl) {
    console.warn(`[AuthInterceptor] ADVERTENCIA: No hay token para la ruta: ${req.url}`);
  }

  return next(req);
};
