import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InCitaPacienteLista } from '../../../../modelos/modeloCitas/InCitaPacienteLista';
import { InConsultas } from '../../../../modelos/modeloConsultas/InConsultas';
import { consultasService } from '../../../../servicios/consultas.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-frmconsultas',
    imports: [ReactiveFormsModule, RouterModule, CommonModule],
    templateUrl: './frmconsultas.component.html',
    styleUrl: './frmconsultas.component.css'
})
export class FrmconsultasComponent {
  formConsultas: FormGroup;

  citaPaciente: InCitaPacienteLista | undefined;
  codigoCita!: number;
  cedulaPaciente: string = '';
  nombrePaciente!: string;
  edadPaciente!: number;
  eventoUpdate = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private serviConsultas: consultasService,
    private alertaServ: AlertService
  ) {
    this.formConsultas = this.formBuilder.group({
      txtEdadPaciente: [{ value: '', disabled: true }, Validators.required],
      txtNombresPaciente: [{ value: '', disabled: true }],
      txtCedulaPaciente: [{ value: '', disabled: true }],
      txtPesoPaciente: ['', Validators.required],
      txtEstaturaPaciente: ['', Validators.required],
      txtPresionPaciente: ['', Validators.required],
      txtDiagnostico: ['', Validators.required],
      txtTratamiento: ['', Validators.required],
      txtObservaciones: [''],
      txtTemperaturaPaciente: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.cedulaPaciente = params['cedula'];
      this.codigoCita = +params['codigo_cita'];
      this.nombrePaciente = params['nombre'];
      this.edadPaciente = +params['edad'];
    });
    this.cargarDatosPaciente();
  }

  guardarConsulta(): void {
    if (this.formConsultas.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }

    const consulta: InConsultas = {
      codigo_cita: this.codigoCita,
      peso: this.formConsultas.value.txtPesoPaciente,
      temperatura: this.formConsultas.value.txtTemperaturaPaciente,
      presion: this.formConsultas.value.txtPresionPaciente,
      diagnostico: this.formConsultas.value.txtDiagnostico,
      tratamiento: this.formConsultas.value.txtTratamiento,
      observaciones: this.formConsultas.value.txtObservaciones,
      estatura: this.formConsultas.value.txtEstaturaPaciente,
      codigo: 0,
      usuario: 1,
      estado: false,
    };

    if (this.eventoUpdate) {
      //cita.codigo = this.codigoCita;
    } else {
      console.log(consulta);
      this.serviConsultas.CrearConsulta(consulta).subscribe({
        next: (res) => {
          this.alertaServ.success('Consulta registrada con éxito.', '');
          this.router.navigate(['home/listaconsultas']);
        },
        error: (err) => {
          console.log('Error al registrar consulta:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar la consulta: revise que la información sea correcta'
          );
        },
      });
    }
  }

  cargarDatosPaciente(): void {
    this.formConsultas.patchValue({
      txtNombresPaciente: this.nombrePaciente,
      txtEdadPaciente: this.edadPaciente,
      txtCedulaPaciente: this.cedulaPaciente,
    });
  }
  marcarCamposComoTocados(): void {
    Object.keys(this.formConsultas.controls).forEach((campo) => {
      const control = this.formConsultas.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}
