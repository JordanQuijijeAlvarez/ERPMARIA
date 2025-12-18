import { Component } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { ventaService } from '../../../../servicios/ventas.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <--- ASÍ DEBE QUEDAR
@Component({
  selector: 'app-listaventas',
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
  templateUrl: './listaventas.component.html',
  styleUrl: './listaventas.component.css'
})
export class listaVentasComponent {


  
  filteredVentas: any[] = [];
  paginatedVentas: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  // Propiedades para búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;




  mostrarDetalle = false;
  ventaSeleccionadaId!: number;
  detalleVenta: any[] = [];
  Ventas: any[] = [];

  totalDetalle = 0;
  iva=0;
    subtiva=0;


    estadoActual: number = 1;



  // Objeto para almacenar los filtros
  filtros = {
    busquedaPaciente: '',
    fecha: '',
    hora: ''
  };

  constructor(
    private router: Router,

    private ServicioAlertas: AlertService,
    private ServicioVentas: ventaService,

  ) { }

  ngOnInit(): void {


    this.listarventasActivas(this.estadoActual);
    /* if (this.authServi.obtenerRol() == 'administrador') {
 
     }else if (this.authServi.obtenerRol() == 'medico'){
 
       this.codigoMedico = parseInt(this.authServi.obtenerCodigoMedico() ?? "0");
 
       this.listarCitasPacienteMedicoP(this.codigoMedico,true);
 
       
     }*/


  }

  cambiarTab(estado: number) {
    this.estadoActual = estado;
    this.currentPage = 1; // Reiniciamos paginación
    this.searchTerm = ''; // Opcional: Limpiar búsqueda al cambiar tab
    this.isSearching = false;
    
    // Llamamos al servicio con el nuevo estado
    this.listarventasActivas(estado);
  }

  // 3. MÉTODO PARA ANULAR (Stub)
  anularVenta(id: number) {

    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar el registro n° ' + id,
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.ServicioVentas.AnularVenta(id).subscribe({
          next: (res) => {
            this.Ventas = this.Ventas.filter(
              (venta) => venta.venta_id !== id
            );

            // Actualizar la búsqueda si está activa
            if (this.isSearching) {
              this.onSearch(this.searchTerm);
            } else {
              this.filteredVentas = [...this.Ventas];
              this.totalItems = this.filteredVentas.length;
              this.calculatePagination();
              this.updatePaginatedData();
            }

            this.ServicioAlertas.eliminacionCorrecta();
          },
          error: (err) => {
            this.ServicioAlertas.error(
              'ERROR',
              'Se genero un error en el proceso de eliminación'
            );
            console.log('ERROR  ' + err.error.error);
          },
        });
      }
    });
  }
  

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  /**
   * Actualiza los datos paginados para mostrar
   */
  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedVentas = this.filteredVentas.slice(startIndex, endIndex);
  }

  /**
   * Cambia a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  /**
   * Página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  /**
   * Página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  /**
   * Obtiene el rango de items mostrados
   */
  getItemRange(): { start: number, end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  /**
   * Realiza la búsqueda de ventass
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;

    if (this.isSearching) {
      this.filteredVentas = this.Ventas.filter(v =>
        (v.client_cedula ?? '').toLowerCase().includes(this.searchTerm) ||
        (v.clientenombre ?? '').toLowerCase().includes(this.searchTerm) ||
        (v.usuarionombre ?? '').toLowerCase().includes(this.searchTerm)
      );

    } else {
      this.filteredVentas = [...this.Ventas];
    }

    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredVentas.length;
    this.currentPage = 1; // Reset a la primera página
    this.calculatePagination();
    this.updatePaginatedData();
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredVentas = [...this.Ventas];
    this.totalItems = this.filteredVentas.length;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  /**
   * Cambia el número de items por página
   */
  changeItemsPerPage(newItemsPerPage: number): void {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1; // Reset to first page
    this.calculatePagination();
    this.updatePaginatedData();
  }
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con puntos suspensivos
      const halfRange = Math.floor(maxPagesToShow / 2);
      let start = Math.max(1, this.currentPage - halfRange);
      let end = Math.min(this.totalPages, this.currentPage + halfRange);

      // Ajustar si estamos cerca del inicio o final
      if (this.currentPage <= halfRange) {
        end = maxPagesToShow;
      } else if (this.currentPage > this.totalPages - halfRange) {
        start = this.totalPages - maxPagesToShow + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  }

  verDetalle(id: number, total:number,iva :number,subtiva:number) {
    this.ventaSeleccionadaId = id;
    this.totalDetalle=total
    this.iva=iva;
    this.subtiva=subtiva;
    this.mostrarDetalle = true;

    this.ServicioVentas.getDetalleVentas(id).subscribe(res => {
      this.detalleVenta = res;
      //this.totalDetalle = res.reduce((sum, d) => sum + d.detv_subtotal, 0);
    });
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.detalleVenta = [];
  }



listarventasActivas(estado: number): void {
  // Opcional: Mostrar loading
  // this.ServicioAlertas.loading('Cargando...'); 

  this.ServicioVentas.getVentasEstado(estado).subscribe({
    next: (res: any) => {
      // this.ServicioAlertas.close();
      console.log('Ventas recibidas:', res);
      
      // Si llega null o undefined, lo convertimos en array vacío
      this.Ventas = Array.isArray(res) ? res : (res ? [res] : []);

      this.filteredVentas = [...this.Ventas];
      this.totalItems = this.filteredVentas.length;
      this.calculatePagination();
      this.updatePaginatedData();
    },
    error: (err) => {
      // this.ServicioAlertas.close();
      console.log('No se encontraron registros o hubo error:', err);

      // --- AQUÍ ESTABA EL PROBLEMA ---
      // Si el backend dice "No hay registros" (Error 400/404),
      // DEBEMOS LIMPIAR LAS VARIABLES VISUALES MANUALMENTE
      this.Ventas = [];
      this.filteredVentas = [];
      this.paginatedVentas = [];
      this.totalItems = 0;
      this.currentPage = 1;
    },
  });
}

ActualizarVenta(id: any): void {
    this.router.navigate(['home/actualizarVenta', id]);
  }

descargarFactura(venta: any) {
  this.ServicioVentas.getDetalleVentas(venta.venta_id).subscribe((detalles: any[]) => {
    
    const doc = new jsPDF();
    
    // --- COLORES Y ESTILOS ---
    const colorPrincipal = [41, 128, 185]; // Un azul profesional
    const colorGris = [100, 100, 100];
    
    // 1. LOGO Y DATOS DE LA EMPRESA (Izquierda)
    // Si tuvieras un logo en base64 podrías usar: doc.addImage(...)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Azul
    doc.text(venta.local_nombre, 14, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100); // Gris
    doc.text('RUC: 094847366001', 14, 28);
    doc.text('Dirección: PASAJE Y JUNIN ESQUINA', 14, 33);
    doc.text('Teléfono: 0989847332', 14, 38);
    doc.text('Email: facturacionmaria@gmail.com', 14, 43);

    // 2. DATOS DE LA FACTURA (Derecha)
    // Dibujamos un bloque gris claro de fondo
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(140, 10, 60, 35, 2, 2, 'F');

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('FACTURA', 170, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`N°: ${String(venta.venta_id).padStart(6, '0')}`, 170, 28, { align: 'center' }); // Ejemplo: 000123
    
    // Fecha segura
    const fecha = new Date(venta.venta_horafecha);
    const fechaStr = !isNaN(fecha.getTime()) ? fecha.toLocaleDateString() : venta.venta_horafecha;
    doc.text(`Fecha: ${fechaStr}`, 170, 36, { align: 'center' });

    // 3. LÍNEA SEPARADORA
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 50, 196, 50);

    // 4. DATOS DEL CLIENTE
    doc.setFontSize(11);
    doc.setTextColor(41, 128, 185);
    doc.text('FACTURAR A:', 14, 60);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(venta.clientenombre || 'Consumidor Final', 14, 66);
    console.log(venta);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    // Si tienes estos datos en el objeto venta, úsalos, si no, pon vacíos o valida
    const cedulaCliente = venta.client_cedula || venta.cliente_cedula || '---';
    
    doc.text(`C.I./RUC: ${cedulaCliente}`, 14, 71);

    // 5. TABLA DE DETALLES (Preciosa)
    const columnas = ['Producto', 'Cant.', 'Precio Unit.', 'Total'];
    const filas = detalles.map(det => [
      det.prod_nombre,
      det.detv_cantidad,
      `$${parseFloat(det.prod_precioventa).toFixed(2)}`, // Formato numérico seguro
      `$${parseFloat(det.detv_subtotal).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: 85,
      head: [columnas],
      body: filas,
      theme: 'grid', // 'striped', 'grid', 'plain'
      headStyles: { 
        fillColor: [41, 128, 185], // Color azul cabecera
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: 50
      },
      alternateRowStyles: {
        fillColor: [245, 250, 255] // Azul muy clarito alternado
      },
      columnStyles: {
        0: { cellWidth: 'auto' }, // Producto (ancho automático)
        1: { halign: 'center', cellWidth: 20 }, // Cantidad centrada
        2: { halign: 'right', cellWidth: 30 },  // Precio a la derecha
        3: { halign: 'right', cellWidth: 30 }   // Subtotal a la derecha
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    // 6. TOTALES (Al final de la tabla)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Dibujamos un recuadro para los totales
    const boxX = 135;
    const boxWidth = 61;
    const boxY = finalY - 5;
    const boxHeight = 25;

    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 1, 1, 'FD'); // FD = Fill + Draw border

    // Textos de los totales (Alineados a la derecha)
    const rightMargin = 190;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    
    // Subtotal
    doc.text('Subtotal:', 160, finalY, { align: 'right' });
    doc.text(`$${parseFloat(venta.venta_subiva).toFixed(2)}`, rightMargin, finalY, { align: 'right' });

    // IVA
    doc.text('IVA (15%):', 160, finalY + 6, { align: 'right' });
    doc.text(`$${parseFloat(venta.venta_iva).toFixed(2)}`, rightMargin, finalY + 6, { align: 'right' });

    // TOTAL GRANDE
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185); // Azul
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 160, finalY + 14, { align: 'right' });
    doc.text(`$${parseFloat(venta.venta_total).toFixed(2)}`, rightMargin, finalY + 14, { align: 'right' });

    // 7. PIE DE PÁGINA
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Gracias por su compra.', 105, pageHeight - 20, { align: 'center' });
    doc.text('Este documento no tiene validez tributaria oficial.', 105, pageHeight - 15, { align: 'center' });

    // --- DESCARGAR ---
    doc.save(`Factura_Venta_${venta.venta_id}.pdf`);
  });
}
}


