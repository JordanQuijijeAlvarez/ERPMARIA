import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InCitaPacienteLista } from '../../../../modelos/modeloCitas/InCitaPacienteLista';
import { InConsultas } from '../../../../modelos/modeloConsultas/InConsultas';
import { consultasService } from '../../../../servicios/consultas.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { CommonModule } from '@angular/common';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { clienteService } from '../../../../servicios/clientes.service';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';
import { productosService } from '../../../../servicios/productos.service';
import { InProducto, InProductoDetalle } from '../../../../modelos/modeloProductos/InProducto';
import { InDetalleVenta, InVentaCompleto } from '../../../../modelos/modeloVentas/InVentas';
import { ventaService } from '../../../../servicios/ventas.service';

@Component({
  selector: 'app-frmventas',
  imports: [ReactiveFormsModule, RouterModule, CommonModule, FormsModule],
  templateUrl: './frmventas.component.html',
  styleUrl: './frmventas.component.css'
})
export class FrmventasComponent {
  productoBusquedaControl: FormControl<any> | undefined;

  stockActual: any;
  listaDetalles: any[] = [];
  iva: number = 15;
  subiva: number = 0;
  subtotal: number = 0;
  total: number = 0;
  formVentas: FormGroup;
  eventoUpdate = false;
  cliente: number = 0;
  producto: InProducto | undefined;
  codigoventa: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,


    private ServicioVentas: ventaService,


    private formBuilder: FormBuilder,
    private serviConsultas: consultasService,
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

    this.route.paramMap.subscribe((parametros) => {
    const id = parametros.get('id');
    if (id) {
      this.eventoUpdate = true;
      this.codigoventa = parseInt(id);
      
      // LLAMAMOS AL MÉTODO DE CARGA (Asegúrate de tener este método en tu servicio)
      this.cargarVentaParaEditar(this.codigoventa); 
      
    } else {
      this.eventoUpdate = false;
    }
  });

  }

  buscarCliente(): void {

    this.ServicioCliente.LclienteCedulaEstado(this.getCedulaCliente.value, '1').subscribe({
      next: (res) => {
        this.getNombreCliente.setValue(res.client_nombres);
        this.getDatosAddCliente.setValue(res.client_direccion);
        this.cliente = res.client_id;
      },
      error: (err) => {
        this.alertaServ.error(
          'ERROR DE BUSQUEDA DE CLIENTE',
          'No se encontro un cliente con la cedula ingresada'
        );
      },
    });
  }



 agregarProducto() {
  if (!this.getCodBarras.value) return;

  this.ServicioProductos.BuscarprodCodBarras(this.getCodBarras.value, 1)
    .subscribe({
      next: (res: any) => {

        if (!res || res.length === 0) {
          this.alertaServ.info('Producto no encontrado', 'No existe un producto con ese código de barras.');
          this.getCodBarras.setValue(''); 
          return;
        }

        this.producto = res[0];
        this.stockActual = res[0].prod_stock;

        if (this.stockActual <= 0) {
          this.alertaServ.error('Sin Stock', 'Este producto no tiene existencias disponibles');
          return;
        }

        const indiceExistente = this.listaDetalles
          .findIndex(item => item.id_producto === this.producto?.prod_id);

        if (indiceExistente !== -1) {
          this.aumentarCantidad(indiceExistente);
        } else {
          const nuevoDetalle = {
            id_producto: this.producto!.prod_id ,
            codigo: this.producto!.prod_codbarra,
            nombreProducto: this.producto!.prod_nombre,
            precioUnitario: this.producto!.prod_precioventa,
            cantidad: 1,
            subtotal: this.producto!.prod_precioventa
          };

          this.listaDetalles.push(nuevoDetalle);
          this.calcularTotales();
        }

        // 5. Limpieza final
        this.getCodBarras.setValue('');
        this.producto = undefined;
        this.stockActual = 0;
      },
      error: (err) => {
        console.error(err);
        this.alertaServ.error('Error', 'Hubo un problema al consultar el servidor');
      }
    });
}


  aumentarCantidad(index: number) {
    const item = this.listaDetalles[index];

    // Opcional: Validar contra stock real antes de subir
    //if (item.cantidad >= stockMaximo) return; 

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
      // Si la cantidad es 1 y bajan, ¿preguntar si eliminar?
      this.eliminarProducto(index);
    }
  }

  eliminarProducto(index: number) {
    this.listaDetalles.splice(index, 1);
    this.calcularTotales();
  }

  calcularTotales() {
    this.subtotal = this.listaDetalles.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);
    this.subiva = this.subtotal * (this.iva / 100);
    this.total = this.subtotal + this.subiva;
  }


  


  crearObjetoVenta(): InVentaCompleto {
  const detalles: InDetalleVenta[] = this.listaDetalles.map(item => ({
    detv_id: 0, // Generalmente se manda 0 y el backend decide si borra e inserta de nuevo o actualiza
    venta_id: this.eventoUpdate ? this.codigoventa : 0, // <--- AQUÍ EL CAMBIO IMPORTANTE
    prod_id: item.id_producto,
    detv_cantidad: item.cantidad,
    detv_subtotal: item.subtotal,
    detv_estado: 1
  }));

  const ObjVenta: InVentaCompleto = {
    venta_id: this.eventoUpdate ? this.codigoventa : 0, // <--- ID REAL SI ES UPDATE
    venta_horafecha: new Date().toISOString(),
    venta_subiva: this.subiva,
    venta_iva: this.iva,
    venta_total: this.total,
    local_id: 1,
    cliente_id: this.cliente,
    user_id: 1,
    venta_descripcion: '', // Puedes agregar un campo para esto si quieres
    detalle_venta: detalles
  };

  return ObjVenta;
}

  cancelarVenta() {
    this.listaDetalles = [];
    this.formVentas.reset();
    this.calcularTotales();
    this.stockActual = 0;
          this.router.navigate(['home/listaventas']); // Regresar si falla


  }



  get getCedulaCliente() {
    return this.formVentas.controls['txtCedulaCliente'];
  }
  get getNombreCliente() {
    return this.formVentas.controls['txtNombreCliente'];
  }
  get getDatosAddCliente() {
    return this.formVentas.controls['txtDatosAdicionales'];
  }

  get getCodBarras() {
    return this.formVentas.controls['txtCodBarra'];
  }



cargarVentaParaEditar(idVenta: number) {
  //this.alertaServ.loading('Cargando información de la venta...'); // Opcional si tienes loading

  this.ServicioVentas.ObtenerVentaPorId(idVenta).subscribe({
    next: (res: any) => {
      // 1. SETEAR DATOS DE CABECERA (CLIENTE)
      // Ajusta 'res.cliente...' según como te devuelva los datos tu backend
      this.cliente = res.cliente_id;
      
      this.getCedulaCliente.setValue(res.cliente_cedula || res.cedula); 
      this.getNombreCliente.setValue(res.cliente_nombres || res.nombres);
      this.getDatosAddCliente.setValue(res.cliente_direccion || res.direccion);

      // 2. SETEAR DETALLES (Transformar de BD a Frontend)
      // Tu tabla espera: id_producto, codigo, nombreProducto, precioUnitario, cantidad, subtotal
      if (res.detalle_venta) {
        this.listaDetalles = res.detalle_venta.map((item: any) => {
          return {
            id_producto: item.prod_id,
            // Si el backend no trae el código de barras en el detalle, puedes dejarlo vacío o pedirlo
            codigo: item.prod_codbarra || 'N/A', 
            nombreProducto: item.prod_nombre, 
            precioUnitario: parseFloat(item.detv_precio_unitario || item.prod_precio), // Asegúrate de tener el precio unitario
            cantidad: item.detv_cantidad,
            subtotal: parseFloat(item.detv_subtotal)
          };
        });
      }

      // 3. RECALCULAR TOTALES VISUALES
      this.calcularTotales();
   //   this.alertaServ.close(); // Cerrar loading
    },
    error: (err:any) => {
      console.error(err);
      this.alertaServ.error('Error', 'No se pudo cargar la información de la venta');
      this.router.navigate(['home/listaventas']); // Regresar si falla
    }
  });
}

guardarVenta() {
  if (this.formVentas.invalid || this.listaDetalles.length === 0) {
    this.alertaServ.info('Formulario Incompleto', 'Revise los datos y agregue productos.');
    return;
  }

  const ventaObjeto = this.crearObjetoVenta();

  if (this.eventoUpdate) {
    // --- LÓGICA DE ACTUALIZACIÓN (PUT) ---
    this.ServicioVentas.ActualizarVenta(this.codigoventa, ventaObjeto).subscribe({
      next: (res) => {
        this.alertaServ.success('Actualizado', 'La venta se ha modificado correctamente');
        this.router.navigate(['home/listaventas']); // O donde listes las ventas
      },
      error: (err) => {
        this.alertaServ.error('Error', 'No se pudo actualizar la venta');
      }
    });

  } else {
    // --- LÓGICA DE CREACIÓN (POST) ---
    this.ServicioVentas.CrearVenta(ventaObjeto).subscribe({
      next: (res) => {
        this.alertaServ.success('Éxito', 'Venta registrada correctamente');
        this.router.navigate(['home/listaventas']);
      },
      error: (err) => {
        this.alertaServ.error('Error', 'No se pudo registrar la venta');
      }
    });
  }
}




  guardarConsulta(): void {
    if (this.formVentas.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }

    const consulta: InConsultas = {
      codigo_cita: this.codigoventa,
      peso: this.formVentas.value.txtPesoPaciente,
      temperatura: this.formVentas.value.txtTemperaturaPaciente,
      presion: this.formVentas.value.txtPresionPaciente,
      diagnostico: this.formVentas.value.txtDiagnostico,
      tratamiento: this.formVentas.value.txtTratamiento,
      observaciones: this.formVentas.value.txtObservaciones,
      estatura: this.formVentas.value.txtEstaturaPaciente,
      codigo: 0,
      usuario: 1,
      estado: false,
    };

    if (this.eventoUpdate) {
    } else {
      console.log(consulta);
      this.serviConsultas.CrearConsulta(consulta).subscribe({
        next: (res) => {
          this.alertaServ.success('Consulta registrada con éxito.', '');
          this.router.navigate(['home/listaconsultas']);
        },
        error: (err) => {
          console.log('Error al registrar consulta:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar la consulta: revise que la información sea correcta'
          );
        },
      });
    }
  }

  cargarDatosPaciente(): void {
    // this.formVentas.patchValue({
    //   txtNombresPaciente: this.nombrePaciente,
    //   txtEdadPaciente: this.edadPaciente,
    //   txtCedulaPaciente: this.cedulaPaciente,
    // });
  }
  marcarCamposComoTocados(): void {
    Object.keys(this.formVentas.controls).forEach((campo) => {
      const control = this.formVentas.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }


}
