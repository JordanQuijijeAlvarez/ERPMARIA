import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importa tu modelo y servicio de categorías (asegúrate de crearlos o ajustar la ruta)
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { InCategoria } from '../../../../modelos/modeloCategoria/InCategoria';
import { CategoriasService } from '../../../../servicios/categorias.service';

@Component({
    selector: 'app-listacategorias',
    standalone: true, // Agregado standalone si usas Angular moderno
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './listacategorias.component.html', // Asegúrate que el nombre coincida
    styleUrl: './listacategorias.component.css'
})
export class ListaCategoriasComponent implements OnInit {

  listaCategorias: InCategoria[] = [];
  filteredCategorias: InCategoria[] = [];
  paginatedCategorias: InCategoria[] = [];
  
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
    private ServicioCategorias: CategoriasService, // Servicio inyectado
    private ServicioAlertas: AlertService
  ) {}

  ngOnInit(): void {
    this.listarCategoriasEstado(1);
  }

  listarCategoriasEstado(estado: number): void {  
    this.ServicioCategorias.LCategoriasEstado(estado).subscribe({
      next: (res) => {
        this.listaCategorias = res;
        this.filteredCategorias = [...res]; // Inicializar lista filtrada
        this.totalItems = this.filteredCategorias.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
        console.error('Error al listar categorías', err);
      }
    });
  }
    
  eliminarCategoria(id: number, nombre: string): void {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar la categoría "' + nombre + '"?',
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        this.ServicioCategorias.EliminarCategoria(id).subscribe({
          next: (res) => {
            // Eliminar del array local usando CAT_ID
            this.listaCategorias = this.listaCategorias.filter(cat => cat.cat_id !== id);
            
            // Actualizar listas filtradas y paginación
            if (this.isSearching) {
                this.onSearch(this.searchTerm); // Re-filtrar si hay búsqueda activa
            } else {
                this.filteredCategorias = [...this.listaCategorias];
                this.totalItems = this.filteredCategorias.length;
                this.calculatePagination();
                this.updatePaginatedData();
            }

            this.ServicioAlertas.eliminacionCorrecta();
          },
          error: (err) => {
            this.ServicioAlertas.error('ERROR', 'Se generó un error en el proceso de eliminación');
            console.log('ERROR ' + err);
          }
        });
      }
    });
  }
  
  ActualizarCategoria(id: number): void {
    this.router.navigate(['home/actualizarCategoria', id]);
  }

  /**
   * Calcula los valores de paginación
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    // Evitar que totalPages sea 0 si no hay items
    if (this.totalPages === 0) this.totalPages = 1;
    
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
    this.paginatedCategorias = this.filteredCategorias.slice(startIndex, endIndex);
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
    if (this.totalItems === 0) return { start: 0, end: 0 };
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  /**
   * Realiza la búsqueda de categorías
   * Filtra por NOMBRE y DESCRIPCION
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredCategorias = this.listaCategorias.filter(cat => 
        cat.cat_nombre.toLowerCase().includes(this.searchTerm) ||
        (cat.cat_descripcion && cat.cat_descripcion.toLowerCase().includes(this.searchTerm))
      );
    } else {
      this.filteredCategorias = [...this.listaCategorias];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredCategorias.length;
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
    this.filteredCategorias = [...this.listaCategorias];
    this.totalItems = this.filteredCategorias.length;
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