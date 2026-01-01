import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlEvent,
  FormBuilder,
  FormControlName,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import Swal from 'sweetalert2';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, debounceTime } from 'rxjs/operators';
import { clienteService } from '../../../../servicios/clientes.service';

@Component({
  selector: 'app-frmclientes',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
  templateUrl: './frmclientes.component.html',
  styleUrl: './frmclientes.component.css',
})
export class frmClientesComponent {
  frmCliente: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number  = 0;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private clienteServ: clienteService,
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmCliente = this.formBuilder.group({
      txtCedula: [
        '', 
        [Validators.required, ValidatorsComponent.numericTenDigits],
        [this.cedulaExistsValidator()]
      ],
      txtNombres: ['', Validators.required],
      txtApellidos: ['', Validators.required],
      txtCorreo: ['', [Validators.required, Validators.email]],
      txtDireccion: ['', Validators.required]
      });
  }

  // Validador asíncrono para verificar si la cédula ya existe
  cedulaExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const cedula = control.value;
      
      // Si no hay valor, no validamos (esto lo maneja el validador required)
      if (!cedula || cedula.length < 10) {
        return of(null);
      }

      // Si estamos en modo actualización y la cédula es la misma del cliente actual, permitirla
      if (this.eventoUpdate && this.codigo) {
        return this.clienteServ.LclienteId(this.codigo).pipe(
          switchMap(clienteActual => {
            if (clienteActual.client_cedula === cedula) {
              return of(null); // La cédula actual del cliente es válida
            }
            // Si es diferente, verificar si existe en otros clientes
            return this.verificarCedulaExistente(cedula);
          }),
          catchError(() => of(null))
        );
      }

      // En modo creación, verificar directamente
      return this.verificarCedulaExistente(cedula);
    };
  }

  // Método auxiliar para verificar si la cédula existe
  private verificarCedulaExistente(cedula: string): Observable<ValidationErrors | null> {
    return timer(500).pipe( // Debounce de 500ms para evitar muchas peticiones
      switchMap(() => 
        this.clienteServ.LclienteCedulaEstado(cedula, '1').pipe(
          map(cliente => {
            // Si encuentra un cliente con esa cédula, retorna error
            return cliente ? { cedulaExists: { message: 'Esta cédula ya está registrada' } } : null;
          }),
          catchError(error => {
            // Si el error es 404 (no encontrado), está bien
            if (error.status === 404) {
              return of(null);
            }
            // Para otros errores, no validamos
            return of(null);
          })
        )
      )
    );
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      if (id) {
        this.eventoUpdate = true;
        this.codigo = parseInt(id);
        this.cargarcliente(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarcliente(id: number): void {
    this.clienteServ.LclienteId(id).subscribe({
      next: (cliente) => {
        this.frmCliente.patchValue({
          txtCedula: cliente.client_cedula,
          txtNombres: cliente.client_nombres,
          txtApellidos: cliente.client_apellidos,
          txtCorreo: cliente.client_correo,
          txtDireccion: cliente.client_direccion

        });
      },
      error: (err) => {
        console.log('Error al cargar cliente:', err);
        this.alertaServ.error(
          'No se pudo cargar la información del cliente',
          'Comuniquese con su administrador de TI'
        );
      },
    });
  }

  guardarcliente(): void {
    // Primero marcar todos los campos como tocados para mostrar errores
    this.marcarCamposComoTocados();

    // Verificar si hay validaciones pendientes
    if (this.frmCliente.pending) {
      Swal.fire({
        title: 'Validación en Proceso',
        text: 'Por favor, espere mientras se verifica la información...',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si el formulario tiene errores
    if (this.frmCliente.invalid) {
      // Verificar qué campos específicos tienen errores
      const camposConError = [];
      
      if (this.frmCliente.get('txtCedula')?.invalid) {
        if (this.frmCliente.get('txtCedula')?.errors?.['cedulaExists']) {
          Swal.fire({
            title: 'Cédula Duplicada',
            text: 'La cédula ingresada ya está registrada en el sistema. Por favor, verifique el número de cédula.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          return;
        }
        camposConError.push('Cédula');
      }
      if (this.frmCliente.get('txtNombres')?.invalid) {
        camposConError.push('Nombres');
      }
      if (this.frmCliente.get('txtApellidos')?.invalid) {
        camposConError.push('Apellidos');
      }
      if (this.frmCliente.get('txtFechNac')?.invalid) {
        camposConError.push('Fecha de Nacimiento');
      }
      if (this.frmCliente.get('txtNumTelefono')?.invalid) {
        camposConError.push('Número de Teléfono');
      }
      if (this.frmCliente.get('txtCorreo')?.invalid) {
        camposConError.push('Correo Electrónico');
      }
      if (this.frmCliente.get('txtDireccion')?.invalid) {
        camposConError.push('Dirección');
      }

      if (camposConError.length > 0) {
        Swal.fire({
          title: 'Campos Requeridos',
          text: 'Ingrese correctamente los valores. Complete los siguientes campos: ' + camposConError.join(', '),
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
      }
      return;
    }

    const cliente: InClientes = {
      client_cedula: this.frmCliente.value.txtCedula,
      client_nombres: this.frmCliente.value.txtNombres,
      client_apellidos: this.frmCliente.value.txtApellidos,
      client_correo: this.frmCliente.value.txtCorreo,
      client_direccion: this.frmCliente.value.txtDireccion,
      client_id: 0,
      user_id: parseInt(localStorage.getItem('user_id') ?? '1')
    };

    if (this.eventoUpdate) {
      cliente.client_id=this.codigo;
      this.clienteServ.Actualizarcliente(cliente).subscribe({
        next: (res) => {
          this.alertaServ.success('cliente actualizado con éxito.', '');
          this.router.navigate(['home/listarClientes']);
        },
        error: (err) => {
          console.log('Error al actualizar cliente:', err.error.msg);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar el cliente: revise que la información sea correcta'
          );
        },
      });
    } else {
      this.clienteServ.Crearcliente(cliente).subscribe({
        next: (res) => {
          this.alertaServ.success('cliente registrado con éxito.', '');
          this.router.navigate(['home/listarClientes']);
        },
        error: (err) => {
          console.log('Error al crear cliente:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar el cliente: revise que la información sea correcta'
          );
        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmCliente.controls).forEach((campo) => {
      const control = this.frmCliente.get(campo);
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
        this.router.navigate(['/home/listarClientes']);
      }
    });
  }

}
