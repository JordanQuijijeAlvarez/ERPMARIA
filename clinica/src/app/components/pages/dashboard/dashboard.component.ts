import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../servicios/authservicio.service';
import { DirectivasModule } from '../../../directivas/directivas.module';
import { RouterLink, RouterModule } from '@angular/router';
import { productosService } from '../../../servicios/productos.service';
import { AlertService } from '../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Asegúrate de inyectarlo en el constructor
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';
@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule,BaseChartDirective],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
listaAlertas: any[] = [];
  mostrarModalPrecios: boolean = false;

  // Variables Nuevas
kpiVentas: any = { venta_hoy: 0, venta_ayer: 0, transacciones_hoy: 0 };
listaSinMovimiento: any[] = [];
mostrarModalSinMovimiento: boolean = false;

  constructor(
    
    private productoService: productosService,
    private alertaServ: AlertService,
        private router: Router,

  ) {

    Chart.register(...registerables);
  }

  listaStockBajo: any[] = [];
  mostrarModalStock: boolean = false;
  seleccionadosStock: any[] = []; // Nuestro "carrito" temporal


  ngOnInit(): void {
    this.cargarAlertas();
    this.cargarStockBajo();
     this.cargarAlertas();     // Precios (Ya tenías)
    this.cargarStockBajo();   // Stock (Ya tenías)
    
    // NUEVOS
    this.cargarKPIVentas();
    this.cargarSinMovimiento();

        this.cargarGraficos();

            this.cargarDatosGrafico(7); // Carga inicial


  }

  cargarStockBajo() {
    this.productoService.obtenerStockBajo().subscribe({
      next: (res: any) => {
        // Agregamos propiedad 'selected' para los checkboxes del modal
        this.listaStockBajo = res.map((item: any) => ({ ...item, selected: false }));
      },
      error: (err) => console.error(err)
    });
  }

  irACompraConItems() {
    // 1. Filtramos los que el usuario marcó con el checkbox
    const itemsParaComprar = this.listaStockBajo.filter(x => x.selected);

    if (itemsParaComprar.length === 0) {
      this.alertaServ.info('Vacío', 'Seleccione al menos un producto para reponer.');
      return;
    }

    // 2. Navegamos a la ruta de "Crear Compra" pasando los datos en el 'state'
    this.router.navigate(['home/crearCompra'], { 
      state: { productosReabastecer: itemsParaComprar } 
    });
  }






  cargarAlertas() {
    this.productoService.LproductosPrecioNovedad().subscribe({
      next: (res: any) => {
        // AQUÍ ESTÁ EL TRUCO:
        // Mapeamos la respuesta para crear la propiedad 'nuevo_precio'
        // y la inicializamos con el 'precio_sugerido' que viene de la BD.
        this.listaAlertas = res.map((item: any) => ({
          ...item,
          nuevo_precio: item.precio_sugerido // Pre-llenado inteligente
        }));
      },
      error: (err) => console.error('Error cargando alertas', err)
    });
  }

  abrirModalPrecios() {
    this.mostrarModalPrecios = true;
  }

  cerrarModalPrecios() {
    this.mostrarModalPrecios = false;
  }

  guardarPrecioIndividual(item: any) {
    // 1. Validación básica
    if (!item.nuevo_precio || item.nuevo_precio <= 0) {
      this.alertaServ.info('Inválido', 'Ingrese un precio válido');
      return;
    }

    // 2. Validación de rentabilidad (Opcional: Advertir si sigue perdiendo)
    if (item.nuevo_precio <= item.prod_preciocompra) {
      this.alertaServ.info('Cuidado', 'El precio sigue siendo menor o igual al costo.');
      // No retornamos, dejamos que guarde si el usuario insiste, o pones return
    }

    // 3. Preparar objeto
    const datos = {
      prod_id: item.prod_id,
      nuevo_precio: item.nuevo_precio
    };

    // 4. Llamar al servicio
    this.productoService.ActualizarPrecio(datos).subscribe({
      next: (res) => {
        this.alertaServ.success('Actualizado', `Precio de ${item.prod_nombre} corregido.`);
        
        // 5. EFECTO VISUAL: Eliminar fila de la lista localmente
        this.listaAlertas = this.listaAlertas.filter(x => x.prod_id !== item.prod_id);

        // Si ya no quedan alertas, cerramos el modal automáticamente
        if (this.listaAlertas.length === 0) {
          this.cerrarModalPrecios();
        }
      },
      error: (err) => {
        this.alertaServ.error('Error', 'No se pudo actualizar el precio.');
      }
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
  // CONFIGURACIÓN GRÁFICO 1: VENTAS (Líneas)
  // ==========================================
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [], // Se llenará con los días (Lunes, Martes...)
    datasets: [
      {
        data: [], // Se llenará con los montos
        label: 'Ventas ($)',
        fill: true,
        tension: 0.4, // Curvatura de la línea
        borderColor: '#2563EB', // Azul
        backgroundColor: 'rgba(37, 99, 235, 0.1)'
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };

  // ==========================================
  // CONFIGURACIÓN GRÁFICO 2: TOP PRODUCTOS (Barras)
  // ==========================================
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Nombres de productos
    datasets: [
      { 
        data: [], 
        label: 'Unidades Vendidas',
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'] // Colores variados
      }
    ]
  };
  public barChartOptions: ChartOptions<'bar'> = { responsive: true };

  // ==========================================
  // CONFIGURACIÓN GRÁFICO 3: FINANZAS (Donut)
  // ==========================================
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Ingresos (Ventas)', 'Gastos (Compras)'],
    datasets: [
      { 
        data: [0, 0], 
        backgroundColor: ['#10B981', '#EF4444'], // Verde vs Rojo
        hoverOffset: 4
      }
    ]
  };



  

  cargarGraficos() {
    // 1. Cargar Ventas
    this.productoService.obtenerGraficoVentas(7).subscribe((res: any) => {
      this.lineChartData.labels = res.map((x: any) => x.dia_nombre); // eje X
      this.lineChartData.datasets[0].data = res.map((x: any) => x.total_vendido); // eje Y
      // Truco para refrescar el gráfico en Angular
      this.lineChartData = { ...this.lineChartData }; 
    });

    // 2. Cargar Top Productos
    this.productoService.obtenerGraficoTop().subscribe((res: any) => {
      this.barChartData.labels = res.map((x: any) => x.prod_nombre);
      this.barChartData.datasets[0].data = res.map((x: any) => x.cantidad_total);
      this.barChartData = { ...this.barChartData };
    });

    // 3. Cargar Finanzas
    this.productoService.obtenerGraficoFinanzas().subscribe((res: any) => {
      this.doughnutChartData.datasets[0].data = [res.total_ingresos, res.total_gastos];
      this.doughnutChartData = { ...this.doughnutChartData };
    });
  }

  // Variable para saber qué botón pintar de azul (UX)
  rangoSeleccionado: number = 7; 

 

  // Método que llama el botón
  cambiarRango(dias: number) {
    this.rangoSeleccionado = dias;
    this.cargarDatosGrafico(dias);
  }

  cargarDatosGrafico(dias: number) {
    this.productoService.obtenerGraficoVentas(dias).subscribe((res: any) => {
      
      // Actualizamos etiquetas y datos
      this.lineChartData.labels = res.map((x: any) => x.dia_nombre);
      this.lineChartData.datasets[0].data = res.map((x: any) => x.total_vendido);
      
      // Cambiamos el texto de la etiqueta para que se vea pro
      this.lineChartData.datasets[0].label = `Ventas (Últimos ${dias} días)`;

      // IMPORTANTE: Forzamos la actualización visual del gráfico
      this.lineChartData = { ...this.lineChartData };
    });
  }
}





