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

  citaPaciente: InCitaPacienteLista | undefined;
  codigoCita!: number;
  cedulaPaciente: string = '';
  nombrePaciente!: string;
  edadPaciente!: number;
  eventoUpdate = false;


  cliente: number = 0;
  producto: InProducto | undefined;

  constructor(
    private router: Router,

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

    this.ServicioProductos.BuscarprodCodBarras(this.getCodBarras.value, 1)
      .subscribe({
        next: (res: any) => {

          this.producto = res[0];
          this.stockActual = res[0].prod_stock;

          // VALIDACIONES
          if (!this.producto) {
            this.alertaServ.info('Atención', 'Primero debe buscar un producto válido');
            return;
          }

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
              id_producto: this.producto.prod_id,
              codigo: this.producto.prod_codbarra,
              nombreProducto: this.producto.prod_nombre,
              precioUnitario: this.producto.prod_precioventa,
              cantidad: 1,
              subtotal: this.producto.prod_precioventa
            };

            this.listaDetalles.push(nuevoDetalle);
            this.calcularTotales();
          }

          // LIMPIAR
          this.getCodBarras.setValue('');
          this.producto = undefined;
          this.stockActual = 0;
        },
        error: () => {
          this.alertaServ.error('Error', 'No se pudo buscar el producto');
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
    this.subiva = this.subtotal * (this.iva/100);
    this.total = this.subtotal + this.subiva;
  }


  guardarVenta() {
    if (this.formVentas.invalid || this.listaDetalles.length === 0) {
      this.alertaServ.info('Formulario Incompleto', 'Revise los datos del cliente y agregue productos.');
      return;
    }



    console.log('Enviando venta...', this.crearObjetoVenta());

    this.ServicioVentas.CrearVenta(this.crearObjetoVenta()).subscribe({
      next: (res) => {
        this.alertaServ.success('venta registrado con éxito.', res.message);
        this.router.navigate(['home/']);
      },
      error: (err) => {
        console.log('Error al crear venta:', err);
        this.alertaServ.error(
          'ERROR AL REGISTRAR',
          'Hubo un problema al registrar la venta: revise que la información sea correcta'
        );
      },
    });


  }


  crearObjetoVenta(): InVentaCompleto {

    const detalles: InDetalleVenta[] = this.listaDetalles.map(item => ({
      detv_id: 0,
      venta_id: 0,
      prod_id: item.id_producto,
      detv_cantidad: item.cantidad,
      detv_subtotal: item.subtotal,
      detv_estado: 1
    }));

    const ObjVenta: InVentaCompleto = {
      venta_id: 0,
      venta_horafecha: new Date().toISOString(),
      venta_subiva: this.subiva,
      venta_iva: this.iva,
      venta_total: this.total,
      local_id: 1,
      cliente_id: this.cliente,
      user_id: 1,
      venta_descripcion: '',
      detalle_venta: detalles
    };

    return ObjVenta;
  }


  cancelarVenta() {
    this.listaDetalles = [];
    this.formVentas.reset();
    this.calcularTotales();
    this.stockActual = 0;
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
      codigo_cita: this.codigoCita,
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
    this.formVentas.patchValue({
      txtNombresPaciente: this.nombrePaciente,
      txtEdadPaciente: this.edadPaciente,
      txtCedulaPaciente: this.cedulaPaciente,
    });
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
