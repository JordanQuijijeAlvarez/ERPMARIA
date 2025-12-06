import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InMedico } from '../../../../modelos/modelMedicos/InMedico';
import { HttpClient } from '@angular/common/http';
import { MedicosService } from '../../../../servicios/medicos.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-listamedicos',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './listamedicos.component.html',
    styleUrl: './listamedicos.component.css'
})
export class ListamedicosComponent {
  listaMedicos: InMedico[] = [];
  filteredMedicos: InMedico[] = []; // Lista filtrada para búsqueda
  
  // Propiedades para paginación
  paginatedMedicos: InMedico[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  // Propiedades para búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;


  constructor(
    private http: HttpClient,
    private router : Router,
    private ServicioMedico: MedicosService
  ){
  }

  ngOnInit(): void {
     
    this.listarMedicosEstado(true);
  }


  listarMedicosEstado(estado: any): void {  
    this.ServicioMedico.LMedicosEstado(estado).subscribe({
      next: res => {
        this.listaMedicos = res;
        this.filteredMedicos = [...res]; // Inicializar lista filtrada
        this.totalItems = this.filteredMedicos.length;
        this.calculatePagination();
        this.updatePaginatedData();
        console.log(res);
      },
      error: err => {
        alert('NO EXISTEN REGISTROS DE MÉDICOS');
      }
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
    this.paginatedMedicos = this.filteredMedicos.slice(startIndex, endIndex);
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
   * Realiza la búsqueda de médicos
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredMedicos = this.listaMedicos.filter(medico => 
        medico.cedula.toLowerCase().includes(this.searchTerm) ||
        medico.nombre.toLowerCase().includes(this.searchTerm) ||
        medico.apellido.toLowerCase().includes(this.searchTerm) ||
        `${medico.nombre} ${medico.apellido}`.toLowerCase().includes(this.searchTerm) ||
        medico.telefono.includes(this.searchTerm) ||
        medico.email.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredMedicos = [...this.listaMedicos];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredMedicos.length;
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
    this.filteredMedicos = [...this.listaMedicos];
    this.totalItems = this.filteredMedicos.length;
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

  eliminarMedico(id: any, nombre: string): void {
    Swal.fire({
      title: "¿Está seguro que desea eliminar el registro de " + nombre + " ?",
      text: "¡No podrás revertir esto! A menos que sea administrador",
      icon: "warning",
      showDenyButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, Eliminar Registro!",
      denyButtonText: "Cancelar Acción"
    }).then((result) => {
      if (result.isConfirmed) {
        this.ServicioMedico.EliminarMedico(id).subscribe({
          next: res => {
            this.listaMedicos = this.listaMedicos.filter(medico => parseInt(medico.codigo) !== id);

            // Actualizar la búsqueda si está activa
            if (this.isSearching) {
              this.onSearch(this.searchTerm);
            } else {
              this.filteredMedicos = [...this.listaMedicos];
              this.totalItems = this.filteredMedicos.length;
              this.calculatePagination();
              this.updatePaginatedData();
            }

            Swal.fire({
              title: "Eliminado!",
              text: "Registro Eliminado con éxito ",
              icon: "success"
            });
          },
          error: err => {
            Swal.fire("El registro no se pudo eliminar", "", "error");
            console.log('ERROR  ' + err.error.error);
          }
        });
      } else if (result.isDenied) {
        Swal.fire("El registro no se elimino", "", "error");
      }
    });
  }
  
  ActualizarMedico(id: any): void {
    this.router.navigate(['/home/actualizarMedico', id]);
  }

}
