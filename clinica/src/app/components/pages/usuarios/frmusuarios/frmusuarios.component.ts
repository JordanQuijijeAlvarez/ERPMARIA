import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../../../servicios/usuarios.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { InUsuario } from '../../../../modelos/modeloUsuarios/InUsuarios';
import { RolesService } from '../../../../servicios/roles.service';
import { InRoles } from '../../../../modelos/modeloRoles/InRoles';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-frmusuarios',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmusuarios.component.html',
    styleUrl: './frmusuarios.component.css'
})
export class FrmusuariosComponent {

    frmUsuario: FormGroup;
    eventoUpdate: boolean = false;
    codigo: number | null = null;
    estado: boolean = true;
    mostrarContrasenia: boolean = false;

    listaRoles: InRoles[] = [];

  
    @ViewChild('datepickerElement') datepickerElement!: ElementRef;
  
    constructor(
      private formBuilder: FormBuilder,
      private http: HttpClient,
      private router: Router,
      private usuarioServ: UsuariosService,
      private rolServ: RolesService,
      private route: ActivatedRoute,
      private alertaServ: AlertService
    ) {
      this.frmUsuario = this.formBuilder.group({
        txtNombres: ['', Validators.required],
        txtApellidos: ['', Validators.required],
        txtNombreUsuario: ['', Validators.required],
        txtCorreoUsuario: ['', [Validators.required, Validators.email]],
        txtContrasenia: ['', Validators.required],
        cbxRoles: ['', Validators.required]
      });
    }
    ngOnInit(): void {
      this.listarRoles();

      this.route.paramMap.subscribe((parametros) => {
        const id = parametros.get('id');
        if (id) {
          this.eventoUpdate = true;
          this.codigo = parseInt(id);
  
          this.cargarUsuario(this.codigo);
        } else {
          this.eventoUpdate = false;
        }
      });
    }

    listarRoles(): void {
      this.rolServ.LRoles().subscribe({
        next: (res) => {
          this.listaRoles = res;
          console.log('Roles cargados:', res);
        },
        error: (err) => {
          console.error('Error al cargar roles:', err);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los roles del sistema',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        },
      });
    }

    onRoleChange(event: any): void {
      const selectedRoleId = parseInt(event.target.value, 10); 
      console.log('ID del rol seleccionado:', selectedRoleId);
    }

    toggleMostrarContrasenia(): void {
      this.mostrarContrasenia = !this.mostrarContrasenia;
    }
      

  
  
    cargarUsuario(id: number): void {
      this.usuarioServ.LUsuariosId(id).subscribe({
        next: (usuario) => {
          console.log(usuario);
  
          this.frmUsuario.patchValue({
            txtNombres: usuario.user_nombres,
            txtApellidos: usuario.user_apellidos,
            txtNombreUsuario: usuario.user_username,
            txtContrasenia: '', // Dejar vacío por seguridad (contraseña encriptada)
            txtCorreoUsuario: usuario.user_correo,
          });

          // Hacer opcional la contraseña al editar (solo actualizar si se ingresa una nueva)
          this.frmUsuario.get('txtContrasenia')?.clearValidators();
          this.frmUsuario.get('txtContrasenia')?.updateValueAndValidity();
        },
        error: (err) => {
          console.log('Error al cargar usuario:', err);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información del usuario',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        },
      });
    }
  
  guardarUsuario(): void {
    this.marcarCamposComoTocados();

    if (this.frmUsuario.invalid) {
      const camposConError: string[] = [];

      if (this.frmUsuario.get('txtNombres')?.invalid) {
        camposConError.push('Nombres');
      }

      if (this.frmUsuario.get('txtApellidos')?.invalid) {
        camposConError.push('Apellidos');
      }

      if (this.frmUsuario.get('txtNombreUsuario')?.invalid) {
        camposConError.push('Nombre de Usuario');
      }

      if (this.frmUsuario.get('txtCorreoUsuario')?.invalid) {
        camposConError.push('Correo de Usuario');
      }

      if (this.frmUsuario.get('txtContrasenia')?.invalid) {
        camposConError.push('Contraseña');
      }

      if (this.frmUsuario.get('cbxRoles')?.invalid) {
        camposConError.push('Rol del Sistema');
      }

      Swal.fire({
        title: 'Campos Requeridos',
        text: `Ingrese correctamente los siguientes campos: ${camposConError.join(', ')}`,
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (this.eventoUpdate) {
      // Validar si se ingresó una nueva contraseña
      const nuevaContrasenia = this.frmUsuario.value.txtContrasenia;
      
      if (!nuevaContrasenia || nuevaContrasenia.trim() === '') {
        Swal.fire({
          title: 'Contraseña requerida',
          text: 'Debe ingresar la nueva contraseña para actualizar el usuario',
          icon: 'warning',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      const usuarioActualizar = {
        user_id: this.codigo,
        user_nombres: this.frmUsuario.value.txtNombres,
        user_apellidos: this.frmUsuario.value.txtApellidos,
        user_username: this.frmUsuario.value.txtNombreUsuario,
        user_contrasenia: nuevaContrasenia,
        user_correo: this.frmUsuario.value.txtCorreoUsuario
      };

      this.usuarioServ.ActualizarUsuario(usuarioActualizar as any).subscribe({
        next: () => {
          Swal.fire({
            title: 'Usuario actualizado',
            text: 'Los datos del usuario fueron actualizados con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.router.navigate(['home/listausuarios']);
          });
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Hubo un problema al actualizar el usuario.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    } else {
      const usuarioNuevo = {
        user_nombres: this.frmUsuario.value.txtNombres,
        user_apellidos: this.frmUsuario.value.txtApellidos,
        user_username: this.frmUsuario.value.txtNombreUsuario,
        user_contrasenia: this.frmUsuario.value.txtContrasenia,
        user_correo: this.frmUsuario.value.txtCorreoUsuario,
        rol_id: this.frmUsuario.value.cbxRoles
      };

      this.usuarioServ.CrearUsuario(usuarioNuevo as any).subscribe({
        next: () => {
          Swal.fire({
            title: 'Usuario registrado',
            text: 'El usuario fue registrado con éxito.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            this.router.navigate(['home/listausuarios']);
          });
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          Swal.fire({
            title: 'Error',
            text: err.error?.message || 'Hubo un problema al registrar el usuario.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
    }
  }

    marcarCamposComoTocados(): void {
      Object.keys(this.frmUsuario.controls).forEach((campo) => {
        const control = this.frmUsuario.get(campo);
        if (control) {
          control.markAsTouched();
        }
      });
    }

      salirSinGuardar(): void {
          Swal.fire({
            title: '¿Está seguro que desea salir?',
            text: 'Los cambios no guardados se perderán.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/home/listausuarios']);
            }
          });
        }

}
