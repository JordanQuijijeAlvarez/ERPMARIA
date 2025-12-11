import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControlName,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
//import { ConsultoriosService } from '../../../../servicios/subcategorias.service';
import { InConsultorios } from '../../../../modelos/modelConsultorios/InConsultorios';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-frmconsultorios',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmconsultorios.component.html',
    styleUrl: './frmconsultorios.component.css'
})
export class FrmconsultoriosComponent {
  frmConsultorio: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number | null = null;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
   // private consultorioServ: ConsultoriosService,
        private alertaServ: AlertService,
    
    private route: ActivatedRoute
  ) {
    this.frmConsultorio = this.formBuilder.group({
      txtNombre: ['', Validators.required],
      txtDescripcion: [''],
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');

      if (id) {
        this.eventoUpdate = true;
        this.codigo = parseInt(id);

        this.cargarConsultorio(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarConsultorio(id: number): void {
   /* this.consultorioServ.LConsultoriosId(id).subscribe({
      next: (consultorio) => {
         
        this.frmConsultorio.patchValue({
         
          txtNombre: consultorio.nombre,
          txtDescripcion: consultorio.descripcion
        
        });
      },
      error: (err) => {
        console.log('Error al cargar consultorio:', err);
        this.alertaServ.error(
          'No se pudo cargar la información del consultorio',
          'Comuniquese con su administrador de TI'
        );      },
    });*/
  }
  

  guardarconsultorio(): void {
    // Primero marcar todos los campos como tocados para mostrar errores
    this.marcarCamposComoTocados();

    // Verificar si el formulario tiene errores (campos obligatorios)
    if (this.frmConsultorio.invalid) {
      // Verificar qué campos específicos tienen errores
      const camposConError = [];
      
      if (this.frmConsultorio.get('txtNombre')?.invalid) {
        camposConError.push('Nombre del Consultorio');
      }

      if (camposConError.length > 0) {
        Swal.fire({
          title: 'Campos Requeridos',
          text: 'Ingrese correctamente los valores. Complete los siguientes campos: ' + camposConError.join(', '),
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
      } else {
        this.alertaServ.info(
          '',
          'Por favor, complete todos los campos obligatorios *'
        );
      }
      return;
    }

    const consultorio: InConsultorios = {
     
      nombre: this.frmConsultorio.value.txtNombre,   
      descripcion: this.frmConsultorio.value.txtDescripcion,
      codigo: '',
    };


    if (this.eventoUpdate) {
      /*consultorio.codigo = '' + this.codigo;
      this.consultorioServ.ActualizarConsultorio(consultorio).subscribe({
        next: (res) => {
          this.alertaServ.success('Consultorio actualizado con éxito.', '');
          this.router.navigate(['home/listaconsultorios']);
        },
        error: (err) => {
          console.log('Error al actualizar consultorio:', err.error.msg);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar el consultorio: revise que la información sea correcta'
          );        },
      });
    } else {
      this.consultorioServ.CrearConsultorio(consultorio).subscribe({
        next: (res) => {
          this.alertaServ.success('Consultorio registrado con éxito.', '');
          this.router.navigate(['home/listaconsultorios']);
        },
        error: (err) => {
          console.log('Error al crear consultorio:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar el consultorio: revise que la información sea correcta'
          );        },
      });*/
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmConsultorio.controls).forEach((campo) => {
      const control = this.frmConsultorio.get(campo);
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
        this.router.navigate(['/home/listaconsultorios']);
      }
    });
  }
}
