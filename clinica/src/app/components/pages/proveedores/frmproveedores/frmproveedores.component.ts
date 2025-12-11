import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

// Asegúrate de que las rutas de importación sean correctas
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { ProveedorService } from '../../../../servicios/proveedores.service';
import { InProveedor } from '../../../../modelos/modelProveedor/InProveedor';

@Component({
  selector: 'app-frmproveedores',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
  templateUrl: './frmproveedores.component.html', // Asegúrate que coincida con tu archivo html
  styleUrl: './frmproveedores.component.css',
})
export class frmProveedoresComponent implements OnInit {
  frmProveedor: FormGroup;
  eventoUpdate: boolean = false;
  idEditar: string = ''; // El ID ahora es el RUC (string)
  rucEditar: string = ''; // El ID ahora es el RUC (string)

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private proveedorServ: ProveedorService,
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmProveedor = this.formBuilder.group({
      txtRuc: [
        '',
        [
          Validators.required, 
          Validators.minLength(13), 
          Validators.maxLength(13), 
          Validators.pattern('^[0-9]*$') // Solo números
        ],
        [this.rucExistsValidator()]
      ],
      txtNombre: ['', Validators.required], // Razón Social / Nombre
      txtTelefono: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      txtCorreo: ['', [Validators.email]], // Puede ser opcional, agrega Validators.required si es obligatorio
      txtDireccion: ['', Validators.required],
      txtDescripcion: [''] // Campo opcional
    });
  }

rucExistsValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const ruc = control.value;

    // Si estamos editando y el ruc NO se puede cambiar
    if (this.eventoUpdate && ruc === this.rucEditar) {
      return of(null);
    }

    return this.verificarRucExistente(ruc);
  };
}


  // Método auxiliar para verificar si el RUC existe
  private verificarRucExistente(ruc: string): Observable<ValidationErrors | null> {
  return timer(400).pipe(
    switchMap(() =>
      this.proveedorServ.LproveedorRucEstado(ruc, '1').pipe(
        map(res => {
          // Verifica correctamente arrays o objetos
          const existe = Array.isArray(res)
            ? res.length > 0
            : !!res;

          return existe ? { rucExists: true } : null;
        }),
        catchError(() => of(null))
      )
    )
  );
}

  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id'); // El parámetro en la URL debe ser el RUC
      const ruc = parametros.get('ruc') ; // El parámetro en la URL debe ser el RUC
      if (id && ruc) {
        this.eventoUpdate = true;
        this.idEditar = id;
        this.rucEditar = ruc;
        this.cargarProveedor(this.idEditar);
        // Deshabilitar el campo RUC en edición si es clave primaria y no se debe cambiar
        this.frmProveedor.get('txtRuc')?.disable(); 
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarProveedor(id: string): void {
    this.proveedorServ.ObtenerProveedor(id).subscribe({
      next: (proveedor) => {
        // Mapeamos los datos de la BD al formulario
        this.frmProveedor.patchValue({
          txtRuc: proveedor.prove_ruc,
          txtNombre: proveedor.prove_nombre,
          txtTelefono: proveedor.prove_telefono,
          txtDireccion: proveedor.prove_direccion,
          txtCorreo: proveedor.prove_correo || '', // Si agregaste este campo al modelo
          txtDescripcion: proveedor.prove_descripcion || ''
        });
      },
      error: (err) => {
        console.log('Error al cargar proveedor:', err);
        this.alertaServ.error(
          'No se pudo cargar la información del proveedor',
          'Comuníquese con su administrador de TI'
        );
        this.router.navigate(['home/listarproveedores']);
      },
    });
  }

  guardarProveedor(): void {
   this.marcarCamposComoTocados();

  this.frmProveedor.updateValueAndValidity({ onlySelf: false, emitEvent: true });

  if (this.frmProveedor.pending) {
    setTimeout(() => this.guardarProveedor(), 200);
    return;
  }

  if (this.frmProveedor.invalid) {
    if (this.frmProveedor.get('txtRuc')?.errors?.['rucExists']) {
      Swal.fire({
        title: 'RUC Duplicado',
        text: 'El RUC ingresado ya está registrado.',
        icon: 'error'
      });
      return;
    }
  }

    if (this.frmProveedor.pending) {
      Swal.fire({
        title: 'Validación en Proceso',
        text: 'Por favor, espere mientras se verifica la información...',
        icon: 'info',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (this.frmProveedor.invalid) {
      const camposConError = [];
      
      if (this.frmProveedor.get('txtRuc')?.invalid) {
        if (this.frmProveedor.get('txtRuc')?.errors?.['rucExists']) {
          Swal.fire({
            title: 'RUC Duplicado',
            text: 'El RUC ingresado ya está registrado en el sistema.',
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Entendido'
          });
          return;
        }
        camposConError.push('RUC (13 dígitos)');
      }
      if (this.frmProveedor.get('txtNombre')?.invalid) camposConError.push('Razón Social / Nombre');
      if (this.frmProveedor.get('txtTelefono')?.invalid) camposConError.push('Teléfono');
      if (this.frmProveedor.get('txtDireccion')?.invalid) camposConError.push('Dirección');
      if (this.frmProveedor.get('txtCorreo')?.invalid) camposConError.push('Correo Electrónico');

      if (camposConError.length > 0) {
        Swal.fire({
          title: 'Campos Requeridos',
          text: 'Por favor verifique los siguientes campos: ' + camposConError.join(', '),
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
      }
      return;
    }

    // Construir el objeto a enviar (Si el campo RUC está deshabilitado, usar getRawValue)
    const formValues = this.frmProveedor.getRawValue();

    const proveedor: InProveedor = {
      prove_ruc: formValues.txtRuc,
      prove_nombre: formValues.txtNombre,
      prove_telefono: formValues.txtTelefono,
      prove_direccion: formValues.txtDireccion,
      prove_correo: formValues.txtCorreo, // Asegúrate que esté en tu interfaz InProveedor
      prove_descripcion: formValues.txtDescripcion
    };

    if (this.eventoUpdate) {
      // En update, usualmente el ID (RUC) no cambia, se envía para buscar y actualizar
      proveedor.prove_id = parseInt( this.idEditar);
      this.proveedorServ.ActualizarProveedor(proveedor).subscribe({
        next: (res) => {
          this.alertaServ.success('Proveedor actualizado con éxito.', '');
          this.router.navigate(['home/dashboard']);
        },
        error: (err) => {
          console.log('Error al actualizar:', err);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar el proveedor.'
          );
        },
      });
    } else {
      this.proveedorServ.CrearProveedor(proveedor).subscribe({
        next: (res) => {
          this.alertaServ.success('Proveedor registrado con éxito.', '');
          this.router.navigate(['home/listarproveedores']);
        },
        error: (err) => {
          console.log('Error al crear:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar el proveedor.'
          );
        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmProveedor.controls).forEach((campo) => {
      const control = this.frmProveedor.get(campo);
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
        this.router.navigate(['/home/listarproveedores']);
      }
    });
  }
}