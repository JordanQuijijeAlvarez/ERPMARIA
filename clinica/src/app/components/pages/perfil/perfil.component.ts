import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../../servicios/usuarios.service';
import { AlertService } from '../../../servicios/Alertas/alertas.service';

type PerfilMeResponse = {
  user_id: number;
  user_nombres: string;
  user_apellidos: string;
  user_username: string;
  user_correo: string;
  user_estado: number;
  rol_nombre: string;
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private usuariosService = inject(UsuariosService);
  private formBuilder = inject(FormBuilder);
  private alertas = inject(AlertService);
  private router = inject(Router);

  loading = false;
  saving = false;
  perfil: PerfilMeResponse | null = null;

  form: FormGroup = this.formBuilder.group({
    user_nombres: ['', [Validators.required]],
    user_apellidos: ['', [Validators.required]],
    user_username: ['', [Validators.required]],
    user_correo: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading = true;

    this.usuariosService.obtenerMiPerfil().subscribe({
      next: (res: PerfilMeResponse) => {
        this.perfil = res;
        this.form.patchValue({
          user_nombres: res.user_nombres,
          user_apellidos: res.user_apellidos,
          user_username: res.user_username,
          user_correo: res.user_correo
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alertas.error('Error', err?.error?.message || 'No se pudo cargar tu perfil');
      }
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;

    this.usuariosService.actualizarMiPerfil(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.alertas.success('Éxito', 'Perfil actualizado correctamente');
        this.cargarPerfil();
      },
      error: (err: any) => {
        this.saving = false;
        this.alertas.error('Error', err?.error?.message || 'No se pudo actualizar tu perfil');
      }
    });
  }

  irSetup2FA(): void {
    this.router.navigate(['/home/setup-2fa']);
  }
}
