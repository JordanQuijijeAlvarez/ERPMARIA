import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import Swal from 'sweetalert2';
import { InEspecialidades } from '../../../../modelos/modeloEspecialidades/InEspecialidades';
import { especialidadesService } from '../../../../servicios/especialidades.service';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { productosService } from '../../../../servicios/productos.service';
import { InSubcategoria } from '../../../../modelos/modeloSubcategoria/InSubcategoria';
import { InProducto } from '../../../../modelos/modeloProductos/InProducto';

@Component({
    selector: 'app-frmproductos',
    imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
    templateUrl: './frmproductos.component.html',
    styleUrl: './frmproductos.component.css'
})
export class FrmproductoComponent {
  frmProducto: FormGroup;
  eventoUpdate: boolean = false;
  codigo: number = 0;
  estado: boolean = true;
  mostrarModal: boolean = false;

  @ViewChild('datepickerElement') datepickerElement!: ElementRef;

  //especialidadesSeleccionadas: InSubcategoria[] = [];

  listaSubcategorias: InEspecialidades[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private productoServ: productosService,
    private especialidadServ: especialidadesService,
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmProducto = this.formBuilder.group({
      txtCedula: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtNombres: ['', Validators.required],
      txtApellidos: ['', Validators.required],
      txtFechNac: ['', Validators.required],
      txtNumTelefono: ['', [Validators.required, ValidatorsComponent.numericTenDigits]],
      txtCorreo: ['', [Validators.required, Validators.email]],
      txtDireccion: ['', Validators.required],
      txtLicenciaMedica: ['', Validators.required],
      cbxConsultorio: ['', [Validators.required, ValidatorsComponent.selectRequired]],
      cbxHorario: ['', ValidatorsComponent.selectRequired],
      cbxEspecialidad: [''],
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id =  parametros.get('id');
      
      this.listarSubcategoriaEstado(1);

      if (id) {
        this.eventoUpdate = true;
        this.codigo = parseInt(id);

        this.cargarProducto(this.codigo);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

 listarSubcategoriaEstado(estado: any): void {
    this.especialidadServ.LespecialidadesEstado(estado).subscribe({
      next: (res) => {
        this.listaSubcategorias = res;

        console.log(res);
      },
      error: (err) => {
        alert('NO EXISTEN REGISTROS');
      },
    });
  }
  marcarCamposComoTocados(): void {
    Object.keys(this.frmProducto.controls).forEach((campo) => {
      const control = this.frmProducto.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  
  cargarProducto(id: number): void {
    this.productoServ.LproductosId(id).subscribe({
      next: (producto) => {

       
        this.frmProducto.patchValue({
          txtCedula: producto.prod_codbarras,
          txtNombres: producto.prod_nombre,
          txtApellidos: producto.prod_descripcion,
          txtCorreo: producto.prod_stock,
          txtNumTelefono: producto.prod_stock_min,
          txtDireccion: producto.prod_preciov,
          txtFechNac: producto.prod_preciocompra,
          cbxConsultorio: producto.prod_subcategoria
        });
      },
      error: (err) => {
        console.log('Error al cargar producto:', err);
        alert('No se pudo cargar la información del producto');
      },
    });
  }

  guardarproducto(): void {

    if (this.frmProducto.invalid) {
      this.alertaServ.info(
        '',
        'Por favor, complete todos los campos obligatorios *'
      );
      this.marcarCamposComoTocados();
      return;
    }else{

      const producto: InProducto = {
        prod_codbarras: this.frmProducto.value.txtCedula,
        prod_nombre: this.frmProducto.value.txtNombres,
        prod_descripcion: this.frmProducto.value.txtApellidos,
        prod_preciov: this.frmProducto.value.txtCorreo,
        prod_preciocompra: this.frmProducto.value.txtNumTelefono,
        prod_stock_min: this.frmProducto.value.txtDireccion,
        prod_stock: this.frmProducto.value.txtFechNac,
        prod_subcategoria: this.frmProducto.value.cbxConsultorio,
        prod_id:0
      };
  
      if (this.eventoUpdate) {
        producto.prod_id = this.codigo;
        this.productoServ.Actualizarproducto(producto).subscribe({
          next: (res) => {
            //this.guardarEspecialidadesproducto(this.codigo!);
            //this.eliminarEspecialidadesproducto();
            Swal.fire({
              title: 'Médico actualizado',
              text: 'Los datos del médico fueron actualizados con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.router.navigate(['/home/listaproductos']);
            });
          },
          error: (err) => {
            console.log('Error al actualizar médico:', err);
            Swal.fire(
              'Error',
              'Hubo un problema al actualizar el médico.',
              'error'
            );
          },
        });
      } else {
        this.productoServ.CrearProducto(producto).subscribe({
          next: (res: any) => {
            console.log(res)
            //const nuevoIdproducto = res.idproducto; 
            //this.guardarEspecialidadesproducto(nuevoIdproducto);
            Swal.fire({
              title: 'Producto registrado',
              text: 'El producto fue registrado con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.router.navigate(['/home/listaproductos']);
            });
          },
          error: (err) => {
            console.log('Error al crear producto:', err);
            Swal.fire(
              'Error',
              'Hubo un problema al registrar el producto.',
              'error'
            );
          },
        });
      }
    }


   
  }


  /*guardarEspecialidadesproducto(idproducto: number): void {
    const especialidadesAGuardar = this.especialidadesSeleccionadas.map(
      (especialidad) => ({
        id_producto: idproducto,
        id_especialidad: especialidad.codigo,
      })
    );

    this.productoEspecialidadServ
      .CrearproductoEspecialidad(especialidadesAGuardar)
      .subscribe({
        next: () => {
          console.log('Especialidades guardadas correctamente');
        },
        error: (err) => {
          console.log('Error al guardar especialidades:', err);
        },
      });
  }
*/
 
  salirSinGuardar(): void {
    Swal.fire({
      title: '¿Está seguro que desea salir?',
      text: 'Los cambios no guardados se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/home/listaproductos']);
      }
    });
  }
/*
  abrirModalAgregarHorario(): void {
    Swal.fire({
      title: 'Agregar Horario',
      html: `
        <form id="formHorario">
                      <div class="flex items-center gap-2">
                      <div>
                      <label for="txtHoraInicio">Hora de Inicio:</label>
                        <input type="time" id="txtHoraInicio" class="swal2-input" required>
                      </div>
                      <div>
                       <label for="txtHoraFin">Hora de Fin:</label>
                          <input type="time" id="txtHoraFin" class="swal2-input" required>
                      </div>

                      </div>
          
          
         
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const txtHoraInicio = (
          document.getElementById('txtHoraInicio') as HTMLInputElement
        ).value;
        const txtHoraFin = (
          document.getElementById('txtHoraFin') as HTMLInputElement
        ).value;

        if (!txtHoraInicio || !txtHoraFin) {
          Swal.showValidationMessage('Por favor, completa todos los campos.');
          return false;
        }

        const horarioNuevo: InHorarios = {
          hora_inicio: txtHoraInicio,
          hora_fin: txtHoraFin,
          codigo: '',
          estado: '',
          usuario: '' + 1,
        };

        return horarioNuevo;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.horarioServ.CrearHorario(result.value).subscribe({
          next: (res) => {
            this.listarhorarioesEstado(true);
          },
          error: (err) => {
            console.log('Error al crear horario:', err);
            this.alertaServ.error(
              'ERROR AL REGISTRAR',
              'Hubo un problema al registrar el Horario: revise que la información sea correcta'
            );
          },
        });
      }
    });
  }

  */
}
