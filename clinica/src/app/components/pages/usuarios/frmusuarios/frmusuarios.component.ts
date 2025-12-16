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
guardarUsuario() {
throw new Error('Method not implemented.');
}

    frmUsuario: FormGroup;
    eventoUpdate: boolean = false;
    codigo: number | null = null;
    codigo_medico: number | null = null;
    estado: boolean = true;
    isMedicoSelected = false;

    listaRoles: InRoles[] = [];

  
    @ViewChild('datepickerElement') datepickerElement!: ElementRef;
listaMedicoSinUsuario: any;
  
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
        txtNombreUsuario: ['', Validators.required],
        txtCorreoUsuario: ['', [Validators.required, Validators.email]],
        txtContrasenia: ['', Validators.required],
        cbxMedicos: ['', Validators.required],
        cbxRoles: ['', Validators.required]
      });
    }
    ngOnInit(): void {
      // this.listarRoles();

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

    // listarMedicos(): void {
    //   this.medicoServ.LMedicoSinUsuario().subscribe({
    //     next: (res) => {
    //       this.listaMedicoSinUsuario = res;
  
    //       console.log(res);
    //     },
    //     error: (err) => {
    //       alert('NO EXISTEN REGISTROS');
    //     },
    //   });
    // }

    // listarRoles(): void {
    //   this.rolServ.LRoles().subscribe({
    //     next: (res) => {
    //       this.listaRoles = res;
    //       console.log(res);
    //     },
    //     error: (err) => {
    //       alert('NO EXISTEN REGISTROS');
    //     },
    //   });
    // }

    onRoleChange(event: any): void {
      const selectedRoleId = parseInt(event.target.value, 10); 
      console.log('ID del rol seleccionado:', selectedRoleId);
  
      this.rolServ.LRolesId(selectedRoleId).subscribe({
        next: (selectedRole) => {
          if (selectedRole) {
            console.log('Rol seleccionado:', selectedRole.nombre, selectedRole.codigo);
      
            this.isMedicoSelected = selectedRole.nombre.toLowerCase() === 'medico';
            
            // Actualizar validaciones dinámicamente
            const medicoControl = this.frmUsuario.get('cbxMedicos');
            if (this.isMedicoSelected) {
              medicoControl?.setValidators([Validators.required]);
              medicoControl?.updateValueAndValidity();
            } else {
              medicoControl?.clearValidators();
              medicoControl?.setValue('');
              medicoControl?.updateValueAndValidity();
            }
          } else {
            this.isMedicoSelected = false; 
          }
        },
        error: (err) => {
          console.error('Error al obtener el rol:', err);
          this.isMedicoSelected = false; 
        }
      });
    }
      

  
  
    cargarUsuario(id: number): void {
      this.usuarioServ.LUsuariosId(id).subscribe({
        next: (usuario) => {
          console.log(usuario);
  
          this.frmUsuario.patchValue({
            txtNombreUsuario: usuario.user_username,
            txtContrasenia: usuario.user_contrasenia,
            // cbxRoles: usuario.codigo_rol,
            txtCorreoUsuario: usuario.user_correo,

          });
        },
        error: (err) => {
          console.log('Error al cargar medico:', err);
          alert('No se pudo cargar la información del medico');
        },
      });
    }
  
// guardarUsuario(): void {
//   this.marcarCamposComoTocados();

//   if (this.frmUsuario.invalid) {
//     const camposConError: string[] = [];

//     if (this.frmUsuario.get('txtNombreUsuario')?.invalid) {
//       camposConError.push('Nombre de Usuario');
//     }

//     if (this.frmUsuario.get('txtCorreoUsuario')?.invalid) {
//       camposConError.push('Correo de Usuario');
//     }

//     if (this.frmUsuario.get('txtContrasenia')?.invalid) {
//       camposConError.push('Contraseña');
//     }

//     if (this.frmUsuario.get('cbxRoles')?.invalid) {
//       camposConError.push('Rol del Sistema');
//     }

//     if (this.isMedicoSelected && this.frmUsuario.get('cbxMedicos')?.invalid) {
//       camposConError.push('Médico Asignado');
//     }

//     Swal.fire({
//       title: 'Campos Requeridos',
//       text: `Ingrese correctamente los siguientes campos: ${camposConError.join(', ')}`,
//       icon: 'warning',
//       confirmButtonColor: '#3085d6',
//       confirmButtonText: 'Entendido'
//     });

//     return;
//   }

//   const usuario: InUsuario = {
//     nombre_usuario: this.frmUsuario.value.txtNombreUsuario,
//     contrasenia: this.frmUsuario.value.txtContrasenia,
//     codigo_rol: this.frmUsuario.value.cbxRoles,
//     email: this.frmUsuario.value.txtCorreoUsuario,
//     codigo: this.eventoUpdate ? String(this.codigo) : '',
//   };

//   const codigoMedico = this.frmUsuario.value.cbxMedicos;

//   if (this.eventoUpdate) {
//     this.usuarioServ.ActualizarUsuario(usuario).subscribe({
//       next: () => {
//         Swal.fire({
//           title: 'Usuario actualizado',
//           text: 'Los datos del usuario fueron actualizados con éxito.',
//           icon: 'success',
//           confirmButtonText: 'Aceptar',
//         }).then(() => {
//           this.router.navigate(['home/listausuarios']);
//         });
//       },
//       error: (err) => {
//         console.error('Error al actualizar usuario:', err);
//         Swal.fire('Error', 'Hubo un problema al actualizar el usuario.', 'error');
//       }
//     });
//   } else {
//     this.usuarioServ.CrearUsuario(usuario).subscribe({
//       next: (res: any) => {
//         const nuevoIdUsuario = res.codigo_usuario;

//         if (this.isMedicoSelected && codigoMedico) {
//           this.medicoServ.AsignarUsuario(codigoMedico, nuevoIdUsuario).subscribe({
//             next: () => {
//               Swal.fire({
//                 title: 'Usuario registrado',
//                 text: 'El usuario fue registrado y asignado al médico con éxito.',
//                 icon: 'success',
//                 confirmButtonText: 'Aceptar',
//               }).then(() => {
//                 this.router.navigate(['home/listausuarios']);
//               });
//             },
//             error: (err) => {
//               console.error('Error al asignar usuario al médico:', err);
//               Swal.fire('Error', 'Hubo un problema al asignar el usuario al médico.', 'error');
//             }
//           });
//         } else {
//           Swal.fire({
//             title: 'Usuario registrado',
//             text: 'El usuario fue registrado con éxito.',
//             icon: 'success',
//             confirmButtonText: 'Aceptar',
//           }).then(() => {
//             this.router.navigate(['home/listausuarios']);
//           });
//         }
//       },
//       error: (err) => {
//         console.error('Error al crear usuario:', err);
//         Swal.fire('Error', 'Hubo un problema al registrar el usuario.', 'error');
//       }
//     });
//   }
// }

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
