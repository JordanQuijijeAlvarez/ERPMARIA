import { Component, OnInit } from '@angular/core';
import { Auditoria } from '../../../../modelos/modelHistorial/InHistorial'; // Tu modelo existente
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { FormsModule } from '@angular/forms';

// == INTERFAZ PARA SESIONES (Puedes mover esto a tu carpeta de modelos) ==
export interface Sesion {
  sesion_id: number;
  usuario_nombre: string;
  ip_address: string;
  user_agent: string;
  created_at: Date;
  last_activity: Date;
  is_active: number; // 1 = online, 0 = offline
}

@Component({
  selector: 'app-listahistorial',
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule], // Standalone Component
  templateUrl: './listahistorial.component.html',
  styleUrls: ['./listahistorial.component.css']
})
export class ListahistorialComponent implements OnInit {
  
  // == CONTROL DE PESTAÑAS (TABS) ==
  activeTab: 'cambios' | 'accesos' = 'cambios'; // Por defecto muestra auditoría

  // == DATOS AUDITORÍA (CAMBIOS) ==
  allAuditoria: Auditoria[] = []; 
  paginatedAuditoria: Auditoria[] = [];
  filteredAuditoria: Auditoria[] = [];

  // == DATOS SESIONES (ACCESOS) ==
  listaSesiones: Sesion[] = [];

  // == FILTROS AUDITORÍA ==
  searchTerm: string = '';
  filterOperacion: string = '';
  filterTabla: string = '';

  // == PAGINACIÓN AUDITORÍA ==
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // == MODAL ==
  selectedAudit: Auditoria | null = null;

  constructor() { }

  ngOnInit(): void {
    this.cargarDatosMock();    // Cargar Auditoría
    this.cargarSesionesMock(); // Cargar Sesiones
  }

  // ==========================================
  // LÓGICA DE TABS
  // ==========================================
  switchTab(tab: 'cambios' | 'accesos') {
    this.activeTab = tab;
  }

  // ==========================================
  // CARGA DE DATOS (MOCK)
  // ==========================================
  cargarDatosMock() {
    // Ejemplo de datos de Auditoría
    this.allAuditoria = [
      {
        audi_id: 1,
        audi_tabla: 'PRODUCTO',
        audi_registroid: 105,
        audi_operacion: 'INSERT',
        audi_datonuevo: '{"nombre": "Arroz", "precio": 2.50}',
        user_id: 2,
        usuario_nombre: 'JORDAN QUIJIJE',
        audi_fechregistro: new Date()
      },
      {
        audi_id: 2,
        audi_tabla: 'USUARIO',
        audi_registroid: 4,
        audi_operacion: 'UPDATE',
        audi_datoantig: '{"estado": "1"}',
        audi_datonuevo: '{"estado": "0"}',
        user_id: 1,
        usuario_nombre: 'Admin Sistema',
        audi_fechregistro: new Date('2024-12-14T10:00:00')
      },
      {
        audi_id: 3,
        audi_tabla: 'PROVEEDOR',
        audi_registroid: 22,
        audi_operacion: 'DELETE',
        audi_datoantig: '{"nombre": "Coca Cola", "ruc": "123..."}',
        user_id: 1,
        usuario_nombre: 'Admin Sistema',
        audi_fechregistro: new Date('2024-12-13T15:30:00')
      }
    ];
    this.applyFilters();
  }

  cargarSesionesMock() {
    // Ejemplo de datos de Sesiones
    this.listaSesiones = [
      {
        sesion_id: 101,
        usuario_nombre: 'JORDAN QUIJIJE',
        ip_address: '192.168.100.15',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        created_at: new Date(),
        last_activity: new Date(),
        is_active: 1
      },
      {
        sesion_id: 102,
        usuario_nombre: 'Admin Sistema',
        ip_address: '192.168.100.20',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
        created_at: new Date('2024-12-14T14:20:00'),
        last_activity: new Date('2024-12-14T16:00:00'),
        is_active: 0
      },
      {
        sesion_id: 103,
        usuario_nombre: 'Vendedor 01',
        ip_address: '10.0.0.5',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36...',
        created_at: new Date('2024-12-15T09:00:00'),
        last_activity: new Date('2024-12-15T09:30:00'),
        is_active: 1
      }
    ];
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA (SOLO AUDITORÍA)
  // ==========================================
  onSearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredAuditoria = this.allAuditoria.filter(item => {
      const matchSearch = !this.searchTerm || 
        item.usuario_nombre?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.audi_id.toString().includes(this.searchTerm);
      
      const matchOp = !this.filterOperacion || item.audi_operacion === this.filterOperacion;
      const matchTab = !this.filterTabla || item.audi_tabla === this.filterTabla;

      return matchSearch && matchOp && matchTab;
    });

    this.totalItems = this.filteredAuditoria.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePagination();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterOperacion = '';
    this.filterTabla = '';
    this.onSearch();
  }

  // ==========================================
  // PAGINACIÓN
  // ==========================================
  updatePagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAuditoria = this.filteredAuditoria.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  changeItemsPerPage(cant: number) {
    this.itemsPerPage = cant;
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.updatePagination();
  }
  
  getItemRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  // ==========================================
  // UTILIDADES Y MODAL
  // ==========================================
  
  verDetalles(audit: Auditoria) {
    this.selectedAudit = audit;
  }

  closeModal() {
    this.selectedAudit = null;
  }

  // Detectar sistema operativo/navegador básico para mostrar icono y texto limpio
  parseUserAgent(ua: string): string {
    if (!ua) return 'Dispositivo Desconocido';
    if (ua.includes('Windows')) return 'PC Windows';
    if (ua.includes('Macintosh')) return 'Mac OS';
    if (ua.includes('Linux') && !ua.includes('Android')) return 'PC Linux';
    if (ua.includes('Android')) return 'Móvil Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Apple';
    return 'Navegador Web';
  }
}