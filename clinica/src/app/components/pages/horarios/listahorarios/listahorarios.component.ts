import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InHorarios } from '../../../../modelos/modeloHorarios/InHorarios';
import { horariosService } from '../../../../servicios/horarios.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';


@Component({
    selector: 'app-listaHorarios',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './listahorarios.component.html',
    styleUrl: './listahorarios.component.css'
})
export class listaHorariosComponent {

  listaHorarios: InHorarios[] = [];
  filteredHorarios: InHorarios[] = [];
  paginatedHorarios: InHorarios[] = [];
  
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
    private router : Router,
    private ServicioHorarios: horariosService,
    private ServicioAlertas: AlertService
    
  ){
  }

  ngOnInit(): void {
     
    this.listarhorarioesEstado(true);
  }


  listarhorarioesEstado(estado: any): void {  
    this.ServicioHorarios.LhorariosEstado(estado).subscribe(
      {
          next: res => {
            this.listaHorarios = res;
            this.filteredHorarios = [...res]; // Inicializar lista filtrada
            this.totalItems = this.filteredHorarios.length;
            this.calculatePagination();
            this.updatePaginatedData();
          }, error: err => {
            this.ServicioAlertas.infoEventoConfir('SESIÓN EXPIRADA', 'Inicie nuevamente sesión', () => {
              this.router.navigate(['/login']);
            });
          }
      }
    );
  };


    
  eliminarHorarios(id: any, nombre : string): void {

    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar el registro de ' + nombre,
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {

        this.ServicioHorarios.EliminarHorario(id).subscribe(
          {
            next: res => {
              this.listaHorarios = this.listaHorarios.filter(horario => parseInt(horario.codigo) !== id);
              
              // Actualizar listas filtradas y paginación
              this.filteredHorarios = this.filteredHorarios.filter(horario => parseInt(horario.codigo) !== id);
              this.totalItems = this.filteredHorarios.length;
              this.calculatePagination();
              this.updatePaginatedData();

              this.ServicioAlertas.eliminacionCorrecta();
            },
            error: err =>{
             
              this.ServicioAlertas.error('ERROR','Se genero un error en el proceso de eliminación');
              console.log('ERROR  '+ err.error.error);
            }
  
          });
   
      }
    });
  }
  
  Actualizarhorario(id: any): void {
    this.router.navigate(['home/actualizarHorarios', id]);
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
    this.paginatedHorarios = this.filteredHorarios.slice(startIndex, endIndex);
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
   * Realiza la búsqueda de horarios
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredHorarios = this.listaHorarios.filter(horario => 
        horario.hora_inicio.toLowerCase().includes(this.searchTerm) ||
        horario.hora_fin.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredHorarios = [...this.listaHorarios];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredHorarios.length;
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
    this.filteredHorarios = [...this.listaHorarios];
    this.totalItems = this.filteredHorarios.length;
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

  /**
   * Formatea una hora al formato HH:MM
   */
  formatTime(timeString: string): string {
    if (!timeString) return '';
    
    try {
      // Si es un string de tiempo simple, retornarlo tal como está
      if (timeString.match(/^\d{2}:\d{2}$/)) {
        return timeString;
      }
      
      // Si es un datetime, extraer solo la parte de la hora
      if (timeString.includes('T')) {
        const time = timeString.split('T')[1];
        return time.substring(0, 5); // HH:MM
      }
      
      return timeString;
    } catch (error) {
      return timeString;
    }
  }
}
