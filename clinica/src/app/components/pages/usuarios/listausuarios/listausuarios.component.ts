import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { UsuariosService } from '../../../../servicios/usuarios.service'; 
import { InUsuarioVista } from '../../../../modelos/modeloUsuarios/InUsuarios';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-listausuarios',
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './listausuarios.component.html',
    styleUrl: './listausuarios.component.css'
})
export class ListausuariosComponent {
  
  listaUsuarios: InUsuarioVista[] = [];
  filteredUsuarios: InUsuarioVista[] = [];
  paginatedUsuarios: InUsuarioVista[] = [];
  
  // Propiedades de búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;
  
  // Propiedades de estado (activo/inactivo)
  estadoActual: number = 1; // 1 = Activos, 0 = Inactivos
  
  // Propiedades de paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  
    constructor(
      private http: HttpClient,
      private router: Router,
      private usuarioServ: UsuariosService,
      private ServicioAlertas: AlertService
    ) {}
  
    ngOnInit(): void {
      this.listarUsuarios();
    }
  
  listarUsuarios(): void {
    this.usuarioServ.LUsuarios().subscribe({
      next: (res) => {
        this.listaUsuarios = res;
        this.applyFilters(); // Aplicar filtros de estado y búsqueda
        console.log(res);
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
    });
  }    eliminarUsuario(id: any, nombre : string): void {
    
        Swal.fire({
          title: "¿Está seguro que desea eliminar el registro de "+ nombre+ " ?",
          text: "¡No podrás revertir esto! A menos que sea adminitrador",
          icon: "warning",
          showDenyButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, Eliminar Registro!",
          denyButtonText:"Cancelar Acción"
        }).then((result) => {
          if (result.isConfirmed) {
            console.log(id +" XDDDD");
            this.usuarioServ.EliminarUsuario(id).subscribe(
          
              {
                next: res => {
                  // Recargar la lista completa de usuarios
                  this.listarUsuarios();
    
                  Swal.fire({
                    title: "Eliminado!",
                    text: "Registro Eliminado con éxito ",
                    icon: "success"
                  });
                },
                error: err =>{
                 
                  Swal.fire("El registro no se pudo eliminar", "", "error");
                  console.log('ERROR  '+ err.error.error);
                }
      
              });
    
    
            
          }else if (result.isDenied) {
            Swal.fire("El registro no se elimino", "", "error");
    
          }
        });
      }
  
  ActualizarUsuario(id: any): void {
    this.router.navigate(['home/actualizarUsuarios', id]);
  }

  /**
   * Cambia entre tabs de activos e inactivos
   */
  cambiarTab(estado: number): void {
    this.estadoActual = estado;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Aplica todos los filtros (estado y búsqueda)
   */
  applyFilters(): void {
    let filtered = [...this.listaUsuarios];
    
    // Filtrar por estado (activo/inactivo)
    filtered = filtered.filter(usuario => parseInt(usuario.user_estado) === this.estadoActual);
    
    // Filtrar por búsqueda si existe
    if (this.isSearching && this.searchTerm.length > 0) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(usuario => 
        usuario.user_username.toLowerCase().includes(searchLower) ||
        usuario.rol_nombre.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredUsuarios = filtered;
    this.totalItems = this.filteredUsuarios.length;
    this.calculatePagination();
    this.updatePaginatedData();
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
    this.paginatedUsuarios = this.filteredUsuarios.slice(startIndex, endIndex);
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
   * Realiza la búsqueda de usuarios
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    this.currentPage = 1; // Reset a la primera página
    this.applyFilters();
  }

  /**
   * Limpia la búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.isSearching = false;
    this.currentPage = 1;
    this.applyFilters();
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
   * Obtiene las iniciales del nombre de usuario
   */
  getUserInitials(username: string): string {
    if (!username) return 'U';
    
    const words = username.split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
  }

  /**
   * Obtiene el color del badge según el rol
   */
  getRoleBadgeColor(roleName: string): string {
    const role = roleName.toLowerCase();
    
    if (role.includes('admin')) {
      return 'bg-red-100 text-red-800';
    } else if (role.includes('doctor') || role.includes('medico')) {
      return 'bg-blue-100 text-blue-800';
    } else if (role.includes('enferm') || role.includes('nurse')) {
      return 'bg-green-100 text-green-800';
    } else if (role.includes('secretari') || role.includes('recepcion')) {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }
}