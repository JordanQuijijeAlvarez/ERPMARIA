import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { productosService } from '../../../../servicios/productos.service';
import { InSubcategoria } from '../../../../modelos/modeloSubcategoria/InSubcategoria';
import { InProducto } from '../../../../modelos/modeloProductos/InProducto';
import { SubcategoriasService } from '../../../../servicios/subcategorias.service';
import { CategoriasService } from '../../../../servicios/categorias.service';
import { InCategoria } from '../../../../modelos/modeloCategoria/InCategoria';

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


  listaSubcategorias: InSubcategoria[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private productoServ: productosService,
    private subcategoriaServ: SubcategoriasService,
    private categoriaServ: CategoriasService,

    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmProducto = this.formBuilder.group({
      txtCodigobarras: ['', [Validators.required, ValidatorsComponent.numericTreceDigits]],
      txtNombres: ['', Validators.required],
      txtDescripcion: ['', Validators.required],
      txtpreciocompra: ['', Validators.required],
      txtprecioventa: ['', [Validators.required]],
      txtstock: ['', [Validators.required]],
      txtstockminimo: ['', Validators.required],
      cbxSubcategoria: ['', [Validators.required, ValidatorsComponent.selectRequired]]
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');

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
    this.subcategoriaServ.LSubcategoriasEstado(estado).subscribe({
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
          txtCodigobarras: producto.prod_codbarra,
          txtNombres: producto.prod_nombre,
          txtDescripcion: producto.prod_descripcion,
          txtstock: producto.prod_stock,
          txtstockminimo: producto.prod_stockmin,
          txtprecioventa: producto.prod_precioventa,
          txtpreciocompra: producto.prod_preciocompra,
          cbxSubcategoria: producto.subcat_id
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
    } else {

      const producto: InProducto = {
        prod_codbarra: this.frmProducto.value.txtCodigobarras,
        prod_nombre: this.frmProducto.value.txtNombres,
        prod_descripcion: this.frmProducto.value.txtDescripcion,
        prod_precioventa: this.frmProducto.value.txtprecioventa,
        prod_preciocompra: this.frmProducto.value.txtpreciocompra,
        prod_stockmin: parseFloat(this.frmProducto.value.txtstockminimo),
        prod_stock: parseFloat(this.frmProducto.value.txtstock),
        subcat_id: this.frmProducto.value.cbxSubcategoria,
        prod_id: 0,
        user_id: parseInt(localStorage.getItem('user_id') ?? '1')

      };

      if (this.eventoUpdate) {
        producto.prod_id = this.codigo;
        this.productoServ.Actualizarproducto(producto).subscribe({
          next: (res) => {
            //this.guardarEspecialidadesproducto(this.codigo!);
            //this.eliminarEspecialidadesproducto();
            Swal.fire({
              title: 'Producto actualizado',
              text: 'Los datos del Producto fueron actualizados con éxito.',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            }).then(() => {
              this.router.navigate(['/home/listarProductos']);
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
              this.router.navigate(['/home/listarProductos']);
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
        this.router.navigate(['/home/listarProductos']);
      }
    });
  }

  abrirModalAgregarSubcategoria(): void {

    // 1. Cargar categorías iniciales
    this.alertaServ.loading('Cargando datos...');

    this.categoriaServ.LCategoriasEstado(1).subscribe({
      next: (categorias: any[]) => {
        Swal.close();

        // Función auxiliar para generar las opciones del HTML
        const generarOpciones = (lista: any[]) => {
          let html = '<option value="" disabled selected>Seleccione una categoría padre</option>';
          lista.forEach(cat => {
            html += `<option value="${cat.cat_id}">${cat.cat_nombre}</option>`;
          });
          return html;
        };

        // 2. HTML DINÁMICO CON ESTADOS (Ver / Crear)
        Swal.fire({
          title: 'Nueva Subcategoría',
          html: `
            <div class="text-left space-y-4">
              
              <label class="block text-sm font-semibold text-gray-700 mb-1">Categoría Padre *</label>
              
              <div id="view-select-cat" class="flex gap-2">
                <select id="swal-categoria" class="swal2-input w-full m-0 bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5">
                  ${generarOpciones(categorias)}
                </select>
                <button type="button" id="btn-show-new-cat" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" title="Crear nueva categoría">
                    <i class="fas fa-plus"></i>
                </button>
              </div>

              <div id="view-create-cat" class="hidden flex gap-2 items-center">
                <input type="text" id="swal-new-cat-name" class="swal2-input w-full m-0" placeholder="Nombre nueva Categoría...">
                
                <button type="button" id="btn-save-cat" class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <i class="fas fa-check"></i>
                </button>
                
                <button type="button" id="btn-cancel-cat" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
              </div>

              <div class="mt-4">
                <label class="block text-sm font-semibold text-gray-700 mb-1">Nombre Subcategoría *</label>
                <input type="text" id="swal-nombre-sub" class="swal2-input w-full m-0" placeholder="Ej: Jabones, Lacteos...">
              </div>

            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Guardar Todo',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#1f2937',

          // AQUÍ OCURRE LA MAGIA DEL DOM
          didOpen: () => {
            const viewSelect = document.getElementById('view-select-cat')!;
            const viewCreate = document.getElementById('view-create-cat')!;
            const btnShowNew = document.getElementById('btn-show-new-cat')!;
            const btnSaveCat = document.getElementById('btn-save-cat')!;
            const btnCancelCat = document.getElementById('btn-cancel-cat')!;
            const selectElement = document.getElementById('swal-categoria') as HTMLSelectElement;
            const inputNewCat = document.getElementById('swal-new-cat-name') as HTMLInputElement;

            // 1. Click en "+" -> Ocultar Select, Mostrar Input
            btnShowNew.addEventListener('click', () => {
              viewSelect.classList.add('hidden');
              viewCreate.classList.remove('hidden');
              inputNewCat.focus();
            });

            // 2. Click en "Cancelar" -> Volver al Select
            btnCancelCat.addEventListener('click', () => {
              viewCreate.classList.add('hidden');
              viewSelect.classList.remove('hidden');
              inputNewCat.value = ''; // Limpiar
            });

            // 3. Click en "Guardar Categoría" (Check verde)
            btnSaveCat.addEventListener('click', () => {
              const nombreCat = inputNewCat.value;
              if (!nombreCat) return; // Validación simple

              // Llamada AJAX rápida para crear la CATEGORÍA
              // NOTA: Ajusta el objeto según tu backend
              const objCat: InCategoria = {
                cat_id: 0,
                cat_nombre: nombreCat,
                cat_descripcion: 'Creada desde Productos'
              };

              // Deshabilitar botón para evitar doble click
              btnSaveCat.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

              this.categoriaServ.CrearCategoria(objCat).subscribe({
                next: (res: any) => {
                  // Recargar la lista
                  this.categoriaServ.LCategoriasEstado(1).subscribe(nuevaLista => {

                    // Actualizar HTML del select
                    selectElement.innerHTML = generarOpciones(nuevaLista);

                    // BUSCAR LA QUE ACABAMOS DE CREAR
                    const creada = nuevaLista.find((x: any) => x.cat_nombre === nombreCat);

                    // SELECCIONARLA (Aquí estaba el error)
                    if (creada && creada.cat_id) {
                      selectElement.value = creada.cat_id.toString();
                    }

                    // Volver a la vista normal
                    viewCreate.classList.add('hidden');
                    viewSelect.classList.remove('hidden');
                    btnSaveCat.innerHTML = '<i class="fas fa-check"></i>';
                  });
                },
                // ... error
              });
            });
          },

          preConfirm: () => {
            const catId = (document.getElementById('swal-categoria') as HTMLSelectElement).value;
            const nombreSub = (document.getElementById('swal-nombre-sub') as HTMLInputElement).value;

            // Validar que no haya dejado el modo edición de categoría abierto
            if (!document.getElementById('view-create-cat')?.classList.contains('hidden')) {
              Swal.showValidationMessage('Termine de guardar o cancele la nueva categoría primero.');
              return false;
            }

            if (!catId) {
              Swal.showValidationMessage('Seleccione una categoría padre');
              return false;
            }
            if (!nombreSub) {
              Swal.showValidationMessage('Escriba el nombre de la subcategoría');
              return false;
            }

            return { cat_id: parseInt(catId), nombre: nombreSub };
          }
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            // Aquí llamamos al guardar FINAL de la subcategoría
            this.registrarSubcategoriaExpress(result.value.cat_id, result.value.nombre);
          }
        });
      },
      error: () => this.alertaServ.error('Error', 'Fallo al cargar categorías')
    });
  }
  // Lógica de guardado (Ajustada para recibir el ID padre)
  registrarSubcategoriaExpress(idPadre: number, nombreSub: string) {

    const nuevaSubcat: InSubcategoria = {
      subcat_id: 0,
      cat_id: idPadre,
      subcat_nombre: nombreSub,
      subcat_descripcion: ''
    };

    this.alertaServ.loading('Creando subcategoría...');

    this.subcategoriaServ.CrearSubcategorias(nuevaSubcat).subscribe({
      next: (res: any) => {
        this.alertaServ.close();
        this.alertaServ.success('Éxito', 'Subcategoría agregada');

        // 1. Recargamos la lista del formulario principal
        // IMPORTANTE: Pasamos una función callback para ejecutar DESPUÉS de cargar la lista
        this.recargarListaYSeleccionar(res);
      },
      error: (err) => {
        console.error(err);
        this.alertaServ.error('Error', 'No se pudo registrar');
      }
    });
  }
  // Método auxiliar para recargar y seleccionar
  recargarListaYSeleccionar(nuevaSubcatGuardada: any) {
    this.subcategoriaServ.LSubcategoriasEstado(1).subscribe({
      next: (res) => {
        this.listaSubcategorias = res;

        // 2. Buscamos el ID correcto. 
        // A veces el backend devuelve el objeto creado en 'res', o un mensaje.
        // Si 'nuevaSubcatGuardada' tiene el ID, úsalo. Si no, búscalo por nombre en la lista nueva.

        let idParaSeleccionar = nuevaSubcatGuardada.subcat_id; // Opción A: Backend devuelve el objeto

        if (!idParaSeleccionar) {
          // Opción B: Si el backend no devuelve ID, buscamos por nombre en la lista recién cargada
          const encontrada = this.listaSubcategorias.find(s => s.subcat_nombre === nuevaSubcatGuardada.subcat_nombre); // O usa el nombre que enviaste
          if (encontrada) idParaSeleccionar = encontrada.subcat_id;
        }

        // 3. SELECCIONAR EN EL FORMULARIO
        if (idParaSeleccionar) {
          this.frmProducto.patchValue({
            cbxSubcategoria: idParaSeleccionar
          });
        }
      }
    });
  }

}
