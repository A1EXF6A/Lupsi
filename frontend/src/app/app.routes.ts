import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/register', pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  // Agregaremos AuthGuards aquí posteriormente
];
