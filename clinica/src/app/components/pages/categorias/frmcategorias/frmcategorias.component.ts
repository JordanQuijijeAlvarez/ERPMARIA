import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControlName,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { horariosService } from '../../../../servicios/horarios.service';
import { InHorarios } from '../../../../modelos/modeloHorarios/InHorarios';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-frmcategorias',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmcategorias.component.html',
    styleUrl: './frmcategorias.component.css'
})
export class FrmCategoriasComponent {
  frmHorarios: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number | null = null;
  estado:boolean  = true;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private horearioServ: horariosService,
    private alertaServ: AlertService,
    
    private route: ActivatedRoute
  ) {
    this.frmHorarios = this.formBuilder.group({
      txtHoraInicio: ['', Validators.required],
      txtHoraFin: ['', Validators.required],
    }, { validators: this.timeRangeValidator });
  }

  // Validador personalizado para verificar que hora inicio < hora fin
  timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const horaInicio = group.get('txtHoraInicio')?.value;
    const horaFin = group.get('txtHoraFin')?.value;

    if (!horaInicio || !horaFin) {
      return null; // Si algún campo está vacío, no validamos
    }

    // Convertir las horas a minutos para comparar
    const minutosInicio = this.convertirHoraAMinutos(horaInicio);
    const minutosFin = this.convertirHoraAMinutos(horaFin);

    if (minutosInicio >= minutosFin) {
      return { timeRangeInvalid: true };
    }

    return null;
  }

  // Función auxiliar para convertir hora (HH:MM) a minutos
  private convertirHoraAMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');

      if (id) {
        this.eventoUpdate = true;
        this.codigo = parseInt(id);

        this.cargarHorarios(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarHorarios(id: number): void {
    this.horearioServ.LhorariosId(id).subscribe({
      next: (horario) => {
        
        this.estado= Boolean(horario.estado);
        this.frmHorarios.patchValue({
         
          txtHoraInicio: horario.hora_inicio,
          txtHoraFin: horario.hora_fin
        
        });
      },
      error: (err) => {
        console.log('Error al cargar horario:', err);
       },
    });
  }
  

  guardarhorario(): void {
    // Primero marcar todos los campos como tocados para mostrar errores
    this.marcarCamposComoTocados();

    // Verificar si hay errores de validación específicos
    if (this.frmHorarios.errors?.['timeRangeInvalid']) {
      Swal.fire({
        title: 'Error de Validación',
        text: 'Ingrese correctamente los valores. La hora de inicio debe ser anterior a la hora de fin.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si el formulario tiene otros errores (campos obligatorios)
    if (this.frmHorarios.invalid) {
      // Verificar qué campos específicos tienen errores
      const camposConError = [];
      
      if (this.frmHorarios.get('txtHoraInicio')?.invalid) {
        camposConError.push('Hora de Inicio');
      }
      if (this.frmHorarios.get('txtHoraFin')?.invalid) {
        camposConError.push('Hora de Fin');
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

    const horario: InHorarios = {
     
      hora_inicio: this.frmHorarios.value.txtHoraInicio,   
      hora_fin: this.frmHorarios.value.txtHoraFin,
      codigo: '' ,
      estado : '' ,
      usuario:''+1  
    };


    if (this.eventoUpdate) {
      horario.codigo = '' + this.codigo;
      horario.estado =''+ this.estado;

      this.horearioServ.ActualizarHorario(horario).subscribe({
        next: (res) => {
          console.log('horario actualizada:', res);
          this.alertaServ.success('Horario actualizado con éxito.', '');
          this.router.navigate(['home/listahorarios']);
        },
        error: (err) => {
          console.log('Error al actualizar horario:', err.error.msg);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar el horario: revise que la información sea correcta'
          );        },
      });
    } else {
      this.horearioServ.CrearHorario(horario).subscribe({
        next: (res) => {
          this.alertaServ.success('Horario registrado con éxito.', '');
          this.router.navigate(['home/listahorarios']);
        },
        error: (err) => {
          console.log('Error al crear horario:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar el Horario: revise que la información sea correcta'
          );        },
      });
    }
  }


  marcarCamposComoTocados(): void {
    Object.keys(this.frmHorarios.controls).forEach((campo) => {
      const control = this.frmHorarios.get(campo);
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
            this.router.navigate(['/home/listahorarios']);
          }
        });
      }
}
