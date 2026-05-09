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
import { PanelDoctorComponent } from './panel-doctor/panel-doctor.component';
import { DoctorAgendaDiariaComponent } from './panel-doctor/agenda-diaria/agenda-diaria.component';
import { AtenderComponent } from './panel-doctor/atender/atender.component';
import { DoctorFichasComponent } from './panel-doctor/fichas/fichas.component';
import { DoctorRecetasComponent } from './panel-doctor/recetas/recetas.component';

import { HistorialMedicoComponent } from './portal-paciente/historial-medico/historial-medico.component';
import { PerfilPacienteComponent } from './portal-paciente/perfil/perfil.component';

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
      { path: 'historial-medico', component: HistorialMedicoComponent },
      { path: 'perfil', component: PerfilPacienteComponent },
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
      {
        path: 'citas',
        loadComponent: () =>
          import('./panel-admin/citas/citas-list.component').then((m) => m.CitasListComponent),
      },
      {
        path: 'medicamentos',
        loadComponent: () =>
          import('./panel-admin/medicamentos/medicamentos-list.component').then(
            (m) => m.MedicamentosListComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./panel-admin/usuarios/usuarios-list.component').then(
            (m) => m.UsuariosListComponent,
          ),
      },
      {
        path: 'historiales',
        loadComponent: () =>
          import('./panel-admin/historiales/historiales-list.component').then(
            (m) => m.HistorialesListComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./panel-admin/perfil/perfil.component').then((m) => m.PerfilAdminComponent),
      },
    ],
  },
  {
    path: 'panel-doctor',
    component: PanelDoctorComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'agenda', component: DoctorAgendaDiariaComponent },
      { path: 'atender', component: AtenderComponent },
      { path: 'fichas', component: DoctorFichasComponent },
      { path: 'recetas', component: DoctorRecetasComponent },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./panel-admin/perfil/perfil.component').then((m) => m.PerfilAdminComponent),
      },
    ],
  },
];
