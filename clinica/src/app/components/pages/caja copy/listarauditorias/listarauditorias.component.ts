import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../../servicios/auditoria.service';
// Si usas directivas personalizadas, mantenlo; si no, quítalo.
import { DirectivasModule } from '../../../../directivas/directivas.module'; 

@Component({
  selector: 'app-listarauditorias',
  standalone: true,
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
  templateUrl: './listarauditorias.component.html',
  styleUrl: './listarauditorias.component.css'
})
export class ListarAuditoriasComponent implements OnInit {

  // === ESTADO DE LA VISTA ===
  activeTab: 'datos' | 'sesiones' = 'datos';
  loading: boolean = false;
  
  // === DATOS ===
  listaAuditoria: any[] = [];
  listaSesiones: any[] = []; 
selectedAudit: any = null;
  // === PAGINACIÓN Y FILTROS ===
  page: number = 1;      // En el HTML se usa como currentPage
  size: number = 10;     // En el HTML se usa como itemsPerPage
  totalRegistros: number = 0; // En el HTML se usa como totalItems
  
  // Filtros
  filtro: string = '';          // Mapeado a searchTerm en el HTML
  filterOperacion: string = ''; // Nuevo filtro del HTML
  filterTabla: string = '';     // Nuevo filtro del HTML

  constructor(private auditoriaService: AuditoriaService) { 
    console.log('>>> Constructor: Componente ListarAuditorias iniciado');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ==========================================
  // LÓGICA DE PESTAÑAS
  // ==========================================
  switchTab(tab: 'datos' | 'sesiones') {
    if (this.activeTab === tab) return;

    this.activeTab = tab;
    
    // Resetear variables al cambiar de pestaña
    this.page = 1;
    this.filtro = '';
    this.filterOperacion = '';
    this.filterTabla = '';
    this.totalRegistros = 0;
    this.listaAuditoria = [];
    this.listaSesiones = [];
    this.selectedAudit = null;

    this.cargarDatos();
  }

  // ==========================================
  // CARGA DE DATOS (Backend)
  // ==========================================
  cargarDatos() {
    this.loading = true;
    console.log(`>>> Cargando [${this.activeTab}] Página: ${this.page}`);

    if (this.activeTab === 'datos') {
      // Nota: Si quieres usar filterOperacion y filterTabla en el backend, 
      // deberás actualizar tu servicio para enviarlos. 
      // Por ahora, enviamos 'filtro' como búsqueda general.
      const busquedaCombinada = this.filtro; 

      this.auditoriaService.listar(this.page, this.size, busquedaCombinada).subscribe({
        next: (res: any) => {
          this.listaAuditoria = res.data || [];
          this.totalRegistros = res.total || (res.pagination ? res.pagination.total : 0);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando auditoría:', err);
          this.loading = false;
        }
      });

    } else {
      // Lógica de Sesiones
      this.auditoriaService.getAuditoriaSesiones(this.page, this.size, this.filtro).subscribe({
        next: (res: any) => {
          this.listaSesiones = res.data || [];
          this.totalRegistros = res.total || (res.pagination ? res.pagination.total : 0);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando sesiones:', err);
          this.loading = false;
        }
      });
    }
  }

  // ==========================================
  // MÉTODOS PARA EL HTML (Template Bindings)
  // ==========================================

  // Alias para la búsqueda (llamado desde el HTML)
  onSearch() {
    this.page = 1;
    this.cargarDatos();
  }

  // Alias para limpiar filtros
  clearFilters() {
    this.filtro = '';
    this.filterOperacion = '';
    this.filterTabla = '';
    this.onSearch();
  }

  // Abrir Modal
  verDetalles(audit: any) {
    this.selectedAudit = audit;
  }

  // Cerrar Modal
  closeModal() {
    this.selectedAudit = null;
  }

  // Getter para calcular el total de páginas
  get totalPages(): number {
    return Math.ceil(this.totalRegistros / this.size) || 1;
  }

  // Aliases para paginación del HTML
  previousPage() {
    this.cambiarPagina(-1);
  }

  nextPage() {
    this.cambiarPagina(1);
  }

  cambiarPagina(delta: number) {
    const nuevaPagina = this.page + delta;
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages) {
      this.page = nuevaPagina;
      this.cargarDatos();
    }
  }

  // Cambio de tamaño de página (dropdown 10, 25, 50)
  changeItemsPerPage(newSize: number) {
    this.size = newSize;
    this.page = 1;
    this.cargarDatos();
  }

  // Calcula "Mostrando 1-10 de 50"
  getItemRange() {
    const start = ((this.page - 1) * this.size) + 1;
    const end = Math.min(this.page * this.size, this.totalRegistros);
    return { start, end };
  }

  // Utilidad para JSON
  formatearJson(jsonString: any): string {
    if (!jsonString) return '---';
    try {
      const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(obj, null, 2); 
    } catch (e) {
      return String(jsonString);
    }
  }

  // Getters para mapear variables del HTML a las del TS (Compatibilidad)
  // Esto permite que el HTML use 'searchTerm' y 'currentPage' sin cambiar todo el código
  get searchTerm(): string { return this.filtro; }
  set searchTerm(v: string) { this.filtro = v; }

  get currentPage(): number { return this.page; }
  get itemsPerPage(): number { return this.size; }
  get totalItems(): number { return this.totalRegistros; }
}