import { Component } from '@angular/core';
import { especialidadesService } from '../../../../servicios/especialidades.service';
import {
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InEspecialidades } from '../../../../modelos/modeloEspecialidades/InEspecialidades';
import { CommonModule } from '@angular/common';
import { InPaciente } from '../../../../modelos/modelPacientes/InPacientes';
import { PacientesService } from '../../../../servicios/pacientes.service';
import { InMedico } from '../../../../modelos/modelMedicos/InMedico';
import { InHorarios } from '../../../../modelos/modeloHorarios/InHorarios';
import { MedicosService } from '../../../../servicios/medicos.service';
import { CalendarOptions } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { InCitasVista } from '../../../../modelos/modeloCitas/InCitasVista';
import { InCitas } from '../../../../modelos/modeloCitas/InCitas';
import { citasService } from '../../../../servicios/citas.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';

@Component({
    selector: 'app-frmcitas',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        FullCalendarModule,
        ValidatorsComponent,
    ],
    templateUrl: './frmcitas.component.html',
    styleUrl: './frmcitas.component.css'
})
export class FrmcitasComponent {
  formCita: FormGroup;

  listaEspecialidades: InEspecialidades[] = [];
  objpaciente: InPaciente | undefined;
  objhorario: InHorarios | undefined;
  listamedicos: InMedico[] = [];
  listaCitasMedicosVista: InCitasVista[] = [];
  cedulaPac: string = '';
  
  codigoCita: number = 0;
  codigoMedicoCita: number = 0;
  codigoEspecialidad:number=0;
  codigoPacienteCita: number = 0;
  horaCita: string = '';
  fechaCita: string = '';
  estadoCita: boolean = true;
  usuarioCita: number = 1;
  antecedentesCita: string = '';
  motivoCita: string = '';
  eventoUpdate: boolean = false;
//JBJKDCKSJNCDJKNSJKC
  constructor(
    private serviEspecialidades: especialidadesService,
    private serviPacientes: PacientesService,
    private serviMedico: MedicosService,
    private serviCitas: citasService,
    private formBuilder: FormBuilder,
    private alertaServ: AlertService
  ) {
    this.formCita = this.formBuilder.group({
      txtCedulaPaci: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtNombrePaci: [{ value: '', disabled: true }],
      txtApellidoPaci: [{ value: '', disabled: true }],
      txtEdadPaci: [{ value: '', disabled: true }],
      txtAntecedente: [{ value: '', disabled: false }],
      selectEspecialidad: ['',Validators.required],
      selectMedico: ['',Validators.required],
    });
  }
  calendarOptions: CalendarOptions = {
    height: 'auto',
    allDaySlot: false,
    locale: 'es',
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    weekends: true,
    dateClick: (arg) => this.manejarFechas(arg),
    select: this.handleSelect.bind(this),
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    slotDuration: '01:00:00',
    validRange: {
      start: new Date(), // Restringir selecciones a partir de la fecha y hora actual
    },

    // Lógica dinámica para determinar la hora mínima de cada día
    slotMinTime: this.getSlotMinTime(), // Establece dinámicamente la hora mínima disponible

    slotMaxTime: '22:00:00', // La última hora disponible es 22:00
    events: [], // Se cargan dinámicamente como en tu código
    selectAllow: (selectInfo) => {
      const now = new Date(); // Hora actual
      return selectInfo.start >= now; // Permitir solo si la hora seleccionada es futura
    },

    eventClick: (info) => {
      // Mostrar mensaje con el servicio de alertas personalizado
      this.alertaServ.info(
        'Espacio ocupado',
        'Este horario ya tiene una cita programada. Por favor, seleccione otro horario disponible.'
      );
      console.log('Información del evento:', info.event);
    },
  };

  getSlotMinTime() {
    const now = new Date();
    // Si la fecha es hoy, comienza en la hora actual
    if (now.getHours() < 8) {
      return '08:00:00'; // Si es antes de las 8 AM, empieza a las 8 AM
    } else {
      return `${now.getHours()}:${
        now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()
      }:00`; // Para el resto del día
    }
  }
  manejarFechas(arg: DateClickArg) {
    const [fecha, horaConZona] = arg.dateStr.split('T'); // Dividir por 'T'
    const hora = horaConZona.split('-')[0]; // Tomar solo la hora, antes del huso horario
    this.fechaCita = fecha;
    this.horaCita = hora;
  }

  ngOnInit(): void {
    this.cargarEspecialidades(true);
  }

  cargarEspecialidades(estado: boolean): void {
    this.serviEspecialidades.LespecialidadesEstado(estado).subscribe({
      next: (res) => {
        this.listaEspecialidades = res;
      },
      error: (err) => {
        console.log(err.console.error.message);
      },
    });
  }

  buscarPacienteCedula() {
    const cedula = this.formCita.get('txtCedulaPaci')?.value;
    const cedulaControl = this.formCita.get('txtCedulaPaci');

    // Limpiar errores personalizados previos
    if (cedulaControl?.hasError('pacienteNoEncontrado')) {
      cedulaControl.setErrors(null);
    }

    this.serviPacientes.LPacientesCedulaEstado(cedula, true).subscribe({
      next: (res) => {
        this.objpaciente = res;
        this.codigoPacienteCita = parseInt(this.objpaciente.codigo);

        this.formCita.patchValue({
          txtNombrePaci: this.objpaciente.nombre,
          txtApellidoPaci: this.objpaciente.apellido,
          txtEdadPaci: this.objpaciente.edad,
        });
        
        // Limpiar cualquier error previo si se encuentra el paciente
        if (cedulaControl?.hasError('pacienteNoEncontrado')) {
          const errors = { ...cedulaControl.errors };
          delete errors['pacienteNoEncontrado'];
          cedulaControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
      },
      error: (err) => {
        console.log('Error al buscar paciente:', err);
        
        // Agregar error personalizado al control
        const currentErrors = cedulaControl?.errors || {};
        cedulaControl?.setErrors({
          ...currentErrors,
          pacienteNoEncontrado: true
        });
        
        // Limpiar datos del paciente
        this.objpaciente = undefined;
        this.codigoPacienteCita = 0;
        
        this.formCita.patchValue({
          txtNombrePaci: '',
          txtApellidoPaci: '',
          txtEdadPaci: '',
        });
      },
    });
  }

  onSelectChange(event: Event): void {
    const cbx = event.target as HTMLSelectElement;
    console.log('entra al evento change');

    if (cbx.id === 'selectEspecialidad') {
      this.listamedicos = [];
      // Limpiar la selección de médico cuando se cambia la especialidad
      this.formCita.get('selectMedico')?.setValue('');
      this.objhorario = undefined; // Limpiar el horario también
      
      this.cargarMedicoEspecialidad(parseInt(cbx.value));
      this.codigoEspecialidad = parseInt(cbx.value);
      console.log('codigo de espe'+ this.codigoEspecialidad)

    } else if (cbx.id === 'selectMedico') {
      this.cargarMedicoHorario(parseInt(cbx.value));

      this.listaCitasMedicosVista = [];
      this.codigoMedicoCita = parseInt(cbx.value);

      this.cargarMedicoCitas(parseInt(cbx.value));
    }
  }

  cargarMedicoEspecialidad(id: number): void {
    this.serviEspecialidades.LespecialidadesMedicos(id).subscribe({
      next: (res) => {
        this.listamedicos = res;
        
        // Si no hay médicos, mostrar mensaje en consola y limpiar campos relacionados
        if (res.length === 0) {
          console.log('No hay médicos disponibles para esta especialidad');
          this.formCita.get('selectMedico')?.setValue('');
          this.objhorario = undefined;
        }
        
        console.log('Médicos cargados:', this.listamedicos.length);
      },
      error: (err) => {
        console.error('Error al cargar médicos por especialidad:', err.message);
        this.alertaServ.error(
          'Error al cargar médicos',
          'No se pudo cargar la información de los médicos. Comuníquese con el administrador.'
        );
        // En caso de error, limpiar la lista y campos relacionados
        this.listamedicos = [];
        this.formCita.get('selectMedico')?.setValue('');
        this.objhorario = undefined;
      },
    });
  }

  cargarMedicoHorario(id: number): void {
    this.serviMedico.LMedicoHorario(id).subscribe({
      next: (rep) => {
        this.objhorario = rep;
        const today = new Date();

        this.calendarOptions = {
          ...this.calendarOptions,
          validRange: {
            start: today,
          },
          slotMinTime: this.objhorario.hora_inicio || '08:00:00', // Hora mínima para mostrar
          slotMaxTime: this.objhorario.hora_fin || '22:00:00', // Hora máxima para mostrar
        };
      },
      error: (err) => {
        console.error('Error al cargar el horario del médico:', err.message);
      },
    });
  }

  cargarMedicoCitas(id: number): void {
    this.serviMedico.LCitasMedico(id).subscribe({
      next: (res) => {
        this.listaCitasMedicosVista = res;
        const eventos = this.listaCitasMedicosVista.map((cita) => ({
          title: cita.motivo,
          start: new Date(`${cita.fecha.split('T')[0]}T${cita.hora_inicio}`),
          end: new Date(`${cita.fecha.split('T')[0]}T${cita.hora_fin}`),
          color: '#6495ED',
        }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos,
        };
      },
      error: (err) => {
        console.error('Error al cargar médicos:', err.message);
      },
    });
  }

  handleSelect(info: any) {
    const seleccionInicio = this.roundDate(info.start).getTime();
    const seleccionFin = this.roundDate(info.end).getTime();

    const isOverlapping = (cita: any): boolean => {
      const citaInicio = this.roundDate(
        new Date(`${cita.fecha.split('T')[0]}T${cita.hora_inicio}`)
      ).getTime();
      const citaFin = this.roundDate(
        new Date(`${cita.fecha.split('T')[0]}T${cita.hora_fin}`)
      ).getTime();
      return (
        (seleccionInicio >= citaInicio && seleccionInicio < citaFin) || // Dentro del rango de una cita
        (seleccionFin > citaInicio && seleccionFin <= citaFin) // Fin dentro del rango de una cita
      );
    };

    const overlapping = this.listaCitasMedicosVista.some(isOverlapping);
    if (!overlapping) {
      // Marcar la casilla como válida (verde) usando 'background' rendering
      const cells = document.querySelectorAll('.fc-timegrid-slot');
      cells.forEach((cell) => {
        const htmlElement = cell as HTMLElement; // Casting a HTMLElement
        const dateAttribute = htmlElement.dataset['date']; // Acceder a dataset
        if (
          dateAttribute &&
          this.roundDate(new Date(dateAttribute)).getTime() === seleccionInicio
        ) {
          // Aquí estamos usando 'background' rendering para cambiar el fondo
          htmlElement.style.backgroundColor = '#28a749'; // Color verde
        }
      });
    } 
  }

  // Función para redondear la fecha a minutos
  roundDate(date: Date): Date {
    date.setSeconds(0); // Eliminar los segundos
    date.setMilliseconds(0); // Eliminar los milisegundos
    return date;
  }

  guardarCitas(): void {
    if (this.formCita.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }

    if (this.horaCita=='') {
      this.alertaServ.info(
        '',
        'Por favor, seleccione una hora en el calendario *'
      );
      return;
    }

    const cita: InCitas = {
      codigo_paciente: this.codigoPacienteCita,
      codigo_medico: this.codigoMedicoCita,
      codigo_especialidad:this.codigoEspecialidad,
      motivo: this.motivoCita,
      hora: this.horaCita,
      fecha: this.fechaCita,
      usuario: this.usuarioCita,
      antecedentes: this.formCita.value.txtAntecedente,
      estado: this.estadoCita,
      codigo: 0,
    };

    if (this.eventoUpdate) {
      cita.codigo = this.codigoCita;
    } else {
      this.serviCitas.CrearCita(cita).subscribe({
        next: (res) => {
          this.alertaServ.success('Cita registrada con éxito.', '');
          
          // Limpiar el formulario y reiniciar el calendario
          this.limpiarFormularioYCalendario();
        },
        error: (err) => {
          console.log('Error al crear consultorio:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR CITA',
            err.error.msg
          );        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formCita.controls).forEach((campo) => {
      const control = this.formCita.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  limpiarFormularioYCalendario(): void {
    // Limpiar el formulario reactivo
    this.formCita.reset();
    
    // Limpiar errores personalizados del FormControl de cédula
    this.formCita.get('txtCedulaPaci')?.setErrors(null);
    
    // Limpiar las variables del componente
    this.objpaciente = undefined;
    this.objhorario = undefined;
    this.listamedicos = [];
    this.listaCitasMedicosVista = [];
    this.cedulaPac = '';
    
    this.codigoCita = 0;
    this.codigoMedicoCita = 0;
    this.codigoEspecialidad = 0;
    this.codigoPacienteCita = 0;
    this.horaCita = '';
    this.fechaCita = '';
    this.antecedentesCita = '';
    this.motivoCita = '';
    this.eventoUpdate = false;
    
    // Limpiar selecciones visuales del calendario
    const casillasSeleccionadas = document.querySelectorAll('.celda-seleccionada');
    casillasSeleccionadas.forEach(casilla => {
      casilla.classList.remove('celda-seleccionada');
    });
    
    // Limpiar estilos de celdas verdes del handleSelect
    const celdasVerdes = document.querySelectorAll('.fc-timegrid-slot[style*="background-color"]');
    celdasVerdes.forEach(celda => {
      (celda as HTMLElement).style.backgroundColor = '';
    });
    
    // Reiniciar completamente el calendario sin eventos
    this.calendarOptions = {
      height: 'auto',
      allDaySlot: false,
      locale: 'es',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      weekends: true,
      dateClick: (arg) => this.manejarFechas(arg),
      select: this.handleSelect.bind(this),
      selectable: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      slotDuration: '01:00:00',
      validRange: {
        start: new Date(), // Restringir selecciones a partir de la fecha y hora actual
      },
      slotMinTime: this.getSlotMinTime(), // Hora mínima disponible
      slotMaxTime: '22:00:00', // La última hora disponible es 22:00
      events: [], // Sin eventos - calendario limpio
      selectAllow: (selectInfo) => {
        const now = new Date(); // Hora actual
        return selectInfo.start >= now; // Permitir solo si la hora seleccionada es futura
      },
      eventClick: (info) => {
        // Mostrar mensaje con el servicio de alertas personalizado
        this.alertaServ.info(
          'Espacio ocupado',
          'Este horario ya tiene una cita programada. Por favor, seleccione otro horario disponible.'
        );
        console.log('Información del evento:', info.event);
      },
    };
    
    console.log('Formulario y calendario limpiados exitosamente');
  }
}
