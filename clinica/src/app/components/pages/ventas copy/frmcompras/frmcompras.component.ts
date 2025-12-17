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
import { InProducto } from '../../../../modelos/modeloProductos/InProducto';
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
  
  // Proveedores
  listaProveedores: any[] = [];          // Todos los datos (Carga inicial)
  listaProveedoresFiltrados: any[] = []; // Resultados de búsqueda
  mostrarDropdownProveedor: boolean = false;
  proveedorId: number = 0;

  // Productos y Detalles
  stockActual: number = 0;
  listaDetalles: any[] = [];
  productoSeleccionado: InProducto | undefined;

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
      txtCodBarra: [''], 
    });

    // Verificar si venimos desde el Dashboard (Stock Bajo)
    const navegacion = this.router.getCurrentNavigation();
    if (navegacion?.extras?.state) {
      const itemsRecibidos = navegacion.extras.state['productosReabastecer'];
      if (itemsRecibidos) {
        this.cargarItemsDesdeDashboard(itemsRecibidos);
      }
    }
  }

  ngOnInit(): void {
    // 1. Cargar lista maestra de proveedores
    this.cargarTodosLosProveedores();

    // 2. Verificar si es edición
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
  // 1. LÓGICA DE PROVEEDOR (EN MEMORIA)
  // ==========================================

  cargarTodosLosProveedores() {
    // Traemos todos los proveedores activos (estado 1)
    this.servicioProveedor.LproveedorEstado(1).subscribe({
      next: (res: any) => {
        const todos = Array.isArray(res) ? res : [res];
        this.listaProveedores = todos;
      },
      error: (err) => console.error('Error cargando proveedores', err)
    });
  }

  // Se ejecuta mientras el usuario escribe
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

  // Se ejecuta al dar Enter o Click en la lupa
  buscarProveedor(): void {
    const termino = this.getRucProveedor.value;
    
    if (!termino) {
      this.alertaServ.info('Atención', 'Ingrese RUC o Nombre para buscar.');
      return;
    }

    // Buscamos coincidencia exacta primero
    const exacto = this.listaProveedores.find(p => 
      p.prove_ruc === termino || p.prove_nombre.toLowerCase() === termino.toLowerCase()
    );

    if (exacto) {
      this.seleccionarProveedor(exacto);
    } else {
      // Si no es exacto, verificamos si hay filtrados
      if (this.listaProveedoresFiltrados.length === 1) {
        this.seleccionarProveedor(this.listaProveedoresFiltrados[0]);
      } else if (this.listaProveedoresFiltrados.length > 1) {
        this.mostrarDropdownProveedor = true;
        this.alertaServ.info('Varias opciones', 'Seleccione un proveedor de la lista.');
      } else {
        this.alertaServ.error('No encontrado', 'No existe proveedor con esos datos.');
        this.limpiarProveedor();
      }
    }
  }

  seleccionarProveedor(proveedor: any) {
    this.proveedorId = proveedor.prove_id;
    
    this.getRucProveedor.setValue(proveedor.prove_ruc); 
    this.getNombreProveedor.setValue(proveedor.prove_nombre);
    
    const direccion = proveedor.prove_direccion || '';
    const telefono = proveedor.prove_telefono || '';
    this.getDatosAdicionales.setValue(`${direccion} - ${telefono}`);
    
    this.mostrarDropdownProveedor = false;
    this.listaProveedoresFiltrados = [];
  }

  cerrarDropdown() {
    // Delay para permitir el click en la lista antes de que desaparezca
    setTimeout(() => {
      this.mostrarDropdownProveedor = false;
    }, 200);
  }

  validarLimpiezaProveedor(valor: string) {
    if (valor === '') {
      this.limpiarProveedor();
    }
  }

  limpiarProveedor() {
    this.proveedorId = 0;
    this.getNombreProveedor.setValue('');
    this.getDatosAdicionales.setValue('');
    this.listaProveedoresFiltrados = [];
    this.mostrarDropdownProveedor = false;
  }

  // ==========================================
  // 2. LÓGICA DE PRODUCTOS (CARRITO)
  // ==========================================

  agregarProducto() {
    const codBarra = this.getCodBarra.value;
    if (!codBarra) return;

    this.servicioProductos.BuscarprodCodBarras(codBarra, 1).subscribe({
      next: (res: any) => {
        if (!res || (Array.isArray(res) && res.length === 0)) {
          this.alertaServ.info('No encontrado', 'Verifique el código de barras.');
          this.getCodBarra.setValue('');
          return;
        }

        const producto = Array.isArray(res) ? res[0] : res;
        this.stockActual = producto.prod_stock; // Referencia visual

        // Verificar si ya está en la lista
        const index = this.listaDetalles.findIndex(item => item.id_producto === producto.prod_id);

        if (index !== -1) {
          this.aumentarCantidad(index);
        } else {
          // Nuevo item
          const nuevoDetalle = {
            id_producto: producto.prod_id,
            codigo: producto.prod_codbarra,
            nombreProducto: producto.prod_nombre,
            // Usamos precio compra si existe, sino 0
            precioCompra: parseFloat(producto.prod_preciocompra) || 0, 
            cantidad: 1,
            subtotal: parseFloat(producto.prod_preciocompra) || 0
          };

          this.listaDetalles.push(nuevoDetalle);
          this.calcularTotales();
        }

        this.getCodBarra.setValue('');
      },
      error: (err) => {
        console.error(err);
        this.alertaServ.error('Error', 'Problema al buscar el producto.');
      }
    });
  }

  // CAMBIO DE PRECIO MANUAL
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
    this.iva = this.subiva; // Para guardar en BD
  }

  // ==========================================
  // 3. GUARDAR COMPRA
  // ==========================================

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
      local_id: 1, // Ajustar según auth
      user_id: 1,  // Ajustar según auth
      compra_total: this.total,
      compra_iva: this.iva,
      compra_subiva: this.subiva, // En algunos sistemas esto es el subtotal base 0
      compra_horafecha: new Date().toISOString(),
      detalle_compra: detalles,
      compra_descripcion: ''
    };
  }

  guardarCompra() {
    if (this.formCompras.invalid) {
      this.alertaServ.info('Datos incompletos', 'Verifique el proveedor.');
      this.formCompras.markAllAsTouched();
      return;
    }
    if (this.proveedorId === 0) {
      this.alertaServ.info('Proveedor requerido', 'Seleccione un proveedor válido.');
      return;
    }
    if (this.listaDetalles.length === 0) {
      this.alertaServ.info('Carrito vacío', 'Agregue productos.');
      return;
    }

    const compraObjeto = this.crearObjetoCompra();

    if (this.eventoUpdate) {
      this.servicioCompras.ActualizarCompra(compraObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Actualizado', 'Orden modificada correctamente');
          this.router.navigate(['home/listarCompras']);
        },
        error: (err) => {
          this.alertaServ.error('Error', 'No se pudo actualizar.');
          console.error(err);
        }
      });
    } else {
      this.servicioCompras.CrearCompra(compraObjeto).subscribe({
        next: () => {
          this.alertaServ.success('Éxito', 'Orden registrada correctamente');
          this.router.navigate(['home/listarCompras']);
        },
        error: (err) => {
          this.alertaServ.error('Error', 'No se pudo registrar.');
          console.error(err);
        }
      });
    }
  }

  // ==========================================
  // 4. MÉTODOS AUXILIARES
  // ==========================================

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
      error: () => {
        this.alertaServ.error('Error', 'No se pudo cargar la compra.');
        this.router.navigate(['home/listarCompras']);
      }
    });
  }

  cargarItemsDesdeDashboard(items: any[]) {
    items.forEach(item => {
      this.listaDetalles.push({
        id_producto: item.prod_id,
        codigo: item.prod_codbarra,
        nombreProducto: item.prod_nombre,
        precioCompra: parseFloat(item.prod_preciocompra) || 0,
        cantidad: item.cantidad_sugerida,
        subtotal: (parseFloat(item.prod_preciocompra) || 0) * item.cantidad_sugerida
      });
    });
    this.calcularTotales();
    this.alertaServ.info('Carga Automática', `Se añadieron ${items.length} productos del inventario.`);
  }

  cancelarCompra() {
    this.router.navigate(['home/listarCompras']);
  }

  // Getters
  get getRucProveedor() { return this.formCompras.controls['txtRucProveedor']; }
  get getNombreProveedor() { return this.formCompras.controls['txtNombreProveedor']; }
  get getDatosAdicionales() { return this.formCompras.controls['txtDatosAdicionales']; }
  get getCodBarra() { return this.formCompras.controls['txtCodBarra']; }
}