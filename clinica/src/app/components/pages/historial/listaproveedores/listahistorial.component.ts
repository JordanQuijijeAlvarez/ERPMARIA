import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService } from '../../../../servicios/auditoria.service'; // Asegúrate de la ruta correcta

@Component({
  selector: 'app-listahistorial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listahistorial.component.html',
  styleUrls: ['./listahistorial.component.css']
})
export class ListahistorialComponent implements OnInit {
  
  // == CONTROL DE PESTAÑAS ==
  activeTab: 'cambios' | 'accesos' = 'cambios';

  // == DATOS AUDITORÍA (REALES) ==
  listaAuditoria: any[] = []; // Datos que vienen del API
  loading: boolean = false;

  // == FILTROS ==
  searchTerm: string = '';
  filterOperacion: string = '';
  filterTabla: string = '';

  // == PAGINACIÓN SERVER-SIDE ==
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalPages: number = 0;

  // == MODAL ==
  selectedAudit: any | null = null;

  constructor(private auditoriaService: AuditoriaService) { }

  ngOnInit(): void {
    this.cargarAuditoria();
  }

  // ==========================================
  // LÓGICA DE TABS
  // ==========================================
  switchTab(tab: 'cambios' | 'accesos') {
    this.activeTab = tab;
    // Si quisieras cargar accesos, aquí llamarías a ese servicio
  }

  // ==========================================
  // CARGA DE DATOS (REAL CON API)
  // ==========================================
  cargarAuditoria() {
    this.loading = true;

    // Truco: Como el Backend recibe un solo string de filtro,
    // enviamos el que tenga valor. Prioridad: Buscador > Tabla > Operación
    // Si quisieras filtrar estricto por columna, habría que editar el SP.
    // Por ahora, combinamos para que busque "lo que sea que el usuario ponga"
    let filtroParaEnviar = this.searchTerm;
    if (!filtroParaEnviar && this.filterTabla) filtroParaEnviar = this.filterTabla;
    if (!filtroParaEnviar && this.filterOperacion) filtroParaEnviar = this.filterOperacion;

    this.auditoriaService.listar(this.currentPage, this.itemsPerPage, filtroParaEnviar)
      .subscribe({
        next: (res: any) => {
          this.listaAuditoria = res.data;
          this.totalItems = res.total;
          this.totalPages = res.total_paginas || Math.ceil(this.totalItems / this.itemsPerPage);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando auditoría', err);
          this.loading = false;
        }
      });
  }

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================
  onSearch() {
    this.currentPage = 1; // Siempre volver a pág 1 al filtrar
    this.cargarAuditoria();
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterOperacion = '';
    this.filterTabla = '';
    this.onSearch();
  }

  // ==========================================
  // PAGINACIÓN (SERVER SIDE)
  // ==========================================
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarAuditoria();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarAuditoria();
    }
  }

  changeItemsPerPage(cant: number) {
    this.itemsPerPage = cant;
    this.currentPage = 1;
    this.cargarAuditoria();
  }
  
  getItemRange() {
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return { start, end };
  }

  // ==========================================
  // MODAL Y UTILIDADES
  // ==========================================
  
  verDetalles(audit: any) {
    this.selectedAudit = audit;
  }

  closeModal() {
    this.selectedAudit = null;
  }

  // Ayuda para mostrar JSON bonito en el modal
  formatearJson(jsonString: string): string {
    if (!jsonString) return '(Sin datos / Nulo)';
    try {
      const obj = JSON.parse(jsonString);
      return JSON.stringify(obj, null, 2); // Identación de 2 espacios
    } catch (e) {
      return jsonString; // Si no es JSON, devolver texto plano
    }
  }
}