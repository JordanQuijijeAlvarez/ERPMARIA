import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { compraService } from '../../../../servicios/compras.service';

// Asegúrate de importar tu servicio de compras

@Component({
  selector: 'app-listacompras',
  standalone: true, // Si usas standalone components
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
  templateUrl: './listacompras.component.html', // Asegúrate que el nombre coincida
  styleUrl: './listacompras.component.css'     // Asegúrate que el nombre coincida
})
export class ListaComprasComponent implements OnInit {

  // Arrays de datos
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
  
  // Totales para el modal
  totalDetalle = 0;
  iva = 0;
  subtiva = 0;

  // Estado del Tab (1 = Activas, 0 = Anuladas)
  estadoActual: number = 1;


  usuarioId: number = 1; // Reemplaza con la lógica para obtener el ID del usuario actual

  constructor(
    private router: Router,
    private ServicioAlertas: AlertService,
    private ServicioCompras: compraService, // Inyectamos el servicio de compras
  ) { }

  ngOnInit(): void {
    this.listarComprasActivas(this.estadoActual);
  }

  // ==========================================
  // LÓGICA DE PESTAÑAS (TABS)
  // ==========================================
  cambiarTab(estado: number) {
    this.estadoActual = estado;
    this.currentPage = 1; 
    this.searchTerm = ''; 
    this.isSearching = false;
    this.listarComprasActivas(estado);
  }

  // ==========================================
  // CARGA DE DATOS
  // ==========================================
  listarComprasActivas(estado: number): void {
    // this.ServicioAlertas.loading('Cargando compras...'); 
    
    this.ServicioCompras.getComprasEstado(estado).subscribe({
      next: (res: any) => {
        // this.ServicioAlertas.close();
        console.log('Compras recibidas:', res);
        
        // Convertir a array si viene null o un solo objeto
        this.Compras = Array.isArray(res) ? res : (res ? [res] : []);

        this.filteredCompras = [...this.Compras];
        this.totalItems = this.filteredCompras.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
        // this.ServicioAlertas.close();
        console.log('No se encontraron registros o error:', err);
        
        // Limpiar tablas si hay error o no hay datos
        this.Compras = [];
        this.filteredCompras = [];
        this.paginatedCompras = [];
        this.totalItems = 0;
        this.currentPage = 1;
      },
    });
  }

  // ==========================================
  // ACCIONES PRINCIPALES
  // ==========================================

  // 1. ANULAR COMPRA (Cambia estado a 0)
  anularCompra(id: number) {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ANULACIÓN',
      '¿Está seguro que desea anular la compra #' + id + '? Esto revertirá el stock ingresado.',
      'Sí, anular',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.ServicioCompras.AnularCompra(id).subscribe({
          next: (res) => {
            // Eliminar de la vista actual
            this.Compras = this.Compras.filter((c) => c.COMPRA_ID !== id);
            this.refrescarVistaDespuesDeAccion();
            this.ServicioAlertas.eliminacionCorrecta(); // O mensaje personalizado "Compra Anulada"
          },
          error: (err) => {
            this.ServicioAlertas.error('ERROR', 'No se pudo anular la compra.');
            console.log(err);
          },
        });
      }
    });
  }

  // 2. CONFIRMAR RECEPCIÓN (Cambia estado registro de 'P' a 'R')
  confirmarRecepcion(id: number) {
    this.ServicioAlertas.confirm(
      'RECIBIR MERCADERÍA',
      '¿Confirma que ha recibido los productos de la compra #' + id + '? Esto actualizará el inventario.',
      'Sí, recibir',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        // Asumiendo que tienes este método en tu servicio
        this.ServicioCompras.confirmarRecepcionCompra(id, this.usuarioId).subscribe({
          next: (res) => {
            this.ServicioAlertas.success('Mercadería recibida', 'El inventario ha sido actualizado.');
            
            // Actualizar el estado localmente para no recargar toda la lista
            const compraIndex = this.Compras.findIndex(c => c.COMPRA_ID === id);
            if (compraIndex !== -1) {
              this.Compras[compraIndex].COMPRA_ESTADOREGISTRO = 'R'; // Cambiar a Recibido visualmente
              this.refrescarVistaDespuesDeAccion();
            }
          },
          error: (err) => {
            this.ServicioAlertas.error('ERROR', 'No se pudo procesar la recepción.');
            console.log(err);
          }
        });
      }
    });
  }


  ActualizarCompra(id: number): void {
    this.router.navigate(['home/actualizarCompra', id]);
  }

  // ==========================================
  // MODAL DE DETALLE
  // ==========================================
  verDetalle(id: number, total: number, iva: number) {
    this.compraSeleccionadaId = id;
    this.totalDetalle = total;
    this.iva = iva;
    // Calculamos el subtotal asumiendo Total - IVA (ajusta según tu lógica de negocio)
    this.subtiva = total - iva; 
    
    this.mostrarDetalle = true;
    this.detalleCompra = []; // Limpiar anterior

    this.ServicioCompras.getDetalleCompras(id).subscribe({
      next: (res: any) => {
    this.detalleCompra = res.detalle_compra ?? [];

        console.log('Detalle de compra recibido:', this.detalleCompra);
      },
      error: (err) => {
        console.log('Error al cargar detalle', err);
      }
    });
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
    this.detalleCompra = [];
  }

  // ==========================================
  // BUSQUEDA Y FILTROS
  // ==========================================
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;

    if (this.isSearching) {
      this.filteredCompras = this.Compras.filter(c =>
        // Filtramos por ID (convirtiendo a string)
        (c.COMPRA_ID + '').includes(this.searchTerm) ||
        // Filtramos por Nombre de Proveedor (Manejo de nulls)
        (c.PROVE_NOMBRE ? c.PROVE_NOMBRE.toLowerCase() : '').includes(this.searchTerm)
      );
    } else {
      this.filteredCompras = [...this.Compras];
    }

    this.resetPaginationAfterFilter();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.filteredCompras = [...this.Compras];
    this.resetPaginationAfterFilter();
  }

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
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

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  changeItemsPerPage(newItemsPerPage: number): void {
    this.itemsPerPage = newItemsPerPage;
    this.currentPage = 1; 
    this.calculatePagination();
    this.updatePaginatedData();
  }

  getItemRange(): { start: number, end: number } {
    if (this.totalItems === 0) return { start: 0, end: 0 };
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfRange = Math.floor(maxPagesToShow / 2);
      let start = Math.max(1, this.currentPage - halfRange);
      let end = Math.min(this.totalPages, this.currentPage + halfRange);

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

  // Helper para refrescar después de borrar o actualizar localmente
  private refrescarVistaDespuesDeAccion(): void {
    if (this.isSearching) {
      this.onSearch(this.searchTerm);
    } else {
      this.filteredCompras = [...this.Compras];
      this.resetPaginationAfterFilter();
    }
                this.listarComprasActivas(1);

  }

  private resetPaginationAfterFilter(): void {
    this.totalItems = this.filteredCompras.length;
    this.currentPage = 1;
    this.calculatePagination();
    this.updatePaginatedData();
  }
}