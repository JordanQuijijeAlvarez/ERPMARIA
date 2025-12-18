import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// SERVICIOS
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { clienteService } from '../../../../servicios/clientes.service';
import { productosService } from '../../../../servicios/productos.service';
import { ventaService } from '../../../../servicios/ventas.service';

// MODELOS
import { InProducto } from '../../../../modelos/modeloProductos/InProducto';
import { InDetalleVenta, InVentaCompleto } from '../../../../modelos/modeloVentas/InVentas';

@Component({
  selector: 'app-frmventas',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  templateUrl: './frmventas.component.html',
  styleUrl: './frmventas.component.css'
})
export class FrmventasComponent implements OnInit {

  // ==========================================
  // VARIABLES DE ESTADO (CLIENTES)
  // ==========================================
  listaClientes: any[] = [];
  listaClientesFiltrados: any[] = [];
  mostrarDropdownCliente: boolean = false;
  clienteId: number = 0;

  // ==========================================
  // VARIABLES DE ESTADO (PRODUCTOS)
  // ==========================================
  listaProductos: any[] = [];
  listaProductosFiltrados: any[] = [];
  mostrarDropdownProducto: boolean = false;
  productoBusquedaControl: FormControl<any> | undefined;
  stockActual: any = 0;

  // ==========================================
  // VARIABLES GENERALES
  // ==========================================
  listaDetalles: any[] = [];
  iva: number = 15;
  subiva: number = 0;
  subtotal: number = 0;
  total: number = 0;
  
  formVentas: FormGroup;
  eventoUpdate = false;
  codigoventa: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private ServicioVentas: ventaService,
    private ServicioCliente: clienteService,
    private ServicioProductos: productosService,
    private alertaServ: AlertService
  ) {
    this.formVentas = this.formBuilder.group({
      txtCedulaCliente: [''],
      txtNombreCliente: ['', Validators.required],
      txtDatosAdicionales: ['', Validators.required],
      txtCodBarra: [''],
    });
  }

  ngOnInit(): void {
    // 1. Cargar Catálogos en Memoria
    this.cargarTodosLosClientes();
    this.cargarTodosLosProductos();

    // 2. Verificar si es edición
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      if (id) {
        this.eventoUpdate = true;
        this.codigoventa = parseInt(id);
        this.cargarVentaParaEditar(this.codigoventa); 
      }
    });
  }

  // ==========================================
  // 1. LÓGICA DE CLIENTES (AUTOCOMPLETE)
  // ==========================================

  cargarTodosLosClientes() {
    // Asumo que tienes un método para listar todos o activos
    this.ServicioCliente.LclienteEstado('1').subscribe({
      next: (res: any) => {
        this.listaClientes = Array.isArray(res) ? res : [res];
      },
      error: (err) => console.error('Error cargando clientes', err)
    });
  }

  filtrarClientes(termino: string) {
    if (!termino) {
      this.listaClientesFiltrados = [];
      this.mostrarDropdownCliente = false;
      return;
    }

    const term = termino.toLowerCase();
    
    this.listaClientesFiltrados = this.listaClientes.filter(cli => 
      (cli.client_cedula && cli.client_cedula.toLowerCase().includes(term)) || 
      (cli.client_nombres && cli.client_nombres.toLowerCase().includes(term))
    );

    this.mostrarDropdownCliente = this.listaClientesFiltrados.length > 0;
  }

  seleccionarCliente(cliente: any) {
    this.clienteId = cliente.client_id;
    this.getCedulaCliente.setValue(cliente.client_cedula);
    this.getNombreCliente.setValue(cliente.client_nombres);
    this.getDatosAddCliente.setValue(cliente.client_direccion || 'Sin dirección');
    
    this.mostrarDropdownCliente = false;
    this.listaClientesFiltrados = [];
  }

  buscarClienteManual() {
    const termino = this.getCedulaCliente.value;
    if (!termino) {
      this.alertaServ.info('Atención', 'Ingrese Cédula o Nombre del cliente.');
      return;
    }

    // Prioridad: Coincidencia exacta de cédula
    const exacto = this.listaClientes.find(c => c.client_cedula === termino);
    
    if (exacto) {
      this.seleccionarCliente(exacto);
    } else {
      if (this.listaClientesFiltrados.length === 1) {
        this.seleccionarCliente(this.listaClientesFiltrados[0]);
      } else if (this.listaClientesFiltrados.length > 1) {
        this.mostrarDropdownCliente = true;
        this.alertaServ.info('Múltiples coincidencias', 'Seleccione un cliente de la lista.');
      } else {
        this.alertaServ.error('No encontrado', 'Cliente no registrado.');
        this.limpiarCliente();
      }
    }
  }

  cerrarDropdownCliente() {
    setTimeout(() => { this.mostrarDropdownCliente = false; }, 200);
  }

  validarLimpiezaCliente(valor: string) {
    if (valor === '') this.limpiarCliente();
  }

  limpiarCliente() {
    this.clienteId = 0;
    this.getNombreCliente.setValue('');
    this.getDatosAddCliente.setValue('');
    this.listaClientesFiltrados = [];
    this.mostrarDropdownCliente = false;
  }

  // ==========================================
  // 2. LÓGICA DE PRODUCTOS (AUTOCOMPLETE)
  // ==========================================

  cargarTodosLosProductos() {
    this.ServicioProductos.LproductosEstado(1).subscribe({
      next: (res: any) => {
        const todos = Array.isArray(res) ? res : [res];
        
        // Filtro Anti-Duplicados por ID
        const unicos = [
          ...new Map(todos.map((item: any) => [item.prod_id, item])).values()
        ];
        
        this.listaProductos = unicos;
      },
      error: (err) => console.error('Error productos', err)
    });
  }

  filtrarProductos(termino: string) {
    if (!termino) {
      this.listaProductosFiltrados = [];
      this.mostrarDropdownProducto = false;
      return;
    }

    const term = termino.toLowerCase();
    
    this.listaProductosFiltrados = this.listaProductos.filter(prod => 
      (prod.prod_nombre && prod.prod_nombre.toLowerCase().includes(term)) || 
      (prod.prod_codbarra && prod.prod_codbarra.toLowerCase().includes(term))
    );

    this.listaProductosFiltrados = this.listaProductosFiltrados.slice(0, 10);
    this.mostrarDropdownProducto = this.listaProductosFiltrados.length > 0;
  }

  seleccionarProducto(producto: any) {
    this.procesarAgregadoProducto(producto);
    this.limpiarBuscadorProducto();
  }

  agregarProductoManual() {
    const termino = this.getCodBarras.value;
    if (!termino) return;

    // 1. Búsqueda exacta (Código Barras)
    let producto = this.listaProductos.find(p => p.prod_codbarra === termino);

    // 2. Si no es exacto, vemos si hay filtrados
    if (!producto && this.listaProductosFiltrados.length === 1) {
      producto = this.listaProductosFiltrados[0];
    }

    if (producto) {
      this.procesarAgregadoProducto(producto);
      this.limpiarBuscadorProducto();
    } else {
      this.alertaServ.error('No encontrado', 'Verifique el código o seleccione de la lista.');
    }
  }

  procesarAgregadoProducto(producto: any) {
    this.stockActual = producto.prod_stock;

    if (this.stockActual <= 0) {
      this.alertaServ.error('Sin Stock', `El producto "${producto.prod_nombre}" está agotado.`);
      return;
    }

    const index = this.listaDetalles.findIndex(item => item.id_producto === producto.prod_id);

    if (index !== -1) {
      // Validar stock antes de sumar
      if (this.listaDetalles[index].cantidad + 1 > this.stockActual) {
         this.alertaServ.info('Stock Máximo', 'No hay más unidades disponibles.');
         return;
      }
      this.aumentarCantidad(index);
      this.alertaServ.success('Agregado', `+1 ${producto.prod_nombre}`);
    } else {
      const nuevoDetalle = {
        id_producto: producto.prod_id,
        codigo: producto.prod_codbarra,
        nombreProducto: producto.prod_nombre,
        precioUnitario: parseFloat(producto.prod_precioventa) || 0,
        cantidad: 1,
        subtotal: parseFloat(producto.prod_precioventa) || 0
      };
      this.listaDetalles.push(nuevoDetalle);
      this.calcularTotales();
    }
  }

  limpiarBuscadorProducto() {
    this.getCodBarras.setValue('');
    this.listaProductosFiltrados = [];
    this.mostrarDropdownProducto = false;
  }

  cerrarDropdownProducto() {
    setTimeout(() => { this.mostrarDropdownProducto = false; }, 200);
  }

  // ==========================================
  // 3. LÓGICA CARRITO Y TOTALES
  // ==========================================

  aumentarCantidad(index: number) {
    const item = this.listaDetalles[index];
    item.cantidad++;
    item.subtotal = item.cantidad * item.precioUnitario;
    this.calcularTotales();
  }

  disminuirCantidad(index: number) {
    const item = this.listaDetalles[index];
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.cantidad * item.precioUnitario;
      this.calcularTotales();
    } else {
      this.eliminarProducto(index);
    }
  }

  eliminarProducto(index: number) {
    this.listaDetalles.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.listaDetalles.reduce((acc, item) => acc + item.subtotal, 0);
    this.subiva = this.subtotal * (this.iva / 100);
    this.total = this.subtotal + this.subiva;
  }

  // ==========================================
  // 4. GUARDAR Y EDICIÓN
  // ==========================================

  crearObjetoVenta(): InVentaCompleto {
    const detalles: InDetalleVenta[] = this.listaDetalles.map(item => ({
      detv_id: 0,
      venta_id: this.eventoUpdate ? this.codigoventa : 0,
      prod_id: item.id_producto,
      detv_cantidad: item.cantidad,
      detv_subtotal: item.subtotal,
      detv_estado: 1
    }));

    return {
      venta_id: this.eventoUpdate ? this.codigoventa : 0,
      venta_horafecha: new Date().toISOString(),
      venta_subiva: this.subiva,
      venta_iva: this.iva,
      venta_total: this.total,
      local_id: 1,
      cliente_id: this.clienteId,
      user_id: 1,
      venta_descripcion: '',
      detalle_venta: detalles
    };
  }

  guardarVenta() {
    if (this.formVentas.invalid || this.clienteId === 0) {
      this.alertaServ.info('Datos faltantes', 'Seleccione un cliente válido.');
      this.formVentas.markAllAsTouched();
      return;
    }
    if (this.listaDetalles.length === 0) {
      this.alertaServ.info('Carrito vacío', 'Agregue productos.');
      return;
    }

    const ventaObjeto = this.crearObjetoVenta();

    if (this.eventoUpdate) {
      this.ServicioVentas.ActualizarVenta(this.codigoventa, ventaObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Actualizado', 'Venta modificada correctamente');
          this.router.navigate(['home/listarVentas']);
        },
        error: () => this.alertaServ.error('Error', 'No se pudo actualizar.')
      });
    } else {
      this.ServicioVentas.CrearVenta(ventaObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Registrado', 'Venta creada exitosamente');
          this.router.navigate(['home/listarVentas']);
        },
        error: () => this.alertaServ.error('Error', 'No se pudo registrar.')
      });
    }
  }

  cargarVentaParaEditar(idVenta: number) {
    this.ServicioVentas.ObtenerVentaPorId(idVenta).subscribe({
      next: (res: any) => {
        // Cabecera
        this.clienteId = res.cliente_id;
        this.getCedulaCliente.setValue(res.cliente_cedula || res.cedula); 
        this.getNombreCliente.setValue(res.cliente_nombres || res.nombres);
        this.getDatosAddCliente.setValue(res.cliente_direccion || res.direccion);

        // Detalles
        if (res.detalle_venta) {
          this.listaDetalles = res.detalle_venta.map((item: any) => ({
            id_producto: item.prod_id,
            codigo: item.prod_codbarra || 'N/A', 
            nombreProducto: item.prod_nombre, 
            precioUnitario: parseFloat(item.detv_precio_unitario || item.prod_precio),
            cantidad: item.detv_cantidad,
            subtotal: parseFloat(item.detv_subtotal)
          }));
        }
        this.calcularTotales();
      },
      error: () => {
        this.alertaServ.error('Error', 'No se pudo cargar la venta');
        this.router.navigate(['home/listarVentas']);
      }
    });
  }

  cancelarVenta() {
    this.router.navigate(['home/listarVentas']);
  }

  // Getters
  get getCedulaCliente() { return this.formVentas.controls['txtCedulaCliente']; }
  get getNombreCliente() { return this.formVentas.controls['txtNombreCliente']; }
  get getDatosAddCliente() { return this.formVentas.controls['txtDatosAdicionales']; }
  get getCodBarras() { return this.formVentas.controls['txtCodBarra']; }
}