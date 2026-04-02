import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard para proteger rutas privadas. 
 * Si no hay token, redirige al /login (o /register si no hay login aún).
 */
export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUserToken()) {
    return true;
  }

  // Redirigir al Login si no está autenticado
  router.navigate(['/login']);
  return false;
};
