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
import { especialidadesService } from '../../../../servicios/especialidades.service';
import { InEspecialidades } from '../../../../modelos/modeloEspecialidades/InEspecialidades';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';

@Component({
    selector: 'app-frmespecialidades',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmespecialidades.component.html',
    styleUrl: './frmespecialidades.component.css'
})
export class FrmespecialidadsComponent {
  frmEspecialidad: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number | null = null;
  estado: boolean = true;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private especialidadServ: especialidadesService,
    private route: ActivatedRoute,
    private alertaServ: AlertService
  ) {
    this.frmEspecialidad = this.formBuilder.group({
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

        this.cargarEspecialidad(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarEspecialidad(id: number): void {
    this.especialidadServ.LespecialidadesId(id).subscribe({
      next: (especialidad) => {
        this.estado = Boolean(especialidad.estado);
        this.frmEspecialidad.patchValue({
          txtNombre: especialidad.nombre,
          txtDescripcion: especialidad.descripcion,
        });
      },
      error: (err) => {
        console.log('Error al cargar especialidad:', err);
        this.alertaServ.error(
          'No se pudo cargar la información de la especialidad',
          'Comuniquese con su administrador de TI'
        );
      },
    });
  }

  guardarEspecialidad(): void {
    if (this.frmEspecialidad.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }

    const especialidad: InEspecialidades = {
      nombre: this.frmEspecialidad.value.txtNombre,
      descripcion: this.frmEspecialidad.value.txtDescripcion,
      codigo: '',
      estado: '',
    };

    if (this.eventoUpdate) {
      especialidad.codigo = '' + this.codigo;
      especialidad.estado = '' + this.estado;

      this.especialidadServ.ActualizarEspecialidad(especialidad).subscribe({
        next: (res) => {
          this.alertaServ.success('Especialidad actualizado con éxito.', '');
          this.router.navigate(['home/listaespecialidades']);
        },
        error: (err) => {
          console.log('Error al actualizar especialidad:', err.error.msg);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar la especialidad: revise que la información sea correcta'
          );        },
      });
    } else {
      this.especialidadServ.CrearEspecialidad(especialidad).subscribe({
        next: (res) => {
          this.alertaServ.success('Especialidad registrada con éxito.', '');
          this.router.navigate(['home/listaespecialidades']);
        },
        error: (err) => {
          console.log('Error al crear especialidad:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar la especialidad: revise que la información sea correcta'
          );        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmEspecialidad.controls).forEach((campo) => {
      const control = this.frmEspecialidad.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  salirSinGuardar(): void {
    this.alertaServ.confirm(
      '¿Está seguro?',
      'Se perderán todos los cambios no guardados'
    ).then((result: any) => {
      if (result.isConfirmed) {
        this.router.navigate(['home/listaespecialidades']);
      }
    });
  }
}
