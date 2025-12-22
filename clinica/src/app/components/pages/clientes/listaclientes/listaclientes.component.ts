import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { clienteService } from '../../../../servicios/clientes.service';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';

@Component({
    selector: 'app-listaClientes',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
    templateUrl: './listaclientes.component.html',
    styleUrl: './listaclientes.component.css'
})
export class ListaclientesComponent {
  listaclientes: InClientes[] = [];
  filteredClientes: InClientes[] = []; 
  paginatedClientes: InClientes[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  // Propiedades para búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private ServicioCliente: clienteService,

    private ServicioAlertas: AlertService
  ) {}

  ngOnInit(): void {
    this.listarClientesEstado('1');//1= activo 0=inactivo
  }

  listarClientesEstado(estado: any): void {
    this.ServicioCliente.LclienteEstado(estado).subscribe({
      next: (res) => {
        this.listaclientes = res;
        this.filteredClientes = [...res]; 
        this.totalItems = this.filteredClientes.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
        // this.ServicioAlertas.infoEventoConfir(
        //   'SESIÓN EXPIRADA',
        //   'Inicie nuevamente sesión',
        //   () => {
        //     this.router.navigate(['/login']);
        //   }
        // );
      },
    });
  }

  /**
   * Calcula los valores de paginación
   */
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
    this.paginatedClientes = this.filteredClientes.slice(startIndex, endIndex);
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
   * Realiza la búsqueda de clientes
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredClientes = this.listaclientes.filter(cliente => 
        cliente.client_cedula.toLowerCase().includes(this.searchTerm) ||
        cliente.client_nombres.toLowerCase().includes(this.searchTerm) ||
        cliente.client_apellidos.toLowerCase().includes(this.searchTerm) ||
        `${cliente.client_nombres} ${cliente.client_apellidos}`.toLowerCase().includes(this.searchTerm) ||
        cliente.client_correo.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredClientes = [...this.listaclientes];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredClientes.length;
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
    this.filteredClientes = [...this.listaclientes];
    this.totalItems = this.filteredClientes.length;
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

  eliminarcliente(id: any, nombre: string): void {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar el registro de ' + nombre,
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        const user_id = 1;
        this.ServicioCliente.Eliminarcliente(id, user_id).subscribe({
          next: (res) => {
            this.listaclientes = this.listaclientes.filter(
              (cliente) => cliente.client_id !== id
            );

            // Actualizar la búsqueda si está activa
            if (this.isSearching) {
              this.onSearch(this.searchTerm);
            } else {
              this.filteredClientes = [...this.listaclientes];
              this.totalItems = this.filteredClientes.length;
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

  /**
   * Formatea una fecha al formato DD-MM-YYYY
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return dateString; // Retornar el string original si no es una fecha válida
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString; // En caso de error, retornar el string original
    }
  }

  Actualizarcliente(id: any): void {
    this.router.navigate(['home/actualizarCliente', id]);
  }
}
