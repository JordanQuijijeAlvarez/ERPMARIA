import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { historialService } from '../../../../../servicios/historial.service';
import { InHistorial } from '../../../../../modelos/modeloHistorial/InHistorial';
import { jsPDF } from 'jspdf';


@Component({
    selector: 'app-reporteHistorial',
    imports: [CommonModule, RouterModule],
    templateUrl: './reporteHistorial.component.html',
    styleUrl: './reporteHistorial.component.css'
})
export class reporteHistorialComponent {
  listaHistorial: InHistorial|null=null;

  constructor(
    private http: HttpClient,
    private router : Router,
    private route: ActivatedRoute,

    private servicioHistorial: historialService,
    
    
  ){
  }

  ngOnInit(): void {

    this.route.paramMap.subscribe((parametros) => {
      const codigo = parametros.get('codigo');

      if (codigo) {
        this.BuscarConsultaPorCodigoConsulta(parseInt(codigo));
      } else {
        
      }
    });
  }


  BuscarConsultaPorCodigoConsulta(codigoConsulta: number): void {
    this.servicioHistorial.LhistorialCodigoConsulta(codigoConsulta).subscribe({
      next: (res) => {

        this.listaHistorial=res;
      },
      error: (err) => {
        console.error('Error cargar medicos:', err.message);
          
      },
    });
  }



  generatePDFFromHTML(): void {
    // Crear el documento con orientación horizontal y tamaño A4
    const doc = new jsPDF({
        orientation: 'landscape', // Orientación horizontal
        unit: 'mm',               // Unidad en milímetros
        format: 'a4',             // Tamaño de la hoja A4
    });

    // Seleccionar el contenido HTML
    const divContent = document.getElementById('contenido');

    // Verificar que el elemento exista
    if (!divContent) {
        console.error('El elemento con id "contenido" no se encontró.');
        return;
    }

    // Calcular márgenes (20 mm = 2 cm)
    const marginLeft = 10;
    const marginTop = 5;

    // Usar el método html() de jsPDF
    doc.html(divContent, {
        callback: (doc) => {
            // Abrir el PDF en una nueva ventana
            const pdfOutput = doc.output('bloburl');
            window.open(pdfOutput, '_blank');
        },
        margin: [marginTop, marginLeft, marginTop, marginLeft], // Márgenes de 2 cm en cada lado
        x: marginLeft, // Posición X inicial (margen izquierdo)
        y: marginTop,  // Posición Y inicial (margen superior)
        html2canvas: {
            scale: 0.25, // Ajustar la escala para una mejor calidad (ajusta según el contenido)
        },
    });
}


    
  
}
