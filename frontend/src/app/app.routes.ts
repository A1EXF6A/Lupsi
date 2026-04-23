import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { ReservaComponent } from './portal-paciente/reserva/reserva.component';
import { PanelAdminComponent } from './panel-admin/panel-admin.component';
import { AgendaDiariaComponent } from './panel-admin/agenda-diaria/agenda-diaria.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { 
    path: 'portal-paciente', 
    component: PortalPacienteComponent, 
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'reserva', pathMatch: 'full' },
      { path: 'reserva', component: ReservaComponent }
    ]
  },
  {
    path: 'panel',
    component: PanelAdminComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'agenda', component: AgendaDiariaComponent }
    ]
  }
];
