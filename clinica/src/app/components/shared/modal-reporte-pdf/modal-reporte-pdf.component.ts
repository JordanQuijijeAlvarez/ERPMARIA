import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AlertService } from '../../../servicios/Alertas/alertas.service';

export interface ConfiguracionReporte {
  titulo: string;
  nombreArchivo: string;
  columnas: string[];
  datosOriginales: any[];
  nombreEntidad: string; // Ej: 'cliente', 'producto', 'venta', etc
  campoFecha?: string; // Campo de fecha en los datos para filtrar
  empresa?: {
    nombre?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  formatearFila?: (item: any) => any[]; // Función para formatear cada fila
}

@Component({
  selector: 'app-modal-reporte-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-reporte-pdf.component.html',
  styleUrl: './modal-reporte-pdf.component.css'
})
export class ModalReportePdfComponent {
  @Input() mostrar: boolean = false;
  @Input() configuracion!: ConfiguracionReporte;
  @Output() cerrar = new EventEmitter<void>();

  // Filtros
  tipoFiltro: 'todos' | 'dia' | 'mes' | 'rango' = 'todos';
  fechaInicio: string = '';
  fechaFin: string = '';
  
  // Para filtro por mes
  mesSeleccionado: string = '';
  anioSeleccionado: number = new Date().getFullYear();

  // Opciones de años disponibles (últimos 5 años)
  aniosDisponibles: number[] = [];

  constructor(private alertService: AlertService) {
    // Generar años disponibles
    const anioActual = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.aniosDisponibles.push(anioActual - i);
    }
  }

  ngOnInit() {
    // Establecer fecha de inicio como hoy
    const hoy = new Date();
    this.fechaInicio = hoy.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
    
    // Establecer mes actual
    this.mesSeleccionado = String(hoy.getMonth() + 1).padStart(2, '0');
  }

  cerrarModal() {
    this.cerrar.emit();
  }

  cambiarTipoFiltro(tipo: 'todos' | 'dia' | 'mes' | 'rango') {
    this.tipoFiltro = tipo;
  }

  obtenerDatosFiltrados(): any[] {
    if (!this.configuracion.datosOriginales || this.configuracion.datosOriginales.length === 0) {
      return [];
    }

    if (this.tipoFiltro === 'todos') {
      return this.configuracion.datosOriginales;
    }

    const campoFecha = this.configuracion.campoFecha || 'fecha';
    
    return this.configuracion.datosOriginales.filter(item => {
      const fechaItem = new Date(item[campoFecha]);
      
      if (isNaN(fechaItem.getTime())) {
        return false; // Fecha inválida
      }

      switch (this.tipoFiltro) {
        case 'dia':
          const fechaComparar = new Date(this.fechaInicio);
          return (
            fechaItem.getDate() === fechaComparar.getDate() &&
            fechaItem.getMonth() === fechaComparar.getMonth() &&
            fechaItem.getFullYear() === fechaComparar.getFullYear()
          );
        
        case 'mes':
          const mes = parseInt(this.mesSeleccionado);
          return (
            fechaItem.getMonth() + 1 === mes &&
            fechaItem.getFullYear() === this.anioSeleccionado
          );
        
        case 'rango':
          const inicio = new Date(this.fechaInicio);
          const fin = new Date(this.fechaFin);
          fin.setHours(23, 59, 59, 999); // Incluir todo el día final
          return fechaItem >= inicio && fechaItem <= fin;
        
        default:
          return true;
      }
    });
  }

  generarReporte() {
    const datosFiltrados = this.obtenerDatosFiltrados();

    if (datosFiltrados.length === 0) {
      this.alertService.info(
        'Sin datos',
        'No hay datos que coincidan con los filtros seleccionados'
      );
      return;
    }

    this.alertService.loading('Generando reporte PDF...');

    try {
      const doc = new jsPDF();
      const empresa = this.configuracion.empresa || {};

      // --- ENCABEZADO ---
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(empresa.nombre || 'MI EMPRESA', 14, 20);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      let yPos = 26;
      
      if (empresa.ruc) {
        doc.text(`RUC: ${empresa.ruc}`, 14, yPos);
        yPos += 4;
      }
      if (empresa.direccion) {
        doc.text(`Dirección: ${empresa.direccion}`, 14, yPos);
        yPos += 4;
      }
      if (empresa.telefono) {
        doc.text(`Teléfono: ${empresa.telefono}`, 14, yPos);
        yPos += 4;
      }
      if (empresa.email) {
        doc.text(`Email: ${empresa.email}`, 14, yPos);
        yPos += 4;
      }

      // --- CUADRO DE INFORMACIÓN DEL REPORTE ---
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(120, 10, 76, yPos - 6, 2, 2, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(this.configuracion.titulo, 158, 18, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      const fechaGeneracion = new Date().toLocaleString('es-ES');
      doc.text(`Generado: ${fechaGeneracion}`, 158, 25, { align: 'center' });
      
      // Información del filtro aplicado
      let textoFiltro = '';
      switch (this.tipoFiltro) {
        case 'todos':
          textoFiltro = 'Filtro: Todos los registros';
          break;
        case 'dia':
          textoFiltro = `Filtro: Día ${new Date(this.fechaInicio).toLocaleDateString('es-ES')}`;
          break;
        case 'mes':
          const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          textoFiltro = `Filtro: ${nombresMeses[parseInt(this.mesSeleccionado) - 1]} ${this.anioSeleccionado}`;
          break;
        case 'rango':
          textoFiltro = `Filtro: ${new Date(this.fechaInicio).toLocaleDateString('es-ES')} - ${new Date(this.fechaFin).toLocaleDateString('es-ES')}`;
          break;
      }
      doc.text(textoFiltro, 158, 31, { align: 'center' });
      doc.text(`Total registros: ${datosFiltrados.length}`, 158, 37, { align: 'center' });

      // --- LÍNEA SEPARADORA ---
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos + 5, 196, yPos + 5);

      // --- TABLA DE DATOS ---
      const filas = datosFiltrados.map(item => {
        if (this.configuracion.formatearFila) {
          return this.configuracion.formatearFila(item);
        }
        // Formato por defecto: usar las columnas en orden
        return this.configuracion.columnas.map((_, index) => {
          const keys = Object.keys(item);
          return item[keys[index]] || '';
        });
      });

      autoTable(doc, {
        startY: yPos + 10,
        head: [this.configuracion.columnas],
        body: filas,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 9
        },
        bodyStyles: {
          textColor: 50,
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [245, 250, 255]
        },
        styles: {
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        columnStyles: {
          0: { cellWidth: 'auto' }
        }
      });

      // --- PIE DE PÁGINA ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Reporte de ${this.configuracion.nombreEntidad} - Página 1`,
        105,
        pageHeight - 15,
        { align: 'center' }
      );

      // --- DESCARGAR ---
      const nombreArchivo = `${this.configuracion.nombreArchivo}_${new Date().getTime()}.pdf`;
      doc.save(nombreArchivo);

      this.alertService.close();
      this.alertService.success(
        'Reporte generado',
        'El archivo PDF se ha descargado correctamente'
      );
      
      this.cerrarModal();
    } catch (error) {
      this.alertService.close();
      this.alertService.error(
        'Error',
        'Hubo un problema al generar el reporte'
      );
      console.error('Error generando PDF:', error);
    }
  }
}
