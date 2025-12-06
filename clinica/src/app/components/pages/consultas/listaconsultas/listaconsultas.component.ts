import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InCitaPacienteLista } from '../../../../modelos/modeloCitas/InCitaPacienteLista';
import { citasService } from '../../../../servicios/citas.service';
import { MedicosService } from '../../../../servicios/medicos.service';
import { InMedico } from '../../../../modelos/modelMedicos/InMedico';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { AuthService } from '../../../../servicios/authservicio.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';

@Component({
    selector: 'app-listaconsultas',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
    templateUrl: './listaconsultas.component.html',
    styleUrl: './listaconsultas.component.css'
})
export class listaConsultasComponent {
  listaCitasPacientesP: InCitaPacienteLista[] = [];
  listaCitasPacientesFiltrada: InCitaPacienteLista[] = [];
  listaMedicos: InMedico[] = [];
  codigoMedico: number = 0;

  // Objeto para almacenar los filtros
  filtros = {
    busquedaPaciente: '',
    fecha: '',
    hora: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private servicioCitas: citasService,
    private servicioMedicos: MedicosService,
    private ServicioAlertas: AlertService,
    private authServi: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authServi.obtenerRol() == 'administrador') {
      this.cargarMedico();
    }else if (this.authServi.obtenerRol() == 'medico'){

      this.codigoMedico = parseInt(this.authServi.obtenerCodigoMedico() ?? "0");

      this.listarCitasPacienteMedicoP(this.codigoMedico,true);

      
    }
  }

  onSelectChange(event: Event): void {
    const cbx = event.target as HTMLSelectElement;
    console.log('entra al evento change');

    if (cbx.id === 'selectMedico') {
      this.listarCitasPacienteMedicoP(parseInt(cbx.value), true);
    }
  }

  listarCitasPacienteMedicoP(codigo: number, estado: boolean): void {
    this.servicioCitas.LcitasPacientesPendientes(codigo, estado).subscribe({
      next: (res) => {
        this.listaCitasPacientesP = res;
        this.listaCitasPacientesFiltrada = [...res]; // Copia para filtrado
        
        // Debug: mostrar formato de fecha y hora
        if (res.length > 0) {
          console.log('=== FORMATO DE DATOS ===');
          console.log('Primer registro completo:', res[0]);
          console.log('Fecha formato:', res[0].fecha_cita, '- Tipo:', typeof res[0].fecha_cita);
          console.log('Hora formato:', res[0].hora_cita, '- Tipo:', typeof res[0].hora_cita);
          console.log('========================');
        }
        
        // Aplicar filtros existentes si los hay
        this.aplicarFiltros();
      },
      error: (err) => {
        this.ServicioAlertas.infoEventoConfir(
          'SESIÓN EXPIRADA',
          'Inicie nuevamente sesión',
          () => {
            this.router.navigate(['/login']);
          }
        );
      },
    });
  }

  cargarMedico(): void {
    this.servicioMedicos.LMedicos().subscribe({
      next: (res) => {
        this.listaMedicos = res;
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

  // Método para aplicar todos los filtros
  aplicarFiltros(): void {
    let resultadoFiltrado = [...this.listaCitasPacientesP];

    console.log('Aplicando filtros:', this.filtros);

    // Filtro por búsqueda de paciente (cédula o nombre)
    if (this.filtros.busquedaPaciente.trim()) {
      const busqueda = this.filtros.busquedaPaciente.toLowerCase().trim();
      resultadoFiltrado = resultadoFiltrado.filter(cita => 
        cita.cedula.toLowerCase().includes(busqueda) ||
        cita.nombre_completo.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por fecha
    if (this.filtros.fecha) {
      console.log('Filtro fecha seleccionada:', this.filtros.fecha);
      resultadoFiltrado = resultadoFiltrado.filter(cita => {
        // Convertir la fecha del input (YYYY-MM-DD) al formato que está en la BD
        const fechaBusqueda = this.convertirFechaParaBusqueda(this.filtros.fecha);
        console.log('Buscando fecha:', fechaBusqueda, 'en:', cita.fecha_cita);
        return cita.fecha_cita.includes(fechaBusqueda);
      });
    }

    // Filtro por hora
    if (this.filtros.hora) {
      console.log('Filtro hora seleccionada:', this.filtros.hora);
      resultadoFiltrado = resultadoFiltrado.filter(cita => {
        console.log('Comparando hora:', this.filtros.hora, 'con:', cita.hora_cita);
        // Ahora el select ya entrega el formato correcto (AM/PM), comparación directa
        return cita.hora_cita === this.filtros.hora;
      });
    }

    console.log('Resultado filtrado:', resultadoFiltrado);
    this.listaCitasPacientesFiltrada = resultadoFiltrado;
  }

  // Método para convertir fecha de YYYY-MM-DD a formato de búsqueda
  convertirFechaParaBusqueda(fecha: string): string {
    if (!fecha) return '';
    
    const [year, month, day] = fecha.split('-');
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const numeroMes = parseInt(month) - 1;
    const nombreMes = meses[numeroMes];
    const numeroDia = parseInt(day);
    
    // Formato: "21 de Julio de 2025"
    return `${numeroDia} de ${nombreMes} de ${year}`;
  }

  // Método para limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtros = {
      busquedaPaciente: '',
      fecha: '',
      hora: ''
    };
    this.aplicarFiltros();
  }
}
