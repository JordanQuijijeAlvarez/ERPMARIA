import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../servicios/authservicio.service';
import { DirectivasModule } from '../../../directivas/directivas.module';
import { RouterLink, RouterModule } from '@angular/router';
import { productosService } from '../../../servicios/productos.service';
import { AlertService } from '../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, RouterModule, DirectivasModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
listaAlertas: any[] = [];
  mostrarModalPrecios: boolean = false;

  constructor(
    private productoService: productosService,
    private alertaServ: AlertService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
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
}
