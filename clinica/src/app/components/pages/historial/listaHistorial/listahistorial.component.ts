import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InCitaPacienteLista } from '../../../../modelos/modeloCitas/InCitaPacienteLista';
import { MedicosService } from '../../../../servicios/medicos.service';
import { InMedico } from '../../../../modelos/modelMedicos/InMedico';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { historialService } from '../../../../servicios/historial.service';
import {
  InHistorial,
  InHistorialLista,
} from '../../../../modelos/modeloHistorial/InHistorial';
import { consultasService } from '../../../../servicios/consultas.service';
import { jsPDF } from 'jspdf';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgModule } from '@angular/core';
import { AuthService } from '../../../../servicios/authservicio.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-listahistorial',
    imports: [RouterModule, ReactiveFormsModule, CommonModule, DirectivasModule],
    templateUrl: './listahistorial.component.html',
    styleUrl: './listahistorial.component.css'
})
export class listaHistorialComponent {
  listaHistorial: InHistorialLista[] = [];
  listaHistorialCompleta: InHistorial[] = [];

  listaMedicos: InMedico[] = [];
  codigoMedico: number = 0;
  txtCedula: string = '';
  txtFechaInicio: string = '';
  txtFechaFin: string = '';
  formListarConsulta: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private formBuilder: FormBuilder,

    private servicioHistorial: historialService,
    private servicioMedicos: MedicosService,
    private servicioConsultas: consultasService,
    private authService : AuthService,

    private ServicioAlertas: AlertService
  ) {
    this.formListarConsulta = this.formBuilder.group({
      txtCedulaPaciente: ['', ValidatorsComponent.numericTenDigits],
      checkCanlendario: [false], // Checkbox desmarcado por defecto
      txtFechaInicio: [{ value: '', disabled: true }],
      txtFechaFin: [{ value: '', disabled: true }],
      selectMedico: ['', ValidatorsComponent.selectRequired],
      end: [''],
    });

    this.formListarConsulta
      .get('checkCanlendario')
      ?.valueChanges.subscribe((enabled) => {
        if (enabled) {
          this.formListarConsulta.get('txtFechaInicio')?.enable();
          this.formListarConsulta.get('txtFechaFin')?.enable();
        } else {
          this.formListarConsulta.get('txtFechaInicio')?.disable();
          this.formListarConsulta.get('txtFechaFin')?.disable();
          this.txtFechaFin = '';
          this.txtFechaInicio = '';
        }
      });
  }

  ngOnInit(): void {
    this.cargarMedico();

    this.codigoMedico = parseInt(this.authService.obtenerCodigoMedico() ?? "0");

  }

  onSelectChange(event: Event): void {
    const cbx = event.target as HTMLSelectElement;

    if (cbx.id === 'selectMedico') {
      this.codigoMedico = parseInt(cbx.value);
    }
  }

  listarHistorialFilto() {
    // Validar que al menos un campo de búsqueda esté lleno
    const cedulaPaciente = this.formListarConsulta.value.txtCedulaPaciente?.trim();
    const selectMedico = this.formListarConsulta.value.selectMedico;
    const fechaInicio = this.formListarConsulta.value.txtFechaInicio;
    const fechaFin = this.formListarConsulta.value.txtFechaFin;
    const isCheckCalendario = this.formListarConsulta.value.checkCanlendario;

    // Validación específica para cédula incompleta
    if (cedulaPaciente && cedulaPaciente.length > 0 && cedulaPaciente.length < 10) {
      this.ServicioAlertas.error(
        'Cédula incompleta',
        `La cédula debe tener exactamente 10 dígitos. Actualmente tiene ${cedulaPaciente.length} dígitos.`
      );
      this.marcarCamposComoTocados();
      return;
    }

    // Verificar si al menos un filtro está activo
    const tieneAlgunFiltro = cedulaPaciente || 
                            (this.authService.obtenerRol() === 'administrador' && selectMedico) ||
                            (isCheckCalendario && (fechaInicio || fechaFin));

    if (!tieneAlgunFiltro) {
      this.ServicioAlertas.info(
        'Filtros requeridos',
        'Debe especificar al menos un criterio de búsqueda: cédula del paciente, médico (administradores) o rango de fechas.'
      );
      this.marcarCamposComoTocados();
      return;
    }

    // Validar campos específicos con errores
    if (cedulaPaciente && this.formListarConsulta.get('txtCedulaPaciente')?.invalid) {
      this.ServicioAlertas.error(
        'Cédula inválida',
        'La cédula debe contener exactamente 10 dígitos numéricos.'
      );
      this.marcarCamposComoTocados();
      return;
    }

    // Validar médico para administradores
    if (this.authService.obtenerRol() === 'administrador' && 
        selectMedico && this.formListarConsulta.get('selectMedico')?.invalid) {
      this.ServicioAlertas.error(
        'Médico requerido',
        'Debe seleccionar un médico válido.'
      );
      this.marcarCamposComoTocados();
      return;
    }

    // Validar rango de fechas si está habilitado
    if (isCheckCalendario) {
      if (!fechaInicio && !fechaFin) {
        this.ServicioAlertas.info(
          'Fechas requeridas',
          'Debe especificar al menos una fecha (inicio o fin) cuando el filtro por fecha está activo.'
        );
        return;
      }

      if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
        this.ServicioAlertas.error(
          'Rango de fechas inválido',
          'La fecha de inicio no puede ser posterior a la fecha fin.'
        );
        return;
      }
    }

    // Si todas las validaciones pasan, proceder con la búsqueda
    this.txtCedula = cedulaPaciente || null;
    
    if (this.authService.obtenerRol() === 'administrador') {
      this.codigoMedico = selectMedico || null;
    }

    this.txtFechaFin = fechaFin || null;
    this.txtFechaInicio = fechaInicio || null;

    console.log('Búsqueda con parámetros:', {
      cedula: this.txtCedula,
      medico: this.codigoMedico,
      fechaInicio: this.txtFechaInicio,
      fechaFin: this.txtFechaFin
    });

    this.listarHistorial(
      this.txtCedula,
      this.codigoMedico,
      this.txtFechaInicio,
      this.txtFechaFin
    );
  }

  /**
   * Marca todos los campos del formulario como tocados para mostrar errores de validación
   */
  marcarCamposComoTocados(): void {
    Object.keys(this.formListarConsulta.controls).forEach((campo) => {
      const control = this.formListarConsulta.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  listarHistorial(
    cedulaPaciente: any,
    codigoMedico: any,
    fechaInicio: any,
    fechaFin: any
  ): void {
    this.servicioHistorial
      .LhistorialcedPacientecodMedicoFechaIF(
        cedulaPaciente,
        codigoMedico,
        fechaInicio,
        fechaFin
      )
      .subscribe({
        next: (res) => {
          this.listaHistorial = res;
          console.log(res);
        },
        error: (err) => {
          this.ServicioAlertas.info('', 'No se encontraron registros');
        },
      });
  }

  cargarMedico(): void {
    this.servicioMedicos.LMedicos().subscribe({
      next: (res) => {
        console.log(res);
        this.listaMedicos = res;
        console.log(this.listaMedicos);

      },
      error: (err) => {
        console.error('Error cargar medicos:', err.message);
        this.ServicioAlertas.error(
          'ERROR',
          'Se genero un error en el proceso de obtener los datos de medico'
        );
      },
    });
  }

  RealizarConsulta(citaPaciente: InCitaPacienteLista): void {
    this.router.navigate(['home/realizarConsulta'], {
      queryParams: {
        codigo_cita: citaPaciente.codigo_cita,
        cedula: citaPaciente.cedula,
        nombre: citaPaciente.nombre_completo,
        edad: citaPaciente.edad,
      },
    });
  }

  BuscarConsultaPorCodigoConsulta(codigoConsulta: number): void {
    this.servicioHistorial.LhistorialCodigoConsulta(codigoConsulta).subscribe({
      next: (res) => {
        this.generatePDF(res);
      },
      error: (err) => {
        console.error('Error cargar medicos:', err.message);
        this.ServicioAlertas.error(
          'ERROR',
          'Se genero un error en el proceso de obtener los datos '
        );
      },
    });
  }

  generatePDF(consulta: InHistorial) {
    if (!consulta) {
      console.error('Consulta no encontrada.');
      return;
    }
    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text(`Historial de Consulta N° ${consulta.codigo_consulta}`, 105, 10, { align: 'center' });
    doc.addImage('/iconoestetocopio.jpg','png',10,10,50,50);
    // Información del paciente
    doc.setFontSize(12);
    doc.text('Información del Paciente:', 10, 30);
    doc.text(
      `Nombre: ${consulta.nombre_paciente} ${consulta.apellido_paciente}`,
      10,
      40
    );
    doc.text(`Cédula: ${consulta.cedula_paciente}`, 10, 50);
    doc.text(`Edad: ${consulta.edad_paciente || 'N/A'}`, 10, 60);

    // Información del médico
    doc.text('Información del Médico:', 10, 80);
    doc.text(
      `Nombre: ${consulta.nombre_medico} ${consulta.apellido_medico}`,
      10,
      90
    );
    doc.text(`Cédula: ${consulta.cedula_medico}`, 10, 100);
    doc.text(`Especialidad: ${consulta.especialidad}`, 10, 110);

    // Detalles de la consulta
    doc.text('Detalles de la Consulta:', 10, 130);
    doc.text(
      `Fecha: ${new Date(consulta.fecha_consulta).toLocaleDateString()}`,
      10,
      140
    );
    doc.text(`Consultorio: ${consulta.consultorio}`, 10, 150);
    doc.text(`Diagnóstico: ${consulta.diagnostico}`, 10, 160);
    doc.text(`Tratamiento: ${consulta.tratamiento}`, 10, 170);
    doc.text(`Observaciones: ${consulta.observaciones}`, 10, 180);

    // Agregar más datos si es necesario
    doc.text(`Peso: ${consulta.peso || 'N/A'}`, 10, 190);
    doc.text(
      `Presión Arterial: ${consulta.presion_arterial || 'N/A'}`,
      10,
      200
    );
    doc.text(`Temperatura: ${consulta.temperatura || 'N/A'}°C`, 10, 210);

    // Guardar el PDF
    //doc.save(`consulta_${consulta.codigo_consulta}.pdf`);
    // Abrir el PDF en una nueva ventana o en el mismo navegador
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
  }

  abrirReporte(codigo: any): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['home/historial/imprimir', codigo])
    );
    window.open(url, '_blank');
  }
}
