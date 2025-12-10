import { Component } from '@angular/core';
import {  Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { ventaService } from '../../../../servicios/ventas.service';

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
}
