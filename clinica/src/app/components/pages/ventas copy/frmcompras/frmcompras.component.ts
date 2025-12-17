import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// SERVICIOS
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ProveedorService } from '../../../../servicios/proveedores.service';
import { compraService } from '../../../../servicios/compras.service';
import { productosService } from '../../../../servicios/productos.service';

// MODELOS
import { InCompraCompleto, InDetalleCompra } from '../../../../modelos/modeloCompras/InCompras';

@Component({
  selector: 'app-frmcompras',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  templateUrl: './frmcompras.component.html',
  styleUrl: './frmcompras.component.css'
})
export class FrmComprasComponent implements OnInit {

  // ==========================================
  // VARIABLES DE ESTADO
  // ==========================================
  
  // Proveedores (Buscador)
  listaProveedores: any[] = [];
  listaProveedoresFiltrados: any[] = [];
  mostrarDropdownProveedor: boolean = false;
  proveedorId: number = 0;

  // Productos (Buscador Inteligente)
  listaProductos: any[] = [];           // Todos los productos cargados
  listaProductosFiltrados: any[] = [];  // Resultados del filtro
  mostrarDropdownProducto: boolean = false;
  stockActual: number = 0;

  // Detalle de Compra
  listaDetalles: any[] = [];

  // Totales
  ivaPorcentaje: number = 15;
  iva: number = 0;
  subiva: number = 0;
  subtotal: number = 0;
  total: number = 0;

  // Formulario y Control
  formCompras: FormGroup;
  eventoUpdate = false;
  codigoCompra: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertaServ: AlertService,
    private servicioCompras: compraService,
    private servicioProveedor: ProveedorService,
    private servicioProductos: productosService
  ) {
    this.formCompras = this.formBuilder.group({
      txtRucProveedor: ['', Validators.required],
      txtNombreProveedor: ['', Validators.required],
      txtDatosAdicionales: [''], 
      txtCodBarra: [''], // Input del buscador de productos
    });

    const navegacion = this.router.getCurrentNavigation();
    if (navegacion?.extras?.state) {
      const itemsRecibidos = navegacion.extras.state['productosReabastecer'];
      if (itemsRecibidos) {
        this.cargarItemsDesdeDashboard(itemsRecibidos);
      }
    }
  }

  ngOnInit(): void {
    // 1. Cargar Catálogos en Memoria (Optimización)
    this.cargarTodosLosProveedores();
    this.cargarTodosLosProductos();

    // 2. Verificar Edición
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      if (id) {
        this.eventoUpdate = true;
        this.codigoCompra = parseInt(id);
        this.cargarCompraParaEditar(this.codigoCompra); 
      }
    });
  }

  // ==========================================
  // 1. LÓGICA DE PROVEEDOR
  // ==========================================
  cargarTodosLosProveedores() {
    this.servicioProveedor.LproveedorEstado(1).subscribe({
      next: (res: any) => {
        this.listaProveedores = Array.isArray(res) ? res : [res];
      },
      error: (err) => console.error(err)
    });
  }

  filtrarProveedores(termino: string) {
    if (!termino) {
      this.listaProveedoresFiltrados = [];
      this.mostrarDropdownProveedor = false;
      return;
    }
    const term = termino.toLowerCase();
    this.listaProveedoresFiltrados = this.listaProveedores.filter(prov => 
      (prov.prove_ruc && prov.prove_ruc.toLowerCase().includes(term)) || 
      (prov.prove_nombre && prov.prove_nombre.toLowerCase().includes(term))
    );
    this.mostrarDropdownProveedor = this.listaProveedoresFiltrados.length > 0;
  }

  seleccionarProveedor(proveedor: any) {
    this.proveedorId = proveedor.prove_id;
    this.getRucProveedor.setValue(proveedor.prove_ruc); 
    this.getNombreProveedor.setValue(proveedor.prove_nombre);
    const dir = proveedor.prove_direccion || '';
    const tel = proveedor.prove_telefono || '';
    this.getDatosAdicionales.setValue(`${dir} - ${tel}`);
    this.mostrarDropdownProveedor = false;
    this.listaProveedoresFiltrados = [];
  }

  buscarProveedorManual() {
    // Busca exacto al dar enter
    const termino = this.getRucProveedor.value;
    if (!termino) return;
    
    const exacto = this.listaProveedores.find(p => p.prove_ruc === termino);
    if (exacto) {
        this.seleccionarProveedor(exacto);
    } else {
        this.alertaServ.info('No encontrado', 'Seleccione un proveedor de la lista.');
    }
  }

  cerrarDropdownProveedor() {
    setTimeout(() => { this.mostrarDropdownProveedor = false; }, 200);
  }

  validarLimpiezaProveedor(valor: string) {
    if (valor === '') {
      this.proveedorId = 0;
      this.getNombreProveedor.setValue('');
      this.getDatosAdicionales.setValue('');
    }
  }

// ==========================================
  // 2. LÓGICA DE PRODUCTOS (CORREGIDA)
  // ==========================================

  cargarTodosLosProductos() {
    // Cargamos productos activos (estado 1)
    this.servicioProductos.LproductosEstado(1).subscribe({
      next: (res: any) => {
        const todos = Array.isArray(res) ? res : [res];

        // --- FILTRO ANTI-DUPLICADOS ---
        // Usamos un Map para dejar solo un registro por cada 'prod_id' único.
        // Esto elimina cualquier producto repetido que venga del servidor.
        const productosUnicos = [
          ...new Map(todos.map((item: any) => [item.prod_id, item])).values()
        ];

        this.listaProductos = productosUnicos;
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  // Filtra mientras escribes (Nombre o Código)
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

    // Limitamos a 10 resultados para no saturar la vista
    this.listaProductosFiltrados = this.listaProductosFiltrados.slice(0, 10);
    this.mostrarDropdownProducto = this.listaProductosFiltrados.length > 0;
  }

  // Se ejecuta al hacer CLICK en el dropdown
  seleccionarProducto(producto: any) {
    this.procesarAgregadoProducto(producto);
    this.limpiarBuscadorProducto();
  }

  // Se ejecuta al dar ENTER o click en botón "Agregar"
  agregarProductoManual() {
    const termino = this.getCodBarra.value;
    if (!termino) return;

    // 1. Buscamos coincidencia exacta de código de barras (Prioridad para lector de barras)
    let producto = this.listaProductos.find(p => p.prod_codbarra === termino);

    // 2. Si no es código exacto, miramos si hay uno solo en la lista filtrada (por nombre)
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

  // Método común para añadir al carrito
  procesarAgregadoProducto(producto: any) {
    this.stockActual = producto.prod_stock; // Referencia visual momentánea

    // Verificar si ya existe en la tabla
    const index = this.listaDetalles.findIndex(item => item.id_producto === producto.prod_id);

    if (index !== -1) {
      // Si existe, aumentamos cantidad
      this.aumentarCantidad(index);
      this.alertaServ.success('Agregado', `+1 ${producto.prod_nombre}`);
    } else {
      // Nuevo item
      const nuevoDetalle = {
        id_producto: producto.prod_id,
        codigo: producto.prod_codbarra,
        nombreProducto: producto.prod_nombre,
        precioCompra: parseFloat(producto.prod_preciocompra) || 0,
        cantidad: 1,
        subtotal: parseFloat(producto.prod_preciocompra) || 0
      };

      this.listaDetalles.push(nuevoDetalle);
      this.calcularTotales();
    }
  }

  limpiarBuscadorProducto() {
    this.getCodBarra.setValue('');
    this.listaProductosFiltrados = [];
    this.mostrarDropdownProducto = false;
    // Opcional: devolver foco al input si se requiere escanear seguido
  }

  cerrarDropdownProducto() {
    setTimeout(() => { this.mostrarDropdownProducto = false; }, 200);
  }

  // ... (Resto de métodos: actualizarPrecioUnitario, aumentarCantidad, guardarCompra, etc.) ...
  // ... (MANTENER IGUAL QUE EN TU VERSIÓN ANTERIOR) ...

  actualizarPrecioUnitario(index: number) {
    const item = this.listaDetalles[index];
    let nuevoPrecio = parseFloat(item.precioCompra);
    if (isNaN(nuevoPrecio) || nuevoPrecio < 0) nuevoPrecio = 0;
    item.precioCompra = nuevoPrecio;
    item.subtotal = item.cantidad * item.precioCompra;
    this.calcularTotales();
  }

  aumentarCantidad(index: number) {
    const item = this.listaDetalles[index];
    item.cantidad++;
    item.subtotal = item.cantidad * item.precioCompra;
    this.calcularTotales();
  }

  disminuirCantidad(index: number) {
    const item = this.listaDetalles[index];
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.cantidad * item.precioCompra;
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
    this.subiva = this.subtotal * (this.ivaPorcentaje / 100);
    this.total = this.subtotal + this.subiva;
    this.iva = this.subiva;
  }

  crearObjetoCompra(): InCompraCompleto {
    const detalles: InDetalleCompra[] = this.listaDetalles.map(item => ({
        detc_id: 0,
        compra_id: this.eventoUpdate ? this.codigoCompra : 0,
        prod_id: item.id_producto,
        detc_preciouni: item.precioCompra,
        detc_cantidad: item.cantidad,
        detc_subtotal: item.subtotal
     }));

    return {
      compra_id: this.eventoUpdate ? this.codigoCompra : 0,
      prove_id: this.proveedorId,
      local_id: 1,
      user_id: 1,
      compra_total: this.total,
      compra_iva: this.iva,
      compra_subiva: this.subiva,
      compra_horafecha: new Date().toISOString(),
      detalle_compra: detalles,
      compra_descripcion: ''
    };
  }

  guardarCompra() {
    if (this.formCompras.invalid || this.proveedorId === 0) {
      this.alertaServ.info('Faltan datos', 'Revise proveedor o campos obligatorios.');
      return;
    }
    if (this.listaDetalles.length === 0) {
      this.alertaServ.info('Vacío', 'Agregue productos.');
      return;
    }

    const compraObjeto = this.crearObjetoCompra();

    if (this.eventoUpdate) {
      this.servicioCompras.ActualizarCompra(compraObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Actualizado', 'Orden modificada correctamente');
          this.router.navigate(['home/listarCompras']);
        },
        error: (err) => this.alertaServ.error('Error', 'No se pudo actualizar.')
      });
    } else {
      this.servicioCompras.CrearCompra(compraObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Registrado', 'Orden creada exitosamente');
          this.router.navigate(['home/listarCompras']);
        },
        error: (err) => this.alertaServ.error('Error', 'No se pudo registrar.')
      });
    }
  }

  cargarCompraParaEditar(idCompra: number) {
    this.servicioCompras.ObtenerCompraPorId(idCompra).subscribe({
      next: (res: any) => {
        this.proveedorId = parseInt(res.prove_id);
        this.getRucProveedor.setValue(res.prove_ruc);
        this.getNombreProveedor.setValue(res.prove_nombre);
        this.getDatosAdicionales.setValue(res.prove_direccion);

        if (res.detalle_compra) {
          this.listaDetalles = res.detalle_compra.map((item: any) => ({
            id_producto: item.prod_id,
            codigo: item.prod_codbarra || 'N/A',
            nombreProducto: item.prod_nombre, 
            precioCompra: parseFloat(item.detc_preciouni),
            cantidad: item.detc_cantidad,
            subtotal: parseFloat(item.detc_subtotal)
          }));
          this.calcularTotales();
        }
      },
      error: () => this.router.navigate(['home/listarCompras'])
    });
  }

  cargarItemsDesdeDashboard(items: any[]) {
    items.forEach(item => {
      this.procesarAgregadoProducto({
        prod_id: item.prod_id,
        prod_codbarra: item.prod_codbarra,
        prod_nombre: item.prod_nombre,
        prod_preciocompra: item.prod_preciocompra,
        prod_stock: item.prod_stock
      });
      // Ajuste cantidad si viene sugerida
      const ultimo = this.listaDetalles[this.listaDetalles.length -1];
      ultimo.cantidad = item.cantidad_sugerida || 1;
      ultimo.subtotal = ultimo.cantidad * ultimo.precioCompra;
    });
    this.calcularTotales();
  }

  cancelarCompra() {
    this.router.navigate(['home/listarCompras']);
  }

  get getRucProveedor() { return this.formCompras.controls['txtRucProveedor']; }
  get getNombreProveedor() { return this.formCompras.controls['txtNombreProveedor']; }
  get getDatosAdicionales() { return this.formCompras.controls['txtDatosAdicionales']; }
  get getCodBarra() { return this.formCompras.controls['txtCodBarra']; }
}