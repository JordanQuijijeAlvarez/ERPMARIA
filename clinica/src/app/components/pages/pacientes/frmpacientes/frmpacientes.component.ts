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
import { InPaciente } from '../../../../modelos/modelPacientes/InPacientes';
import { PacientesService } from '../../../../servicios/pacientes.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import Swal from 'sweetalert2';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-frmpacientes',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
  templateUrl: './frmpacientes.component.html',
  styleUrl: './frmpacientes.component.css',
})
export class FrmpacientesComponent {
  frmPaciente: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number | null = null;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private pacienteServ: PacientesService,
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmPaciente = this.formBuilder.group({
      txtCedula: [
        '', 
        [Validators.required, ValidatorsComponent.numericTenDigits],
        [this.cedulaExistsValidator()]
      ],
      txtNombres: ['', Validators.required],
      txtApellidos: ['', Validators.required],
      txtFechNac: ['', Validators.required],
      txtNumTelefono: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtCorreo: ['', [Validators.required, Validators.email]],
      txtDireccion: ['', Validators.required],
      txtDetalles: [''],
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

      // Si estamos en modo actualización y la cédula es la misma del paciente actual, permitirla
      if (this.eventoUpdate && this.codigo) {
        return this.pacienteServ.LPacientesId(this.codigo).pipe(
          switchMap(pacienteActual => {
            if (pacienteActual.cedula === cedula) {
              return of(null); // La cédula actual del paciente es válida
            }
            // Si es diferente, verificar si existe en otros pacientes
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
        this.pacienteServ.LPacientesCedulaEstado(cedula, true).pipe(
          map(paciente => {
            // Si encuentra un paciente con esa cédula, retorna error
            return paciente ? { cedulaExists: { message: 'Esta cédula ya está registrada' } } : null;
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
        this.cargarPaciente(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarPaciente(id: number): void {
    this.pacienteServ.LPacientesId(id).subscribe({
      next: (paciente) => {
        const fechaFormateada = paciente.fecha_nacimiento
          ? paciente.fecha_nacimiento.split('T')[0]
          : null;

        this.frmPaciente.patchValue({
          txtCedula: paciente.cedula,
          txtNombres: paciente.nombre,
          txtApellidos: paciente.apellido,
          txtCorreo: paciente.email,
          txtNumTelefono: paciente.telefono,
          txtDireccion: paciente.direccion,
          txtDetalles: paciente.descripcion,
          txtFechNac: fechaFormateada,
        });
      },
      error: (err) => {
        console.log('Error al cargar paciente:', err);
        this.alertaServ.error(
          'No se pudo cargar la información del paciente',
          'Comuniquese con su administrador de TI'
        );
      },
    });
  }

  guardarPaciente(): void {
    // Primero marcar todos los campos como tocados para mostrar errores
    this.marcarCamposComoTocados();

    // Verificar si hay validaciones pendientes
    if (this.frmPaciente.pending) {
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
    if (this.frmPaciente.invalid) {
      // Verificar qué campos específicos tienen errores
      const camposConError = [];
      
      if (this.frmPaciente.get('txtCedula')?.invalid) {
        if (this.frmPaciente.get('txtCedula')?.errors?.['cedulaExists']) {
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
      if (this.frmPaciente.get('txtNombres')?.invalid) {
        camposConError.push('Nombres');
      }
      if (this.frmPaciente.get('txtApellidos')?.invalid) {
        camposConError.push('Apellidos');
      }
      if (this.frmPaciente.get('txtFechNac')?.invalid) {
        camposConError.push('Fecha de Nacimiento');
      }
      if (this.frmPaciente.get('txtNumTelefono')?.invalid) {
        camposConError.push('Número de Teléfono');
      }
      if (this.frmPaciente.get('txtCorreo')?.invalid) {
        camposConError.push('Correo Electrónico');
      }
      if (this.frmPaciente.get('txtDireccion')?.invalid) {
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

    const paciente: InPaciente = {
      cedula: this.frmPaciente.value.txtCedula,
      nombre: this.frmPaciente.value.txtNombres,
      apellido: this.frmPaciente.value.txtApellidos,
      email: this.frmPaciente.value.txtCorreo,
      telefono: this.frmPaciente.value.txtNumTelefono,
      direccion: this.frmPaciente.value.txtDireccion,
      descripcion: this.frmPaciente.value.txtDetalles,
      fecha_nacimiento: this.frmPaciente.value.txtFechNac,

      codigo: '',
    };

    if (this.eventoUpdate) {
      paciente.codigo = '' + this.codigo;
      this.pacienteServ.ActualizarPaciente(paciente).subscribe({
        next: (res) => {
          this.alertaServ.success('Paciente actualizado con éxito.', '');
          this.router.navigate(['home/listapacientes']);
        },
        error: (err) => {
          console.log('Error al actualizar paciente:', err.error.msg);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar el paciente: revise que la información sea correcta'
          );
        },
      });
    } else {
      this.pacienteServ.CrearPaciente(paciente).subscribe({
        next: (res) => {
          this.alertaServ.success('Paciente registrado con éxito.', '');
          this.router.navigate(['home/listapacientes']);
        },
        error: (err) => {
          console.log('Error al crear paciente:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar el paciente: revise que la información sea correcta'
          );
        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmPaciente.controls).forEach((campo) => {
      const control = this.frmPaciente.get(campo);
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
        this.router.navigate(['/home/listapacientes']);
      }
    });
  }

}
