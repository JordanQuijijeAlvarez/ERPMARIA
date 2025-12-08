import { Routes } from '@angular/router';
import { ComponenteloginComponent } from './components/pages/login/componentelogin/componentelogin.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { ListapacientesComponent } from './components/pages/pacientes/listapacientes/listapacientes.component';
import { FrmpacientesComponent } from './components/pages/pacientes/frmpacientes/frmpacientes.component';
import { ListamedicosComponent } from './components/pages/medicos/listamedicos/listamedicos.component';
import { FrmmedicosComponent } from './components/pages/medicos/frmmedicos/frmmedicos.component';
import { FrmcitasComponent } from './components/pages/citas/frmcitas/frmcitas.component';
import { FrmconsultasComponent } from './components/pages/consultas/frmconsultas/frmconsultas.component';
import { ListaconsultoriosComponent } from './components/pages/consultorios/listaconsultorios/listaconsultorios.component';
import { FrmconsultoriosComponent } from './components/pages/consultorios/frmconsultorio/frmconsultorios.component';
import { listaEspecialidadesComponent } from './components/pages/especialidades/listaespecialidades/listaespecialidades.component';
import { FrmespecialidadsComponent } from './components/pages/especialidades/frmespecialidades/frmespecialidades.component';
import { listaHorariosComponent } from './components/pages/horarios/listahorarios/listahorarios.component';
import { FrmhorariosComponent } from './components/pages/horarios/frmhorarios/frmhorarios.component';
import { PanelprincipalComponent } from './components/ui/panelprincipal/panelprincipal.component';
import { listaConsultasComponent } from './components/pages/consultas/listaconsultas/listaconsultas.component';
import { listaHistorialComponent } from './components/pages/historial/listaHistorial/listahistorial.component';
import { ListausuariosComponent } from './components/pages/usuarios/listausuarios/listausuarios.component';
import { FrmusuariosComponent } from './components/pages/usuarios/frmusuarios/frmusuarios.component';

import { AuthService } from './servicios/authservicio.service';
import { RoleGuard } from './guards/role.guard';
import { reporteHistorialComponent } from './components/pages/reportes/historialClinico/listahorarios/reporteHistorial.component';
import { pagina404Component } from './components/ui/404/pagina404.component';
import { RecuperarContraseniaComponent } from './components/pages/login/recuperarcontrasena/recuperarcontrasena.component';
import { VerificacionOtpComponent } from './components/pages/verificacion-otp/verificacion-otp.component';
import { ListaclientesComponent } from './components/pages/clientes/listaclientes/listaclientes.component';
import { frmClientesComponent } from './components/pages/clientes/frmclientes/frmclientes.component';
import { ListaproductosComponent } from './components/pages/productos/listaproductos/listaproductos.component';
import { FrmproductoComponent } from './components/pages/productos/frmproductos/frmproductos.component';
import { FrmventasComponent } from './components/pages/consultas copy/frmventas/frmventas.component';
import { listaVentasComponent } from './components/pages/consultas copy/listaventas/listaventas.component';

export const routes: Routes = [
  { path: '', redirectTo:'home/dashboard', pathMatch:'full' },


  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  // { path: 'login', component: ComponenteloginComponent },
  // { path: 'verificacion-otp', component: VerificacionOtpComponent },

  // {
  //   path: 'login/recuperacion/:username',
  //   component: RecuperarContraseniaComponent,
  // },

  // en este apartado va el path para la pagina 404
  //

  {
    path: 'home',
    component: PanelprincipalComponent,
    //canActivate: [AuthService], // Protege todas las rutas dentro de 'home'
    children: [
      { path: 'dashboard', component: DashboardComponent },


      // Clientes (Ejemplo: solo rol "admin" puede crear/actualizar)
      {
        path: 'listarclientes',
        component: ListaclientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearCliente',
        component: frmClientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarCliente/:id',
        component: frmClientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Productos (Ejemplo: solo rol "admin" puede crear/actualizar)
      {
        path: 'listarproductos',
        component: ListaproductosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'creaproductos',
        component: FrmproductoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarProducto/:id',
        component: FrmproductoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },


      // VENTAS
      {
        path: 'crearVenta',
        component: FrmventasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
       {
        path: 'listaventas',
        component: listaVentasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Médicos
      {
        path: 'listamedicos',
        component: ListamedicosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearMedico',
        component: FrmmedicosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarMedico/:id',
        component: FrmmedicosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Citas (Ejemplo: solo rol "recepcionista" puede agendar citas)
      {
        path: 'frmcitas',
        component: FrmcitasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador', 'recepcionista'] },
      },

      // Consultas
      {
        path: 'listaconsultas',
        component: listaConsultasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador', 'medico'] },
      },
      {
        path: 'realizarConsulta',
        component: FrmconsultasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador', 'medico'] },
      },

      // Consultorios
      {
        path: 'listaconsultorios',
        component: ListaconsultoriosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearConsultorios',
        component: FrmconsultoriosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarConsultorios/:id',
        component: FrmconsultoriosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Especialidades
      {
        path: 'listaespecialidades',
        component: listaEspecialidadesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearEspecialidades',
        component: FrmespecialidadsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarEspecialidades/:id',
        component: FrmespecialidadsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Horarios
      {
        path: 'listahorarios',
        component: listaHorariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearHorarios',
        component: FrmhorariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarHorarios/:id',
        component: FrmhorariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      //Usuarios
      {
        path: 'listausuarios',
        component: ListausuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'crearUsuarios',
        component: FrmusuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },
      {
        path: 'actualizarUsuarios/:id',
        component: FrmusuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador'] },
      },

      // Historial Clínico (Ejemplo: solo rol "medico" puede ver el historial)
      {
        path: 'listahistorial',
        component: listaHistorialComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador', 'medico', 'recepcionista'] },
      },
      {
        path: 'historial/imprimir/:codigo',
        component: reporteHistorialComponent,
        canActivate: [RoleGuard],
        data: { roles: ['administrador', 'medico', 'recepcionista'] },
      },

      { path: '404', component: pagina404Component }//colocar al final en la parte de arriba 

    ],
  },

  { path: '**', component: pagina404Component },
];
