import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { ConsultoriosService } from '../../../../servicios/subcategorias.service';
import { InConsultorios } from '../../../../modelos/modelConsultorios/InConsultorios';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';

@Component({
    selector: 'app-listacosultorios',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './listaconsultorios.component.html',
    styleUrl: './listaconsultorios.component.css'
})
export class ListaconsultoriosComponent {
  listaConsultorios: InConsultorios[] = [];
  filteredConsultorios: InConsultorios[] = [];
  paginatedConsultorios: InConsultorios[] = [];
  
  // Propiedades de búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;
  
  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
   // private ServicioConsultorio: ConsultoriosService,
    private ServicioAlertas: AlertService
  ) {}

  ngOnInit(): void {
    this.listarConsultoriosEstado(true);
  }

  listarConsultoriosEstado(estado: any): void {
    /*this.ServicioConsultorio.LConsultoriosEstado(estado).subscribe({
      next: (res) => {
        this.listaConsultorios = res;
        this.filteredConsultorios = [...res]; // Inicializar lista filtrada
        this.totalItems = this.filteredConsultorios.length;
        this.calculatePagination();
        this.updatePaginatedData();
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
    });*/
  }

  eliminarConsultorios(id: any, nombre: string): void {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar el registro de ' + nombre,
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
      /*  this.ServicioConsultorio.EliminarConsultorio(id).subscribe({
          next: (res) => {
            this.listaConsultorios = this.listaConsultorios.filter(
              (consultorio) => parseInt(consultorio.codigo) !== id
            );
            
            // Actualizar listas filtradas y paginación
            this.filteredConsultorios = this.filteredConsultorios.filter(
              (consultorio) => parseInt(consultorio.codigo) !== id
            );
            this.totalItems = this.filteredConsultorios.length;
            this.calculatePagination();
            this.updatePaginatedData();

            this.ServicioAlertas.eliminacionCorrecta();
          },
          error: (err) => {
            this.ServicioAlertas.error(
              'ERROR',
              'Se genero un error en el proceso de eliminación'
            );
            console.log('ERROR  ' + err.error.error);
          },
        });*/
      } 
    });
  }

  ActualizarConsultorio(id: any): void {
    this.router.navigate(['home/actualizarConsultorios', id]);
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
    this.paginatedConsultorios = this.filteredConsultorios.slice(startIndex, endIndex);
  }

  /**
   * Actualiza la paginación
   */
  updatePagination(): void {
    this.calculatePagination();
    this.updatePaginatedData();
  }

  /**
   * Cambia a una página específica
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  /**
   * Página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  /**
   * Página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
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
   * Realiza la búsqueda de consultorios
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredConsultorios = this.listaConsultorios.filter(consultorio => 
        consultorio.nombre.toLowerCase().includes(this.searchTerm) ||
        consultorio.descripcion.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredConsultorios = [...this.listaConsultorios];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredConsultorios.length;
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
    this.filteredConsultorios = [...this.listaConsultorios];
    this.totalItems = this.filteredConsultorios.length;
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
    this.updatePagination();
  }

  /**
   * Genera array de números de página para mostrar
   */
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
}
