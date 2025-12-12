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
import { ProveedorService } from '../../../../servicios/proveedores.service'; // Tu servicio de proveedores

// MODELOS
import { InProducto } from '../../../../modelos/modeloProductos/InProducto';
import { compraService } from '../../../../servicios/compras.service';
import { productosService } from '../../../../servicios/productos.service';
import { InCompraCompleto, InDetalleCompra } from '../../../../modelos/modeloCompras/InCompras';

@Component({
  selector: 'app-frmcompras',
  standalone: true, // Si es standalone
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  templateUrl: './frmcompras.component.html', // Verifica nombre de archivo
  styleUrl: './frmcompras.component.css'      // Verifica nombre de archivo
})
export class FrmComprasComponent implements OnInit {

  // Variables de control visual
  stockActual: number = 0;
  listaDetalles: any[] = [];
  
  // Totales
  ivaPorcentaje: number = 15; // Ajustable
  iva: number = 0;
  subtotal: number = 0;
  total: number = 0;

  // Formulario
  formCompras: FormGroup;
  eventoUpdate = false;
  
  // IDs Relacionados
  proveedorId: number = 0;
  productoSeleccionado: InProducto | undefined;
  codigoCompra: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertaServ: AlertService,
    // Inyección de servicios
    private servicioCompras: compraService,
    private servicioProveedor: ProveedorService,
    private servicioProductos: productosService,
  ) {
    this.formCompras = this.formBuilder.group({
      txtRucProveedor: ['', Validators.required],
      txtNombreProveedor: ['', Validators.required], // Solo lectura
      txtDatosAdicionales: [''], // Dirección/Teléfono
      txtCodBarra: [''], // Buscador productos
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');
      if (id) {
        this.eventoUpdate = true;
        this.codigoCompra = parseInt(id);
        this.cargarCompraParaEditar(this.codigoCompra); 
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  // ==========================================
  // LÓGICA DE PROVEEDOR
  // ==========================================
  buscarProveedor(): void {
    const ruc = this.getRucProveedor.value;
    if (!ruc) return;

    // Usamos el método que busca por RUC y estado '1' (activo)
    this.servicioProveedor.LproveedorRucEstado(ruc, '1').subscribe({
      next: (res: any) => {
        if (res) {
          this.proveedorId = res.PROVE_ID || res.prove_id; // Ajusta según tu BD (Oracle devuelve mayúsculas a veces)
          this.getNombreProveedor.setValue(res.PROVE_NOMBRE || res.prove_nombre);
          this.getDatosAdicionales.setValue((res.PROVE_DIRECCION || res.prove_direccion) + ' - ' + (res.PROVE_TELEFONO || res.prove_telefono));
        } else {
          this.alertaServ.info('No encontrado', 'No existe un proveedor activo con ese RUC.');
          this.limpiarProveedor();
        }
      },
      error: (err) => {
        this.alertaServ.error('Error', 'No se encontró el proveedor o hubo un error de conexión.');
        this.limpiarProveedor();
      },
    });
  }

  limpiarProveedor() {
    this.proveedorId = 0;
    this.getNombreProveedor.setValue('');
    this.getDatosAdicionales.setValue('');
  }

  // ==========================================
  // LÓGICA DE PRODUCTOS
  // ==========================================
  agregarProducto() {
    const codBarra = this.getCodBarra.value;
    if (!codBarra) return;

    this.servicioProductos.BuscarprodCodBarras(codBarra, 1).subscribe({
      next: (res: any) => {
        // Validación de existencia
        if (!res || (Array.isArray(res) && res.length === 0)) {
          this.alertaServ.info('Producto no encontrado', 'Verifique el código de barras.');
          this.getCodBarra.setValue('');
          return;
        }

        // Si el servicio devuelve un array, tomamos el primero
        const producto = Array.isArray(res) ? res[0] : res;
        this.productoSeleccionado = producto;
        this.stockActual = producto.prod_stock; // Solo referencia visual

        // Buscar si ya existe en la lista para sumar cantidad
        const indiceExistente = this.listaDetalles.findIndex(item => item.id_producto === producto.prod_id);

        if (indiceExistente !== -1) {
          this.aumentarCantidad(indiceExistente);
        } else {
          // Agregar nuevo item a la lista
          const nuevoDetalle = {
            id_producto: producto.prod_id,
            codigo: producto.prod_codbarra,
            nombreProducto: producto.prod_nombre,
            // IMPORTANTE: En compras usamos el PRECIO DE COMPRA (Costos)
            // Si tu producto no tiene precio_compra, usa 0 o habilita edición
            precioCompra: producto.prod_preciocompra || 0, 
            cantidad: 1,
            subtotal: producto.prod_preciocompra || 0
          };

          this.listaDetalles.push(nuevoDetalle);
          this.calcularTotales();
        }

        // Limpiar buscador
        this.getCodBarra.setValue('');
        this.productoSeleccionado = undefined;
        this.stockActual = 0;
      },
      error: (err) => {
        console.error(err);
        this.alertaServ.error('Error', 'Problema al consultar producto.');
      }
    });
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
    // Calcular IVA
    this.iva = this.subtotal * (this.ivaPorcentaje / 100);
    this.total = this.subtotal + this.iva;
  }

  // ==========================================
  // GUARDAR COMPRA
  // ==========================================
  crearObjetoCompra(): InCompraCompleto {
    // Mapeo de detalles para el backend
    const detalles: InDetalleCompra[] = this.listaDetalles.map(item => ({
        detc_id: 0, // Generalmente se manda 0 y el backend decide si borra e inserta de nuevo o actualiza
        compra_id: this.eventoUpdate ? this.codigoCompra : 0, // <--- AQUÍ EL CAMBIO IMPORTANTE
        prod_id: item.id_producto,
        detc_cantidad: item.cantidad,
        detc_subtotal: item.subtotal,
        detc_estado: 1
    }));

    const objCompra: InCompraCompleto = {
      compra_id: this.eventoUpdate ? this.codigoCompra : 0,
      prove_id: this.proveedorId,
      local_id: 1, // ID fijo o del usuario logueado
      user_id: 1, // ID del usuario logueado
      compra_total: this.total,
      compra_iva: this.iva,
      compra_horafecha: new Date().toISOString(), // Fecha actual
      detalle_compra: detalles,
      compra_subiva: 0,
      compra_descripcion: ''
    };

    return objCompra;
  }

  guardarCompra() {
    // Validaciones básicas
    if (this.formCompras.invalid) {
      this.alertaServ.info('Datos incompletos', 'Complete la información del proveedor.');
      this.marcarCamposComoTocados();
      return;
    }
    if (this.proveedorId === 0) {
      this.alertaServ.info('Proveedor requerido', 'Busque y seleccione un proveedor válido.');
      return;
    }
    if (this.listaDetalles.length === 0) {
      this.alertaServ.info('Carrito vacío', 'Agregue al menos un producto a la orden.');
      return;
    }

    const compraObjeto = this.crearObjetoCompra();

    if (this.eventoUpdate) {
      // ACTUALIZAR (Solo si está permitido editar compras)
      this.servicioCompras.ActualizarCompra(this.codigoCompra, compraObjeto).subscribe({
        next: (res) => {
          this.alertaServ.success('Actualizado', 'Orden de compra modificada correctamente');
          this.router.navigate(['home/listacompras']);
        },
        error: (err) => {
          this.alertaServ.error('Error', 'No se pudo actualizar la compra');
          console.error(err);
        }
      });
    } else {
      // REGISTRAR NUEVA
      this.servicioCompras.CrearCompra(compraObjeto).subscribe({
        next: (res) => {
          this.alertaServ.success('Éxito', 'Orden de compra registrada (Pendiente de recepción)');
          this.router.navigate(['home/listacompras']);
        },
        error: (err) => {
          this.alertaServ.error('Error', 'No se pudo registrar la compra');
          console.error(err);
        }
      });
    }
  }

  // ==========================================
  // CARGAR PARA EDICIÓN
  // ==========================================
  cargarCompraParaEditar(idCompra: number) {
    this.servicioCompras.ObtenerCompraPorId(idCompra).subscribe({
      next: (res: any) => {
        // 1. Cargar Cabecera
        this.proveedorId = res.prove_id;
        this.getRucProveedor.setValue(res.prove_ruc);
        this.getNombreProveedor.setValue(res.prove_nombre);
        this.getDatosAdicionales.setValue(res.prove_direccion);
        // Si tienes el RUC, podrías disparar buscarProveedor() para asegurar datos frescos, 
        // pero con setear los valores basta visualmente.

        // 2. Cargar Detalles
        if (res.detalle_compra) {
          this.listaDetalles = res.detalle_compra.map((item: any) => ({
            id_producto: item.prod_id,
            codigo: item.prod_codbarra || 'N/A',
            nombreProducto: item.prod_nombre,
            precioCompra: parseFloat(item.detc_preciounitario), // Costo histórico
            cantidad: item.detc_cantidad,
            subtotal: parseFloat(item.detc_subtotal)
          }));
          
          this.calcularTotales();
        }
      },
      error: (err: any) => {
        console.error(err);
        this.alertaServ.error('Error', 'No se pudo cargar la información de la compra');
        this.router.navigate(['home/listacompras']);
      }
    });
  }

  cancelarCompra() {
    this.listaDetalles = [];
    this.formCompras.reset();
    this.calcularTotales();
    this.stockActual = 0;
    this.router.navigate(['home/listacompras']);
  }

  // ==========================================
  // GETTERS DE FORMULARIO
  // ==========================================
  get getRucProveedor() { return this.formCompras.controls['txtRucProveedor']; }
  get getNombreProveedor() { return this.formCompras.controls['txtNombreProveedor']; }
  get getDatosAdicionales() { return this.formCompras.controls['txtDatosAdicionales']; }
  get getCodBarra() { return this.formCompras.controls['txtCodBarra']; }

  marcarCamposComoTocados(): void {
    Object.keys(this.formCompras.controls).forEach((campo) => {
      const control = this.formCompras.get(campo);
      if (control) control.markAsTouched();
    });
  }
}