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

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  // Búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;

  // Modal Detalle
  mostrarDetalle = false;
  compraSeleccionadaId!: number;
  detalleCompra: any[] = [];
  totalDetalle = 0;
  iva = 0;
  subtiva = 0;

  estadoActual: number = 1;
  usuarioId: number = 1; // Ajusta según tu auth service

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
    // this.ServicioAlertas.loading('Cargando...');
    this.ServicioCompras.getComprasEstado(estado).subscribe({
      next: (res: any) => {
        // this.ServicioAlertas.close();
        this.Compras = Array.isArray(res) ? res : (res ? [res] : []);
        this.filteredCompras = [...this.Compras];
        this.totalItems = this.filteredCompras.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
        // this.ServicioAlertas.close();
        console.log('Error o sin datos:', err);
        this.Compras = [];
        this.filteredCompras = [];
        this.paginatedCompras = [];
        this.totalItems = 0;
      },
    });
  }

  // --- LÓGICA DEL MODAL ---
  verDetalle(id: number, total: number, iva: number) {
    this.compraSeleccionadaId = id;
    this.totalDetalle = total;
    this.iva = iva;
    this.subtiva = total - iva; 
    
    // Limpiar antes de cargar para evitar ver datos de la compra anterior
    this.detalleCompra = []; 
    this.mostrarDetalle = true;

    this.ServicioCompras.getDetalleCompras(id).subscribe({
      next: (res: any) => {
        // A veces el backend devuelve { detalle_compra: [...] } y a veces el array directo
        // Ajustamos para ambos casos
        if (res && res.detalle_compra) {
          this.detalleCompra = res.detalle_compra;
        } else if (Array.isArray(res)) {
          this.detalleCompra = res;
        } else {
          this.detalleCompra = [];
        }
      },
      error: (err) => {
        this.ServicioAlertas.error('Error', 'No se pudo cargar el detalle');
        this.cerrarDetalle();
      }
    });
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.detalleCompra = [];
  }

  // --- ACCIONES DE COMPRA ---
  anularCompra(id: number) {
    this.ServicioAlertas.confirm(
      'ANULAR COMPRA',
      `¿Desea anular la compra #${id}? Esto revertirá el stock.`,
      'Sí, anular', 'Cancelar'
    ).then((res) => {
      if (res.isConfirmed) {
        this.ServicioCompras.AnularCompra(id).subscribe({
          next: () => {
            this.ServicioAlertas.eliminacionCorrecta();
            this.listarComprasActivas(1);
          },
          error: () => this.ServicioAlertas.error('Error', 'No se pudo anular')
        });
      }
    });
  }

  confirmarRecepcion(id: number) {
    this.ServicioAlertas.confirm(
      'RECIBIR MERCADERÍA',
      `¿Confirmar recepción de la compra #${id}? Se sumará al stock.`,
      'Sí, recibir', 'Cancelar'
    ).then((res) => {
      if (res.isConfirmed) {
        this.ServicioCompras.confirmarRecepcionCompra(id, this.usuarioId).subscribe({
          next: () => {
            this.ServicioAlertas.success('Éxito', 'Inventario actualizado');
            this.listarComprasActivas(1);
          },
          error: () => this.ServicioAlertas.error('Error', 'Fallo al confirmar')
        });
      }
    });
  }

  ActualizarCompra(id: number) {
    this.router.navigate(['home/actualizarCompra', id]);
  }

  // --- GENERACIÓN DE PDF (COMPRAS) ---
  descargarFactura(compra: any) {
    this.ServicioCompras.getDetalleCompras(compra.compra_id || compra.COMPRA_ID).subscribe((res: any) => {
      // Obtener el array correcto
      const detalles = Array.isArray(res) ? res : (res.detalle_compra || []);

      const doc = new jsPDF();
      
      // Encabezado
      doc.setFontSize(22);
      doc.setTextColor(41, 128, 185);
      doc.text('ORDEN DE COMPRA', 14, 20);

      // Info Proveedor
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Proveedor: ${compra.prove_nombre || compra.PROVE_NOMBRE}`, 14, 30);
      doc.text(`RUC: ${compra.prove_ruc || compra.PROVE_RUC || '---'}`, 14, 35);
      
      // Info Compra (Derecha)
      doc.text(`N° Orden: ${String(compra.compra_id || compra.COMPRA_ID).padStart(6, '0')}`, 150, 30);
      const fecha = new Date(compra.compra_horafecha || compra.COMPRA_HORAFECHA);
      doc.text(`Fecha: ${fecha.toLocaleDateString()}`, 150, 35);

      // Tabla
      const columnas = ['Producto', 'Cant.', 'Costo Unit.', 'Subtotal'];
      const filas = detalles.map((det: any) => [
        det.prod_nombre || det.PROD_NOMBRE,
        det.detc_cantidad || det.DETC_CANTIDAD,
        `$${parseFloat(det.detc_preciouni || det.DETC_PRECIOUNI).toFixed(2)}`,
        `$${parseFloat(det.detc_subtotal || det.DETC_SUBTOTAL).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 45,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });

      // Totales
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      const total = parseFloat(compra.compra_montototal || compra.COMPRA_TOTAL);
      
      doc.text(`Total a Pagar: $${total.toFixed(2)}`, 190, finalY, { align: 'right' });

      doc.save(`Orden_Compra_${compra.compra_id || compra.COMPRA_ID}.pdf`);
    });
  }

  // --- PAGINACIÓN Y BÚSQUEDA (Idéntico a Ventas) ---
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
    if (this.currentPage > this.totalPages) this.currentPage = 1;
  }

  updatePaginatedData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCompras = this.filteredCompras.slice(startIndex, endIndex);
  }

  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    if (this.isSearching) {
      this.filteredCompras = this.Compras.filter(c =>
        (c.compra_id + '').includes(this.searchTerm) ||
        (c.prove_nombre || '').toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredCompras = [...this.Compras];
    }
    this.totalItems = this.filteredCompras.length;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredCompras = [...this.Compras];
    this.totalItems = this.filteredCompras.length;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  goToPage(page: number): void { this.currentPage = page; this.updatePaginatedData(); }
  previousPage(): void { if (this.currentPage > 1) this.goToPage(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); }
  
  changeItemsPerPage(n: number): void {
    this.itemsPerPage = n;
    this.calculatePagination();
    this.updatePaginatedData();
  }

  getItemRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start: this.totalItems ? start : 0, end };
  }

  getPageNumbers(): number[] {
    return Array.from({ length: Math.min(5, this.totalPages) }, (_, i) => i + 1);
  }
}