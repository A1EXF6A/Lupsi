import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { Login } from './auth/login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { PortalPacienteComponent } from './portal-paciente/portal-paciente.component';
import { MisCitasComponent } from './portal-paciente/mis-citas/mis-citas.component';
import { ReservaComponent } from './portal-paciente/reserva/reserva.component';
import { PanelAdminComponent } from './panel-admin/panel-admin.component';
import { MetricasComponent } from './panel-admin/metricas/metricas.component';
import { DoctoresListComponent } from './panel-admin/doctores/doctores-list.component';
import { EspecialidadesListComponent } from './panel-admin/catalogs/especialidades-list.component';
import { TiposCitaListComponent } from './panel-admin/catalogs/tipos-cita-list.component';
import { OficinasListComponent } from './panel-admin/catalogs/oficinas-list.component';
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
      { path: '', redirectTo: 'mis-citas', pathMatch: 'full' },
      { path: 'mis-citas', component: MisCitasComponent },
      { path: 'reserva', component: ReservaComponent },
    ],
  },
  {
    path: 'panel',
    component: PanelAdminComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'metricas', pathMatch: 'full' },
      { path: 'metricas', component: MetricasComponent },
      { path: 'doctores', component: DoctoresListComponent },
      { path: 'especialidades', component: EspecialidadesListComponent },
      { path: 'tipos-cita', component: TiposCitaListComponent },
      { path: 'oficinas', component: OficinasListComponent },
      { path: 'agenda', component: AgendaDiariaComponent },
    ],
  },
];
