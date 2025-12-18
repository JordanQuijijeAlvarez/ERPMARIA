import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

// Importaciones propias (Ajusta las rutas si es necesario)
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { CategoriasService } from '../../../../servicios/categorias.service';

@Component({
  selector: 'app-frmcategorias',
  standalone: true, // Asumo standalone por tu código anterior
  imports: [ReactiveFormsModule, RouterModule, CommonModule, ValidatorsComponent],
  templateUrl: './frmcategorias.component.html', // Asegúrate que el nombre coincida
  styleUrl: './frmcategorias.component.css' // Asegúrate que el nombre coincida
})
export class FrmCategoriasComponent implements OnInit {
  
  frmCategoria: FormGroup;
  eventoUpdate: boolean = false;
  idEditar: number = 0; // El ID de categoría es numérico

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private categoriaServ: CategoriasService, // Inyectamos servicio de categorías
    private alertaServ: AlertService,
    private route: ActivatedRoute
  ) {
    this.frmCategoria = this.formBuilder.group({
      txtNombre: ['', Validators.required],
      txtDescripcion: [''] // La descripción puede ser opcional
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((parametros) => {
      const id = parametros.get('id');

      if (id) {
        this.eventoUpdate = true;
        this.idEditar = parseInt(id);
        this.cargarCategoria(this.idEditar);
      } else {
        this.eventoUpdate = false;
      }
    });
  }

  cargarCategoria(id: number): void {
    // Asegúrate de tener el método 'ObtenerCategoria' o 'LcategoriaId' en tu servicio
    this.categoriaServ.LSubcategoriasId(id).subscribe({
      next: (categoria: any) => {
        this.frmCategoria.patchValue({
          txtNombre: categoria.cat_nombre,
          txtDescripcion: categoria.cat_descripcion
        });
      },
      error: (err) => {
        console.log('Error al cargar categoría:', err);
        this.alertaServ.error(
          'Error de Carga',
          'No se pudo obtener la información de la categoría'
        );
        this.router.navigate(['home/listarCategorias']);
      },
    });
  }
  
  guardarCategoria(): void {
    // 1. Marcar campos como tocados para mostrar errores visuales
    this.marcarCamposComoTocados();

    // 2. Verificar validez del formulario
    if (this.frmCategoria.invalid) {
      const camposConError = [];
      
      if (this.frmCategoria.get('txtNombre')?.invalid) {
        camposConError.push('Nombre de la Categoría');
      }
      // Si pusiste validators en descripcion, agrégalo aquí

      if (camposConError.length > 0) {
        Swal.fire({
          title: 'Campos Requeridos',
          text: 'Por favor complete: ' + camposConError.join(', '),
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Entendido'
        });
      }
      return;
    }

    // 3. Construir el objeto para enviar al backend
    // Usamos las llaves que espera tu interfaz InCategoria (usualmente Mayúsculas o snake_case según definas)
    // Aquí asumo que tu interfaz usa CAT_... para coincidir con la BD, 
    // pero tu controlador espera cat_nombre (minúscula) en el body.
    // Angular HttpClient enviará este objeto como JSON.
    const categoria: any = {
      cat_id: this.eventoUpdate ? this.idEditar : 0,
      cat_nombre: this.frmCategoria.value.txtNombre,
      cat_descripcion: this.frmCategoria.value.txtDescripcion
    };

    if (this.eventoUpdate) {
      this.categoriaServ.ActualizarCategoria(categoria).subscribe({
        next: (res) => {
          this.alertaServ.success('Categoría actualizada con éxito.', '');
          this.router.navigate(['home/listarCategorias']);
        },
        error: (err) => {
          console.log('Error al actualizar:', err);
          this.alertaServ.error(
            'ERROR AL ACTUALIZAR',
            'Hubo un problema al actualizar la categoría.'
          );
        },
      });
    } else {
      this.categoriaServ.CrearCategoria(categoria).subscribe({
        next: (res) => {
          this.alertaServ.success('Categoría registrada con éxito.', '');
          this.router.navigate(['home/listarCategorias']);
        },
        error: (err) => {
          console.log('Error al crear:', err);
          this.alertaServ.error(
            'ERROR AL REGISTRAR',
            'Hubo un problema al registrar la categoría.'
          );
        },
      });
    }
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.frmCategoria.controls).forEach((campo) => {
      const control = this.frmCategoria.get(campo);
      if (control) {
        control.markAsTouched();
      }
    });
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
        this.router.navigate(['/home/listarCategorias']);
      }
    });
  }
}