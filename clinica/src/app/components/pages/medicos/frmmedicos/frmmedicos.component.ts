import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MedicosService } from '../../../../servicios/medicos.service';
import { InMedico } from '../../../../modelos/modelMedicos/InMedico';
import { InEspecialidadMedico } from '../../../../modelos/modelMedicos/InEspecialidadMedico';
import { CommonModule, NgClass } from '@angular/common';
import { horariosService } from '../../../../servicios/horarios.service';
import { InHorarios } from '../../../../modelos/modeloHorarios/InHorarios';
//import { ConsultoriosService } from '../../../../servicios/subcategorias.service';
import { InConsultorios } from '../../../../modelos/modelConsultorios/InConsultorios';
import Swal from 'sweetalert2';
import { InEspecialidades } from '../../../../modelos/modeloEspecialidades/InEspecialidades';
import { especialidadesService } from '../../../../servicios/especialidades.service';
import { MedicoEspecialidadService } from '../../../../servicios/medicoespecialidad.service';
import { InMedicoEspecialidad } from '../../../../modelos/modeloEspecialidades/InMedicoEspecialidad';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';

@Component({
    selector: 'app-frmmedicos',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmmedicos.component.html',
    styleUrl: './frmmedicos.component.css'
})
export class FrmmedicosComponent {
  frmMedico: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number | null = null;
  estado: boolean = true;
  mostrarModal: boolean = false;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  especialidadesSeleccionadas: InEspecialidades[] = [];
  especialidadesEliminadas: InMedicoEspecialidad[] = [];
  listaEspecialidadesMedico: InEspecialidadMedico[] = [];

  listaEspecialidades: InEspecialidades[] = [];
  listaHorarios: InHorarios[] = [];
  listaConsultorios: InConsultorios[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private medicoServ: MedicosService,
    private horarioServ: horariosService,
   // private consultorioServ: ConsultoriosService,
    private especialidadServ: especialidadesService,
    private medicoEspecialidadServ: MedicoEspecialidadService,
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmMedico = this.formBuilder.group({
      txtCedula: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtNombres: ['', Validators.required],
      txtApellidos: ['', Validators.required],
      txtFechNac: ['', Validators.required],
      txtNumTelefono: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtCorreo: ['', [Validators.required, Validators.email]],
      txtDireccion: ['', Validators.required],
      txtLicenciaMedica: ['', Validators.required],
      cbxConsultorio: ['', [Validators.required, ValidatorsComponent.selectRequired]],
      cbxHorario: ['', ValidatorsComponent.selectRequired],
      cbxEspecialidad: [''],
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      this.listarhorarioesEstado(true);
      this.listarConsultoriosEstado(true);
      this.listarEspecialidadesEstado(true);

      if (id) {
        this.eventoUpdate = true;
        this.codigo = parseInt(id);

        this.cargarMedico(this.codigo);
        this.listarEspecialidadMedico(this.codigo);

        console.log('ACTUALIZAR XD');
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  listarEspecialidadMedico(id: any): void {
    this.medicoServ.LEspecialidadMedicoId(id).subscribe({
      next: (res) => {
        if (res.length === 0) {
          this.listaEspecialidadesMedico = [];
        } else {
          this.listaEspecialidadesMedico = res;
        }
      },
      error: (err) => {
        console.error(err);
        this.listaEspecialidadesMedico = [];
      },
    });
  }

  listarEspecialidadesEstado(estado: any): void {
    this.especialidadServ.LespecialidadesEstado(estado).subscribe({
      next: (res) => {
        this.listaEspecialidades = res;

        console.log(res);
      },
      error: (err) => {
        alert('NO EXISTEN REGISTROS');
      },
    });
  }
  marcarCamposComoTocados(): void {
    Object.keys(this.frmMedico.controls).forEach((campo) => {
      const control = this.frmMedico.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  seleccionarEspecialidad(): void {
    console.log(this.frmMedico.value.cbxEspecialidad);

    this.especialidadServ
      .LespecialidadesId(this.frmMedico.value.cbxEspecialidad)
      .subscribe({
        next: (especialidad) => {
          if (especialidad) {
            const existe = this.especialidadesSeleccionadas.some(
              (e) => e.codigo === especialidad.codigo
            );

            if (existe) {
              Swal.fire({
                icon: 'warning',
                title: 'Especialidad duplicada',
                text: 'Esta especialidad ya ha sido agregada.',
              });
              return; 
            }

            this.estado = Boolean(especialidad.estado);
            this.especialidadesSeleccionadas.push(especialidad);

            console.log(this.especialidadesSeleccionadas);
          } else {
            console.log('Especialidad no encontrada');
          }
        },
        error: (err) => {
          console.log('Error al cargar especialidad:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar la información de la especialidad.',
          });
        },
      });
  }

  eliminarEspecialidadSeleccionada(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta especialidad será eliminada de la lista.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.especialidadesSeleccionadas =
          this.especialidadesSeleccionadas.filter((e) => e.codigo !== id);

        Swal.fire('Eliminado', 'La especialidad ha sido eliminada.', 'success');
      }
    });
  }

 

  eliminarEspecialidadAsignada(id: any): void {
    const especialidad = this.listaEspecialidadesMedico.find(
      (esp) => esp.codigo === id
    );

    if (especialidad) {
      this.especialidadesEliminadas.push({ codigo: id });
    }

    this.listaEspecialidadesMedico = this.listaEspecialidadesMedico.filter(
      (esp) => esp.codigo !== id
    );
  }

  listarConsultoriosEstado(estado: any): void {
    /*this.consultorioServ.LConsultoriosEstado(estado).subscribe({
      next: (res) => {
        this.listaConsultorios = res;

        console.log(res);
      },
      error: (err) => {
        alert('NO EXISTEN REGISTROS');
      },
    });*/
  }

  listarhorarioesEstado(estado: any): void {
    this.horarioServ.LhorariosEstado(estado).subscribe({
      next: (res) => {
        this.listaHorarios = res;

        console.log(res);
      },
      error: (err) => {
        alert('NO EXISTEN REGISTROS');
      },
    });
  }

  cargarMedico(id: number): void {
    this.medicoServ.LMedicosId(id).subscribe({
      next: (medico) => {
        console.log(medico);

        const fechaFormateada = medico.fecha_nacimiento
          ? medico.fecha_nacimiento.split('T')[0] 
          : null;

        this.frmMedico.patchValue({
          txtCedula: medico.cedula,
          txtNombres: medico.nombre,
          txtApellidos: medico.apellido,
          txtCorreo: medico.email,
          txtNumTelefono: medico.telefono,
          txtDireccion: medico.direccion,
          txtFechNac: fechaFormateada,
          txtLicenciaMedica: medico.licencia_medica,
          cbxConsultorio: medico.codigo_consultorio,
          cbxHorario: medico.codigo_horario,
        });
      },
      error: (err) => {
        console.log('Error al cargar medico:', err);
        alert('No se pudo cargar la información del medico');
      },
    });
  }

  guardarMedico(): void {

    if (this.frmMedico.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }else{

      const medico: InMedico = {
        cedula: this.frmMedico.value.txtCedula,
        licencia_medica: this.frmMedico.value.txtLicenciaMedica,
        nombre: this.frmMedico.value.txtNombres,
        apellido: this.frmMedico.value.txtApellidos,
        email: this.frmMedico.value.txtCorreo,
        telefono: this.frmMedico.value.txtNumTelefono,
        direccion: this.frmMedico.value.txtDireccion,
        fecha_nacimiento: this.frmMedico.value.txtFechNac,
        codigo_consultorio: this.frmMedico.value.cbxConsultorio,
        codigo_horario: this.frmMedico.value.cbxHorario,
        codigo: '',
      };
  
      if (this.eventoUpdate) {
        medico.codigo = '' + this.codigo;
        this.medicoServ.ActualizarMedico(medico).subscribe({
          next: (res) => {
            this.guardarEspecialidadesMedico(this.codigo!);
            this.eliminarEspecialidadesMedico();
            Swal.fire({
              title: 'Médico actualizado',
              text: 'Los datos del médico fueron actualizados con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.router.navigate(['/home/listamedicos']);
            });
          },
          error: (err) => {
            console.log('Error al actualizar médico:', err);
            Swal.fire(
              'Error',
              'Hubo un problema al actualizar el médico.',
              'error'
            );
          },
        });
      } else {
        this.medicoServ.CrearMedico(medico).subscribe({
          next: (res: any) => {
            console.log(res)
            const nuevoIdMedico = res.idMedico; 
            this.guardarEspecialidadesMedico(nuevoIdMedico);
            Swal.fire({
              title: 'Médico registrado',
              text: 'El médico fue registrado con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.router.navigate(['/home/listamedicos']);
            });
          },
          error: (err) => {
            console.log('Error al crear médico:', err);
            Swal.fire(
              'Error',
              'Hubo un problema al registrar el médico.',
              'error'
            );
          },
        });
      }
    }


   
  }

  guardarEspecialidadesMedico(idMedico: number): void {
    const especialidadesAGuardar = this.especialidadesSeleccionadas.map(
      (especialidad) => ({
        id_medico: idMedico,
        id_especialidad: especialidad.codigo,
      })
    );

    this.medicoEspecialidadServ
      .CrearMedicoEspecialidad(especialidadesAGuardar)
      .subscribe({
        next: () => {
          console.log('Especialidades guardadas correctamente');
        },
        error: (err) => {
          console.log('Error al guardar especialidades:', err);
        },
      });
  }

  eliminarEspecialidadesMedico(): void {
    console.log(this.especialidadesEliminadas);

    if (this.especialidadesEliminadas.length > 0) {
      const codigos = this.especialidadesEliminadas.map((e) => e.codigo); 

      this.medicoEspecialidadServ
        .EliminarMedicoEspecialidad(codigos)
        .subscribe({
          next: () => {
            console.log('Especialidades eliminadas correctamente');
            this.especialidadesEliminadas = []; 
          },
          error: (err) => {
            console.log('Error al eliminar especialidades:', err);
          },
        });
    }
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
        this.router.navigate(['/home/listamedicos']);
      }
    });
  }

  abrirModalAgregarHorario(): void {
    Swal.fire({
      title: 'Agregar Horario',
      html: `
        <form id="formHorario">
                      <div class="flex items-center gap-2">
                      <div>
                      <label for="txtHoraInicio">Hora de Inicio:</label>
                        <input type="time" id="txtHoraInicio" class="swal2-input" required>
                      </div>
                      <div>
                       <label for="txtHoraFin">Hora de Fin:</label>
                          <input type="time" id="txtHoraFin" class="swal2-input" required>
                      </div>

                      </div>
          
          
         
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const txtHoraInicio = (
          document.getElementById('txtHoraInicio') as HTMLInputElement
        ).value;
        const txtHoraFin = (
          document.getElementById('txtHoraFin') as HTMLInputElement
        ).value;

        if (!txtHoraInicio || !txtHoraFin) {
          Swal.showValidationMessage('Por favor, completa todos los campos.');
          return false;
        }

        const horarioNuevo: InHorarios = {
          hora_inicio: txtHoraInicio,
          hora_fin: txtHoraFin,
          codigo: '',
          estado: '',
          usuario: '' + 1,
        };

        return horarioNuevo;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.horarioServ.CrearHorario(result.value).subscribe({
          next: (res) => {
            this.listarhorarioesEstado(true);
          },
          error: (err) => {
            console.log('Error al crear horario:', err);
            this.alertaServ.error(
              'ERROR AL REGISTRAR',
              'Hubo un problema al registrar el Horario: revise que la información sea correcta'
            );
          },
        });
      }
    });
  }
}
