import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../../directivas/directivas.module';
import { clienteService } from '../../../../servicios/clientes.service';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';
import { CajaService } from '../../../../servicios/caja.service';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { AuditoriaService } from '../../auditoria.service';

@Component({
    selector: 'app-listarauditorias',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
    templateUrl: './listarauditorias.component.html',
    styleUrl: './listarauditorias.component.css'
})
export class ListarAuditoriasComponent implements OnInit {



listaAuditoria: any[] = [];
  
  // Paginación y Filtros
  page: number = 1;
  size: number = 10;
  totalRegistros: number = 0;
  filtro: string = '';
  loading: boolean = false;

  constructor(private auditoriaService: AuditoriaService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.loading = true;
    this.auditoriaService.listar(this.page, this.size, this.filtro).subscribe({
      next: (res) => {
        this.listaAuditoria = res.data;
        this.totalRegistros = res.total;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // Evento al escribir en el buscador
  buscar() {
    this.page = 1; // Resetear a primera página al buscar
    this.cargarDatos();
  }

  cambiarPagina(delta: number) {
    this.page += delta;
    this.cargarDatos();
  }

  // Ayuda visual para parsear el JSON y mostrarlo bonito (opcional)
  formatearJson(jsonString: string): string {
    if (!jsonString) return '---';
    try {
      const obj = JSON.parse(jsonString);
      // Retorna el JSON formateado con identación HTML
      return JSON.stringify(obj, null, 2); 
    } catch (e) {
      return jsonString;
    }
  }
  



}