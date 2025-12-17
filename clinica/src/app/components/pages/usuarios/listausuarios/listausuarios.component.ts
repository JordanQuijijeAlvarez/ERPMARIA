import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { UsuariosService } from '../../../../servicios/usuarios.service'; 
import { AuthService } from '../../../../servicios/authservicio.service';
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
      private authServ: AuthService,
      private ServicioAlertas: AlertService
    ) {}
  
    ngOnInit(): void {
      this.listarUsuarios();
    }
  
  listarUsuarios(): void {
    this.usuarioServ.LUsuariosPorEstado(this.estadoActual).subscribe({
      next: (res) => {
        this.listaUsuarios = res;
        this.applyFilters(); // Aplicar filtros de búsqueda
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
  }

  editarUsuario(id: any): void {
    this.router.navigate(['home/actualizarUsuario', id]);
  }

  private isAdminRole(roleName: string | undefined | null): boolean {
    const role = (roleName ?? '').toLowerCase();
    return role.includes('admin') || role.includes('administrador');
  }

  private isSelf(username: string | undefined | null): boolean {
    const current = (this.authServ.obtenerNombreUsuario() ?? '').toLowerCase();
    return current.length > 0 && (username ?? '').toLowerCase() === current;
  }

  /**
   * Reglas UI: no permitir DESHABILITAR el propio usuario ni cuentas administrador.
   * Nota: sí se permite HABILITAR (reactivar) cualquier usuario.
   */
  canDisableUser(usuario: Pick<InUsuarioVista, 'user_username' | 'rol_nombre'>): boolean {
    return !(this.isSelf(usuario.user_username) || this.isAdminRole(usuario.rol_nombre));
  }

  canEnableUser(_usuario: Pick<InUsuarioVista, 'user_username' | 'rol_nombre'>): boolean {
    return true;
  }

  desactivarUsuario(id: any, nombre : string): void {
        // Guardia extra (por si se dispara desde otro lugar)
        const usuarioFila = this.listaUsuarios.find(u => u.user_id === id);
        if (usuarioFila && !this.canDisableUser(usuarioFila)) {
          Swal.fire('Acción no permitida', 'No puedes deshabilitar tu propio usuario ni un administrador.', 'info');
          return;
        }
    
        Swal.fire({
          title: "¿Está seguro que desea desactivar el usuario "+ nombre+ "?",
          text: "El usuario no podrá acceder al sistema. Puede habilitarlo desde la pestaña 'Deshabilitados'",
          icon: "warning",
          showDenyButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, Desactivar Usuario",
          denyButtonText:"Cancelar"
        }).then((result) => {
          if (result.isConfirmed) {
            this.usuarioServ.EliminarUsuario(id).subscribe(
          
              {
                next: res => {
                  // Recargar la lista completa de usuarios
                  this.listarUsuarios();
    
                  Swal.fire({
                    title: "¡Desactivado!",
                    text: "El usuario ha sido desactivado exitosamente",
                    icon: "success"
                  });
                },
                error: err =>{
                 
                  Swal.fire("Error", "No se pudo desactivar el usuario", "error");
                  console.log('ERROR: '+ err.error.error);
                }
      
              });
    
    
            
          }else if (result.isDenied) {
            Swal.fire("Acción cancelada", "El usuario sigue activo", "info");
    
          }
        });
      }

  habilitarUsuario(id: any, nombre: string): void {
    Swal.fire({
      title: `¿Desea habilitar el usuario ${nombre}?`,
      text: 'El usuario podrá volver a acceder al sistema.',
      icon: 'question',
      showDenyButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: 'Sí, Habilitar Usuario',
      denyButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.usuarioServ.ActivarUsuario(id).subscribe({
          next: () => {
            this.listarUsuarios();
            Swal.fire({
              title: '¡Habilitado!',
              text: 'El usuario ha sido habilitado exitosamente',
              icon: 'success'
            });
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo habilitar el usuario', 'error');
            console.log('ERROR: ' + (err?.error?.error ?? err?.message ?? err));
          }
        });
      } else if (result.isDenied) {
        Swal.fire('Acción cancelada', 'El usuario sigue deshabilitado', 'info');
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
    this.listarUsuarios(); // Hacer llamada a la API con el nuevo estado
  }

  /**
   * Aplica filtros de búsqueda (el filtro de estado ahora se hace en la API)
   */
  applyFilters(): void {
    let filtered = [...this.listaUsuarios];
    
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