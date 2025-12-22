import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { compraService } from '../../../../servicios/compras.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-listacompras',
  standalone: true,
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
  templateUrl: './listacompras.component.html',
  styleUrl: './listacompras.component.css'
})
export class ListaComprasComponent implements OnInit {

  Compras: any[] = [];
  filteredCompras: any[] = [];
  paginatedCompras: any[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  searchTerm: string = '';
  isSearching: boolean = false;

  mostrarDetalle = false;
  compraSeleccionadaId!: number;
  detalleCompra: any[] = [];
  
  totalDetalle = 0;
  iva = 0;
  subtiva = 0;

  estadoActual: number = 1;
  usuarioId: number = 1; // ID del usuario actual

  constructor(
    private router: Router,
    private ServicioAlertas: AlertService,
    private ServicioCompras: compraService,
  ) { }

  ngOnInit(): void {
    this.listarComprasActivas(this.estadoActual);
  }

  cambiarTab(estado: number) {
    this.estadoActual = estado;
    this.currentPage = 1; 
    this.searchTerm = ''; 
    this.isSearching = false;
    this.listarComprasActivas(estado);
  }

  listarComprasActivas(estado: number): void {
    this.ServicioCompras.getComprasEstado(estado).subscribe({
      next: (res: any) => {
        console.log('Compras recibidas:', res);
        this.Compras = Array.isArray(res) ? res : (res ? [res] : []);
        this.filteredCompras = [...this.Compras];
        this.totalItems = this.filteredCompras.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
        console.log('No se encontraron registros o hubo error:', err);
        this.Compras = [];
        this.filteredCompras = [];
        this.paginatedCompras = [];
        this.totalItems = 0;
        this.currentPage = 1;
      },
    });
  }

  verDetalle(id: number, total: number, iva: number) {
    this.compraSeleccionadaId = id;
    this.totalDetalle = total;
    this.iva = iva;
    this.subtiva = total - iva; 
    
    this.mostrarDetalle = true;
    this.detalleCompra = [];

    this.ServicioCompras.getDetalleCompras(id).subscribe({
      next: (res: any) => {
        // Manejo flexible de la respuesta del backend
        if (Array.isArray(res)) {
          this.detalleCompra = res;
        } else if (res && res.detalle_compra) {
          this.detalleCompra = res.detalle_compra;
        }
      },
      error: (err) => console.error(err)
    });
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.detalleCompra = [];
  }

  // --- ACCIONES ---

  ActualizarCompra(id: number): void {
    this.router.navigate(['home/actualizarCompra', id]);
  }

  anularCompra(id: number) {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ANULACIÓN',
      '¿Está seguro que desea anular la compra #' + id + '? Esto revertirá el stock.',
      'Sí, anular',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.ServicioCompras.AnularCompra(id).subscribe({
          next: (res) => {
            this.Compras = this.Compras.filter((c) => (c.compra_id || c.COMPRA_ID) !== id);
            this.refrescarVista();
            this.ServicioAlertas.eliminacionCorrecta();
          },
          error: (err) => {
            this.ServicioAlertas.error('ERROR', 'No se pudo anular la compra.');
          },
        });
      }
    });
  }

  confirmarRecepcion(id: number) {
    this.ServicioAlertas.confirm(
      'RECIBIR MERCADERÍA',
      '¿Confirma que ha recibido los productos de la compra #' + id + '?',
      'Sí, recibir',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.ServicioCompras.confirmarRecepcionCompra(id, this.usuarioId).subscribe({
          next: (res) => {
            this.ServicioAlertas.success('Éxito', 'Inventario actualizado.');
            this.listarComprasActivas(1); // Recargamos para ver el nuevo estado
          },
          error: (err) => {
            this.ServicioAlertas.error('ERROR', 'No se pudo procesar la recepción.');
          }
        });
      }
    });
  }

  descargarFactura(compra: any) {
    const id = compra.compra_id || compra.COMPRA_ID;
    this.ServicioCompras.getDetalleCompras(id).subscribe((res: any) => {
      const detalles = Array.isArray(res) ? res : (res.detalle_compra || []);
      const doc = new jsPDF();

      // Estilos PDF (Igual que ventas)
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('ORDEN DE COMPRA', 14, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Proveedor: ${compra.prove_nombre || compra.PROVE_NOMBRE}`, 14, 30);
      
      const fecha = new Date(compra.compra_horafecha || compra.COMPRA_HORAFECHA);
      doc.text(`Fecha: ${fecha.toLocaleDateString()}`, 14, 35);
      doc.text(`N° Orden: ${String(id).padStart(6, '0')}`, 14, 40);

      const columnas = ['Producto', 'Cant.', 'Costo Unit.', 'Subtotal'];
      const filas = detalles.map((det: any) => [
        det.prod_nombre || det.PROD_NOMBRE,
        det.detc_cantidad || det.DETC_CANTIDAD,
        `$${parseFloat(det.detc_preciouni || det.DETC_PRECIOUNI).toFixed(2)}`,
        `$${parseFloat(det.detc_subtotal || det.DETC_SUBTOTAL).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], halign: 'center' },
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 1: { halign: 'center'} }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const total = parseFloat(compra.compra_montototal || compra.COMPRA_TOTAL);
      doc.text(`Total: $${total.toFixed(2)}`, 190, finalY, { align: 'right' });

      doc.save(`Compra_${id}.pdf`);
    });
  }

  // --- PAGINACIÓN Y BÚSQUEDA ---
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCompras = this.filteredCompras.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedData();
    }
  }

  previousPage(): void { if (this.currentPage > 1) { this.currentPage--; this.updatePaginatedData(); } }
  nextPage(): void { if (this.currentPage < this.totalPages) { this.currentPage++; this.updatePaginatedData(); } }

  getItemRange(): { start: number, end: number } {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start: this.totalItems === 0 ? 0 : start, end };
  }

  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;

    if (this.isSearching) {
      this.filteredCompras = this.Compras.filter(c =>
        (c.prove_nombre?.toLowerCase() || '').includes(this.searchTerm) ||
        (c.compra_id + '').includes(this.searchTerm)
      );
    } else {
      this.filteredCompras = [...this.Compras];
    }
    this.totalItems = this.filteredCompras.length;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredCompras = [...this.Compras];
    this.totalItems = this.filteredCompras.length;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  changeItemsPerPage(newItemsPerPage: number): void {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  getPageNumbers(): number[] {
    const pages = [];
    const maxPages = 5;
    for (let i = 1; i <= Math.min(this.totalPages, maxPages); i++) {
      pages.push(i);
    }
    return pages;
  }

  private refrescarVista(): void {
    if (this.isSearching) {
      this.onSearch(this.searchTerm);
    } else {
      this.filteredCompras = [...this.Compras];
      this.totalItems = this.filteredCompras.length;
      this.calculatePagination();
      this.updatePaginatedData();
    }
  }
}