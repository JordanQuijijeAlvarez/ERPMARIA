import { Routes } from '@angular/router';
import { ComponenteloginComponent } from './components/pages/login/componentelogin/componentelogin.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { listaEspecialidadesComponent } from './components/pages/especialidades/listaespecialidades/listaespecialidades.component';
import { FrmespecialidadsComponent } from './components/pages/especialidades/frmespecialidades/frmespecialidades.component';
import { listaHorariosComponent } from './components/pages/horarios/listahorarios/listahorarios.component';
import { FrmhorariosComponent } from './components/pages/horarios/frmhorarios/frmhorarios.component';
import { PanelprincipalComponent } from './components/ui/panelprincipal/panelprincipal.component';
import { ListausuariosComponent } from './components/pages/usuarios/listausuarios/listausuarios.component';
import { FrmusuariosComponent } from './components/pages/usuarios/frmusuarios/frmusuarios.component';

import { AuthService } from './servicios/authservicio.service';
import { RoleGuard } from './guards/role.guard';
import { reporteHistorialComponent } from './components/pages/reportes/historialClinico/listahorarios/reporteHistorial.component';
import { pagina404Component } from './components/ui/404/pagina404.component';
import { RecuperarContraseniaComponent } from './components/pages/login/recuperarcontrasena/recuperarcontrasena.component';
import { VerificacionOtpComponent } from './components/pages/verificacion-otp/verificacion-otp.component';
import { Setup2faComponent } from './components/pages/setup-2fa/setup-2fa.component';
import { ListaclientesComponent } from './components/pages/clientes/listaclientes/listaclientes.component';
import { frmClientesComponent } from './components/pages/clientes/frmclientes/frmclientes.component';
import { ListaproductosComponent } from './components/pages/productos/listaproductos/listaproductos.component';
import { FrmproductoComponent } from './components/pages/productos/frmproductos/frmproductos.component';
import { FrmventasComponent } from './components/pages/ventas/frmventas/frmventas.component';
import { listaVentasComponent } from './components/pages/ventas/listaventas/listaventas.component';
import { ListaproveedoresComponent } from './components/pages/proveedores/listaproveedores/listaproveedores.component';
import { frmProveedoresComponent } from './components/pages/proveedores/frmproveedores/frmproveedores.component';
import { FrmCategoriasComponent } from './components/pages/categorias/frmcategorias/frmcategorias.component';
import { ListaCategoriasComponent } from './components/pages/categorias/listacategorias/listacategorias.component';
import { ListaComprasComponent } from './components/pages/ventas copy/listacompras/listacompras.component';
import { FrmComprasComponent } from './components/pages/ventas copy/frmcompras/frmcompras.component';
import { ListahistorialComponent } from './components/pages/historial/listaproveedores/listahistorial.component';
import { PerfilComponent } from './components/pages/perfil/perfil.component';

export const routes: Routes = [



  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: ComponenteloginComponent },
 // { path: 'verificacion-otp', component: VerificacionOtpComponent },

  {
    path: 'login/recuperacion/:username',
    component: RecuperarContraseniaComponent,
  },

  //en este apartado va el path para la pagina 404
  

  {
    path: 'home',
    component: PanelprincipalComponent,
    canActivate: [AuthService], // Protege todas las rutas dentro de 'home'
    children: [
      { path: 'dashboard', component: DashboardComponent ,canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] }

      },
      { path: 'setup-2fa', component: Setup2faComponent },

      { path: 'perfil', component: PerfilComponent },

      // Clientes (Ejemplo: solo rol "admin" puede crear/actualizar)
      {
        path: 'listarClientes',
        component: ListaclientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'crearCliente',
        component: frmClientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'actualizarCliente/:id',
        component: frmClientesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },

      // Productos (Ejemplo: solo rol "admin" puede crear/actualizar)
      {
        path: 'listarProductos',
        component: ListaproductosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'creaproductos',
        component: FrmproductoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'actualizarProducto/:id',
        component: FrmproductoComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },


      // VENTAS
      {
        path: 'crearVenta',
        component: FrmventasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
       {
        path: 'listarVentas',
        component: listaVentasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
 {
        path: 'actualizarVenta/:id',
        component: FrmventasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      
      // COMPRAS
      {
        path: 'crearCompra',
        component: FrmComprasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
       {
        path: 'listarCompras',
        component: ListaComprasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
 {
        path: 'actualizarCompra/:id',
        component: FrmComprasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },


            // PROVEEDOR
      {
        path: 'crearProveedor',
        component: frmProveedoresComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
       {
        path: 'listarProveedores',
        component: ListaproveedoresComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
 {
        path: 'actualizarProveedor/:id',
        component: frmProveedoresComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
     
             // CATEGORIAS
      {
        path: 'crearCategoria',
        component: FrmCategoriasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
       {
        path: 'listarCategorias',
        component: ListaCategoriasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
 {
        path: 'actualizarCategoria/:id',
        component: FrmCategoriasComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },

         
             // AUDITORIA
      {
        path: 'listarHistorial',
        component: ListahistorialComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },

      // // Especialidades
      // {
      //   path: 'listarespecialidades',
      //   component: listaEspecialidadesComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },
      // {
      //   path: 'crearEspecialidades',
      //   component: FrmespecialidadsComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },
      // {
      //   path: 'actualizarEspecialidades/:id',
      //   component: FrmespecialidadsComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },

      // Horarios
      // {
      //   path: 'listarhorarios',
      //   component: listaHorariosComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },
      // {
      //   path: 'crearHorarios',
      //   component: FrmhorariosComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },
      // {
      //   path: 'actualizarHorarios/:id',
      //   component: FrmhorariosComponent,
      //   canActivate: [RoleGuard],
      //   data: { roles: ['ADMINISTRADOR'] },
      // },

      //Usuarios
      {
        path: 'listarUsuarios',
        component: ListausuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'crearUsuario',
        component: FrmusuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },
      {
        path: 'actualizarUsuario/:id',
        component: FrmusuariosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR'] },
      },

      
      {
        path: 'historial/imprimir/:codigo',
        component: reporteHistorialComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMINISTRADOR', 'medico', 'recepcionista'] },
      },

      { path: '404', component: pagina404Component }//colocar al final en la parte de arriba 

    ],
  }

  //{ path: '**', component: pagina404Component },
];
