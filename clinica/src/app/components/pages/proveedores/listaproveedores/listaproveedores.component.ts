import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// IMPORTANTE: Asegúrate de importar tu servicio de proveedores y el modelo correcto
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
// import { ProveedorService } from '../../../../servicios/proveedores.service'; // <--- CAMBIAR ESTO POR TU SERVICIO REAL
// import { InProveedor } from '../../../../modelos/modelProveedores/InProveedor'; // <--- CAMBIAR ESTO POR TU MODELO REAL

// Mock del servicio para evitar errores de compilación en este ejemplo.
// Debes usar tu servicio real 'ProveedorService'

import { ProveedorService } from '../../../../servicios/proveedores.service';
import { InProveedor } from '../../../../modelos/modelProveedor/InProveedor';
import { ModalReportePdfComponent, ConfiguracionReporte } from '../../../shared/modal-reporte-pdf/modal-reporte-pdf.component';

@Component({
  selector: 'app-listaproveedores',
  standalone: true, // Asumo que es standalone por los imports directos
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule, ModalReportePdfComponent],
  templateUrl: './listaproveedores.component.html',
  styleUrl: './listaproveedores.component.css'
})
export class ListaproveedoresComponent implements OnInit {

  listaProveedores: InProveedor[] = [];
  filteredProveedores: InProveedor[] = []; 
  paginatedProveedores: InProveedor[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  totalItems: number = 0;

  // Propiedades para búsqueda
  searchTerm: string = '';
  isSearching: boolean = false;

  // Propiedades para el modal de reportes
  mostrarModalReporte: boolean = false;
  configuracionReporte!: ConfiguracionReporte;

  constructor(
    private http: HttpClient,
    private router: Router,
     private ServicioProveedor: ProveedorService, // <--- DESCOMENTAR Y USAR TU SERVICIO
    private ServicioAlertas: AlertService
  ) {}

  ngOnInit(): void {
    this.listarProveedores();
  }

  listarProveedores(): void {
    // NOTA: Ajusta el nombre del método según tu servicio (ej. ListarProveedores, GetProveedores)
    // Si tu backend filtra por estado, mantén el argumento, si no, quítalo.
    
    // Simulación de llamada (Reemplaza con this.ServicioProveedor.Listar()...)
     this.ServicioProveedor.LproveedorEstado(1).subscribe({
      next: (res) => {
        this.listaProveedores = res;
        this.filteredProveedores = [...res]; 
        this.totalItems = this.filteredProveedores.length;
        this.calculatePagination();
        this.updatePaginatedData();
      },
      error: (err) => {
         console.error('Error al listar', err);
      }
    });
  }

  /**
   * Calcula los valores de paginación
   */
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1; // Prevenir página 0
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
    this.paginatedProveedores = this.filteredProveedores.slice(startIndex, endIndex);
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
    if (this.totalItems === 0) return { start: 0, end: 0 };
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  /**
   * Realiza la búsqueda de proveedores
   * Filtra por: RUC, NOMBRE, TELEFONO
   */
  onSearch(searchValue: string): void {
    this.searchTerm = searchValue.toLowerCase().trim();
    this.isSearching = this.searchTerm.length > 0;
    
    if (this.isSearching) {
      this.filteredProveedores = this.listaProveedores.filter(proveedor => 
        proveedor.prove_ruc.toLowerCase().includes(this.searchTerm) ||
        proveedor.prove_nombre.toLowerCase().includes(this.searchTerm) ||
        (proveedor.prove_telefono && proveedor.prove_telefono.toLowerCase().includes(this.searchTerm))
      );
    } else {
      this.filteredProveedores = [...this.listaProveedores];
    }
    
    // Actualizar paginación después de filtrar
    this.totalItems = this.filteredProveedores.length;
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
    this.filteredProveedores = [...this.listaProveedores];
    this.totalItems = this.filteredProveedores.length;
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

  /**
   * Eliminar Proveedor
   * Se usa PROVE_RUC como identificador según tu estructura
   */
  eliminarProveedor(id: any, nombre: string): void {
    this.ServicioAlertas.confirm(
      'CONFIRMAR ACCIÓN',
      '¿Está seguro que desea eliminar el registro de ' + nombre + '?',
      'Si, eliminar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        
        // REEMPLAZAR CON TU SERVICIO REAL:
                        const user_id = parseInt(localStorage.getItem('user_id') ?? '1');

         this.ServicioProveedor.EliminarProveedor(id,user_id).subscribe({
          next: (res) => {
            this.listaProveedores = this.listaProveedores.filter(
              (proveedor) => proveedor.prove_id !== id
            );

            // Actualizar la búsqueda si está activa
            if (this.isSearching) {
              this.onSearch(this.searchTerm);
            } else {
              this.filteredProveedores = [...this.listaProveedores];
              this.totalItems = this.filteredProveedores.length;
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
   * Helper para refrescar vistas
   */
  private refrescarDespuesDeAccion(): void {
    if (this.isSearching) {
      this.onSearch(this.searchTerm);
    } else {
      this.filteredProveedores = [...this.listaProveedores];
      this.totalItems = this.filteredProveedores.length;
      this.calculatePagination();
      this.updatePaginatedData();
    }
  }

  ActualizarProveedor(id: any): void {
    this.router.navigate(['home/actualizarProveedor', id]);
  }

  // Métodos para el modal de reportes
  abrirModalReporte() {
    this.configuracionReporte = {
      titulo: 'REPORTE DE PROVEEDORES',
      nombreArchivo: 'Reporte_Proveedores',
      columnas: ['RUC', 'Nombre', 'Contacto', 'Teléfono', 'Email', 'Dirección'],
      datosOriginales: this.listaProveedores,
      nombreEntidad: 'proveedores',
      campoFecha: 'prove_fechregistro',
      empresa: {
        nombre: 'Minimarket Maria',
        ruc: '094847366001',
        direccion: 'PASAJE Y JUNIN ESQUINA',
        telefono: '0989847332',
        email: 'facturacionmaria@gmail.com'
      },
      formatearFila: (proveedor: any) => {
        return [
          proveedor.prove_ruc || 'N/A',
          proveedor.prove_nombre || 'N/A',
          proveedor.prove_descripcion || 'N/A',
          proveedor.prove_telefono || 'N/A',
          proveedor.prove_correo || 'N/A',
          proveedor.prove_direccion || 'N/A'
        ];
      }
    };
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte() {
    this.mostrarModalReporte = false;
  }
}