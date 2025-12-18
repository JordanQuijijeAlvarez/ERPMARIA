import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
import Swal from 'sweetalert2';

// Servicios
import { productosService } from '../../../servicios/productos.service';
import { AlertService } from '../../../servicios/Alertas/alertas.service';
import { DirectivasModule } from '../../../directivas/directivas.module';

declare var bootstrap: any; // Declaramos bootstrap para evitar errores de TS

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asumo que es standalone por tu código anterior
  imports: [CommonModule, RouterModule, DirectivasModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  // ==========================================
  // VARIABLES DE ESTADO
  // ==========================================
  
  // Alertas de Precio
  listaAlertas: any[] = [];
  mostrarModalPrecios: boolean = false;

  // Stock Bajo
  listaStockBajo: any[] = [];
  mostrarModalStock: boolean = false;
  
  // KPIs y Sin Movimiento
  kpiVentas: any = { venta_hoy: 0, venta_ayer: 0, transacciones_hoy: 0 };
  listaSinMovimiento: any[] = [];
  
  // Gráficos (Control de UI)
  rangoSeleccionado: number = 7;

  // ==========================================
  // CONFIGURACIÓN DE GRÁFICOS (Chart.js)
  // ==========================================
  
  // 1. Líneas (Ventas)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ventas ($)',
        fill: true,
        tension: 0.4,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = { 
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2
  };

  // 2. Barras (Top Productos)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { 
        data: [], 
        label: 'Unidades Vendidas',
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = { 
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2
  };

  // 3. Donut (Finanzas)
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Ingresos (Ventas)', 'Gastos (Compras)'],
    datasets: [
      { 
        data: [0, 0], 
        backgroundColor: ['#10B981', '#EF4444'],
        hoverOffset: 4
      }
    ]
  };
  public doughnutChartOptions: ChartOptions<'doughnut'> = { 
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5
  };

  // ==========================================
  // CONSTRUCTOR E INICIALIZACIÓN
  // ==========================================
  constructor(
    private productoService: productosService,
    private alertaServ: AlertService,
    private router: Router
  ) {
    // Registrar componentes de gráficos
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    // 1. Cargar Datos Básicos
    this.cargarAlertas();
    this.cargarStockBajo();
    
    // 2. Cargar KPIs Avanzados
    this.cargarKPIVentas();
    this.cargarSinMovimiento();

    // 3. Cargar Gráficos
    this.cargarGraficosEsticos(); // Barras y Donut
    this.cargarDatosGraficoVentas(7); // Línea de tiempo (7 días por defecto)
  }

  // ==========================================
  // MÉTODOS DE CARGA DE DATOS (API)
  // ==========================================

  cargarAlertas() {
    this.productoService.LproductosPrecioNovedad().subscribe({
      next: (res: any) => {
        // Pre-llenamos 'nuevo_precio' con el sugerido
        this.listaAlertas = res.map((item: any) => ({
          ...item,
          nuevo_precio: item.precio_sugerido 
        }));
      },
      error: (err) => console.error('Error cargando alertas', err)
    });
  }

  cargarStockBajo() {
    this.productoService.obtenerStockBajo().subscribe({
      next: (res: any) => {
        // Agregamos 'selected' para los checkboxes
        this.listaStockBajo = res.map((item: any) => ({ ...item, selected: false }));
      },
      error: (err) => console.error(err)
    });
  }

  cargarKPIVentas() {
    this.productoService.obtenerKPIVentas().subscribe({
      next: (res) => this.kpiVentas = res,
      error: (err) => console.error(err)
    });
  }

  cargarSinMovimiento() {
    this.productoService.obtenerSinMovimiento().subscribe({
      next: (res: any) => this.listaSinMovimiento = res,
      error: (err) => console.error(err)
    });
  }

  // ==========================================
  // LOGICA DE GRÁFICOS
  // ==========================================

  cargarGraficosEsticos() {
    // Cargar Top Productos (Barras)
    this.productoService.obtenerGraficoTop().subscribe((res: any) => {
      this.barChartData.labels = res.map((x: any) => x.prod_nombre);
      this.barChartData.datasets[0].data = res.map((x: any) => x.cantidad_total);
      this.barChartData = { ...this.barChartData }; // Force update
    });

    // Cargar Finanzas (Donut)
    this.productoService.obtenerGraficoFinanzas().subscribe((res: any) => {
      this.doughnutChartData.datasets[0].data = [res.total_ingresos, res.total_gastos];
      this.doughnutChartData = { ...this.doughnutChartData }; // Force update
    });
  }

  // Carga dinámica del gráfico de líneas según rango (7, 15, 30 días)
  cargarDatosGraficoVentas(dias: number) {
    this.productoService.obtenerGraficoVentas(dias).subscribe((res: any) => {
      this.lineChartData.labels = res.map((x: any) => x.dia_nombre);
      this.lineChartData.datasets[0].data = res.map((x: any) => x.total_vendido);
      this.lineChartData.datasets[0].label = `Ventas (Últimos ${dias} días)`;
      this.lineChartData = { ...this.lineChartData };
    });
  }

  cambiarRango(dias: number) {
    this.rangoSeleccionado = dias;
    this.cargarDatosGraficoVentas(dias);
  }

  // ==========================================
  // CONTROL DE MODALES (BOOTSTRAP)
  // ==========================================

  // --- Modal PRECIOS ---
  abrirModalPrecios() {
    const modalDiv = document.getElementById('modalPreciosBootstrap');
    if (modalDiv) {
      const myModal = new bootstrap.Modal(modalDiv);
      myModal.show();
    }
  }

  cerrarModalPrecios() {
    const modalDiv = document.getElementById('modalPreciosBootstrap');
    if (modalDiv) {
      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      if (modalInstance) modalInstance.hide();
    }
  }

  // --- Modal STOCK (NUEVO) ---
  abrirModalStock() {
    const modalDiv = document.getElementById('modalStockBootstrap');
    if (modalDiv) {
      const myModal = new bootstrap.Modal(modalDiv);
      myModal.show();
    }
  }

  cerrarModalStock() {
    const modalDiv = document.getElementById('modalStockBootstrap');
    if (modalDiv) {
      const modalInstance = bootstrap.Modal.getInstance(modalDiv);
      if (modalInstance) modalInstance.hide();
    }
  }

  // ==========================================
  // MODAL SIN MOVIMIENTO (SWEETALERT2)
  // ==========================================
  abrirModalSinMovimiento() {
    if (this.listaSinMovimiento.length === 0) return;

    let htmlTabla = `
      <div style="overflow-x: auto; max-height: 300px;">
        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.9rem;">
          <thead style="position: sticky; top: 0; background: #f3f4f6;">
            <tr>
              <th style="padding: 8px; color: #6b7280;">Producto</th>
              <th style="padding: 8px; text-align: center; color: #6b7280;">$ Congelado</th>
              <th style="padding: 8px; text-align: center; color: #6b7280;">Días</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.listaSinMovimiento.forEach(item => {
      htmlTabla += `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px;">
            <div style="font-weight: bold; color: #1f2937;">${item.prod_nombre}</div>
            <div style="font-size: 0.75rem; color: #9ca3af;">${item.prod_codbarra}</div>
          </td>
          <td style="padding: 8px; text-align: center; color: #dc2626; font-weight: bold;">
            $${item.capital_congelado.toFixed(2)}
          </td>
          <td style="padding: 8px; text-align: center;">
            <span style="background: #f3e8ff; color: #7e22ce; padding: 2px 8px; border-radius: 99px; font-size: 0.75rem; font-weight: bold;">
              ${item.dias_inactivo} días
            </span>
          </td>
        </tr>
      `;
    });

    htmlTabla += `</tbody></table></div>`;

    Swal.fire({
      title: '<strong>Productos Estancados</strong>',
      icon: 'info',
      html: htmlTabla,
      showCloseButton: true,
      focusConfirm: false,
      confirmButtonText: '<i class="fas fa-thumbs-up"></i> Entendido',
      confirmButtonColor: '#9333ea',
      width: '600px'
    });
  }

  // ==========================================
  // ACCIONES DE NEGOCIO
  // ==========================================

  // Guardar Ajuste de Precio
  guardarPrecioIndividual(item: any) {
    if (!item.nuevo_precio || item.nuevo_precio <= 0) {
      Swal.fire('Atención', 'Ingrese un precio válido', 'warning');
      return;
    }

    const datos = { prod_id: item.prod_id, nuevo_precio: item.nuevo_precio };
    
    this.productoService.ActualizarPrecio(datos).subscribe({
      next: () => {
        this.mostrarToastExito(`Precio de ${item.prod_nombre} actualizado`);
        // Quitamos el item de la lista localmente para no recargar todo
        this.listaAlertas = this.listaAlertas.filter(x => x.prod_id !== item.prod_id);
        
        // Si ya no quedan alertas, cerramos el modal automáticamente
        if (this.listaAlertas.length === 0) {
           this.cerrarModalPrecios();
           Swal.fire('¡Excelente!', 'Todos los precios han sido ajustados.', 'success');
        }
      },
      error: () => Swal.fire('Error', 'No se pudo guardar', 'error')
    });
  }

  // Generar Compra desde Stock Bajo
  irACompraConItems() {
    const itemsParaComprar = this.listaStockBajo.filter(x => x.selected);

    if (itemsParaComprar.length === 0) {
      this.alertaServ.info('Vacío', 'Seleccione al menos un producto para reponer.');
      return;
    }

    // Cerramos el modal antes de irnos
    this.cerrarModalStock();

    // Navegamos pasando los datos
    this.router.navigate(['home/crearCompra'], { 
      state: { productosReabastecer: itemsParaComprar } 
    });
  }

  // Helper para Toast
  mostrarToastExito(mensaje: string) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    });
    Toast.fire({ icon: 'success', title: mensaje });
  }
}