import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditoriaService } from '../../../../servicios/auditoria.service';
// Si no usas directivas personalizadas en este HTML específico, puedes quitar DirectivasModule para probar
import { DirectivasModule } from '../../../../directivas/directivas.module'; 

@Component({
  selector: 'app-listarauditorias',
  standalone: true,
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
  templateUrl: './listahistorial.component.html',
  styleUrl: './listahistorial.component.css'
})
export class ListahistorialComponent implements OnInit {

  // Tipado estricto para evitar errores de asignación
activeTab: 'datos' | 'sesiones' | 'fallos' = 'datos';
  listaAuditoria: any[] = [];
  listaSesiones: any[] = []; 
  listaFallos: any[] = []; // <--- NUEVA LISTA

  page: number = 1;
  size: number = 10;
  totalRegistros: number = 0;
  filtro: string = '';
  loading: boolean = false;
  selectedAudit: any = null;

  constructor(private auditoriaService: AuditoriaService) { 
    console.log('>>> Constructor: Componente ListarAuditorias iniciado');
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cambiar pestaña
  switchTab(tab: 'datos' | 'sesiones' | 'fallos') {
    // 1. Log inicial para confirmar que el clic entró
    console.log('>>> CLICK DETECTADO. Cambiando a:', tab);

    // 2. Si ya estamos en esa pestaña, no hacemos nada (opcional)
    if (this.activeTab === tab) {
        console.log('>>> Ya estás en la pestaña ' + tab);
        return;
    }

    this.activeTab = tab;

    // 3. Resetear variables
    this.page = 1;
    this.filtro = '';
    this.totalRegistros = 0;
    this.listaAuditoria = [];
    this.listaSesiones = [];
    this.listaFallos = []; 

    // 4. Cargar datos
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    console.log(`>>> Cargando datos para [${this.activeTab}]...`);

    if (this.activeTab === 'datos') {
      // --- LOGICA DE DATOS ---
      this.auditoriaService.listar(this.page, this.size, this.filtro).subscribe({
        next: (res: any) => {
          console.log('>>> Datos recibidos:', res);
          this.listaAuditoria = res.data || [];
          this.totalRegistros = res.total || (res.pagination ? res.pagination.total : 0);
          this.loading = false;
        },
        error: (err) => {
          console.error('>>> Error en Datos:', err);
          this.loading = false;
        }
      });

    } else if (this.activeTab === 'sesiones') {
      // --- LOGICA DE SESIONES ---
      this.auditoriaService.getAuditoriaSesiones(this.page, this.size, this.filtro).subscribe({
        next: (res: any) => {
          console.log('>>> Sesiones recibidas:', res);
          this.listaSesiones = res.data || [];
          this.totalRegistros = res.total || (res.pagination ? res.pagination.total : 0);
          this.loading = false;
        },
        error: (err) => {
          console.error('>>> Error en Sesiones:', err);
          this.loading = false;
        }
      });
    }else
    {

      // --- LÓGICA NUEVA: FALLOS ---
       this.auditoriaService.getFallos(this.page, this.size, this.filtro).subscribe({
         next: (res: any) => {
           this.listaFallos = res.data || [];
           this.totalRegistros = res.total || (res.pagination ? res.pagination.total : 0);
           this.loading = false;
         },
         error: (err) => {
           console.error('Error cargando fallos:', err);
           this.loading = false;
         }
       });
    }
    }
  

  buscar() {
    this.page = 1;
    this.cargarDatos();
  }

  cambiarPagina(delta: number) {
    const nuevaPagina = this.page + delta;
    if (nuevaPagina >= 1) {
      this.page = nuevaPagina;
      this.cargarDatos();
    }
  }

  formatearJson(jsonString: any): string {
    if (!jsonString) return '---';
    try {
      const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      return JSON.stringify(obj, null, 2); 
    } catch (e) {
      return String(jsonString);
    }
  }
}