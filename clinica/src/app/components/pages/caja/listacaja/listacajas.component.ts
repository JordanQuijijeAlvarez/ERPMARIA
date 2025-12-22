import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { clienteService } from '../../../../servicios/clientes.service';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';
import { CajaService } from '../../../../servicios/caja.service';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { routes } from '../../../../app.routes';

@Component({
    selector: 'app-listacajas',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
    templateUrl: './listacajas.component.html',
    styleUrl: './listacajas.component.css'
})
export class ListacajasComponent implements OnInit {
cerrarCaja() {

      this.router.navigate(['/home/caja']);
 }
abrirCaja() {
      this.router.navigate(['/home/caja']);
}

  listaCajas: any[] = [];
  tieneCajaAbierta: boolean = false; // <--- VARIABLE QUE CONTROLA LOS BOTONES

  constructor(private cajaService: CajaService, private router: Router) {}

  ngOnInit(): void {
    this.cargarHistorial();
    this.verificarEstadoActual();
  }

  // Verificar si el usuario ya tiene una caja abierta
  verificarEstadoActual() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userId = usuario.user_id;

    if (userId) {
      this.cajaService.verificarEstadoCaja(userId).subscribe((res: any) => {
        this.tieneCajaAbierta = res.abierta; // True o False desde tu backend
      });
    }
  }
  cargarHistorial() {
    this.cajaService.listarHistorialCajas().subscribe({
      next: (res) => this.listaCajas = res,
      error: (err) => console.error(err)
    });
  }

  generarReportePDF(caja: any) {
    const doc = new jsPDF();
    const azul = [41, 128, 185];

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(azul[0], azul[1], azul[2]);
    doc.text('REPORTE DE CIERRE DE CAJA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID Caja: #${caja.caja_id}`, 14, 30);
    doc.text(`Cajero: ${caja.cajero_nombre}`, 14, 35);
    doc.text(`Apertura: ${new Date(caja.fecha_inicio).toLocaleString()}`, 14, 40);
    doc.text(`Cierre: ${caja.fecha_fin ? new Date(caja.fecha_fin).toLocaleString() : 'EN CURSO'}`, 14, 45);

    // Estado Visual
    const estado = caja.estado === '1' ? 'ABIERTA' : 'CERRADA';
    doc.setFontSize(14);
    doc.setTextColor(caja.estado === '1' ? 'green' : 'red');
    doc.text(estado, 190, 30, { align: 'right' });

    // TABLA DE RESUMEN FINANCIERO
    autoTable(doc, {
      startY: 55,
      head: [['Concepto', 'Monto']],
      body: [
        ['Monto Inicial (Base)', `$${caja.monto_inicial.toFixed(2)}`],
        ['(+) Ventas Totales', `$${caja.total_ventas.toFixed(2)}`],
        ['(-) Compras/Gastos', `$${caja.total_compras.toFixed(2)}`],
        ['(=) Total Esperado en Sistema', `$${caja.monto_sistema.toFixed(2)}`],
        ['Dinero Físico (Arqueo)', `$${caja.monto_real.toFixed(2)}`],
      ],
      theme: 'grid',
      columnStyles: { 
        1: { halign: 'right', fontStyle: 'bold' } 
      }
    });

    // SECCIÓN DE DIFERENCIA
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Resultado del Arqueo:', 14, finalY);

    const dif = caja.diferencia;
    let mensajeDif = 'CUADRE PERFECTO';
    let colorDif = [0, 128, 0]; // Verde

    if (dif < 0) {
      mensajeDif = `FALTANTE: $${Math.abs(dif).toFixed(2)}`;
      colorDif = [200, 0, 0]; // Rojo
    } else if (dif > 0) {
      mensajeDif = `SOBRANTE: $${dif.toFixed(2)}`;
      colorDif = [0, 0, 200]; // Azul
    }

    doc.setFontSize(14);
    doc.setTextColor(colorDif[0], colorDif[1], colorDif[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(mensajeDif, 190, finalY, { align: 'right' });

    // Observaciones
    if (caja.observacion) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text(`Observaciones: ${caja.observacion}`, 14, finalY + 15);
    }

    doc.save(`Reporte_Caja_${caja.caja_id}.pdf`);
  }
}