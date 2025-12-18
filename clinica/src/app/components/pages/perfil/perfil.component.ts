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
  savingPerfil = false;
  savingPassword = false;
  perfil: PerfilMeResponse | null = null;

  editandoPerfil = false;

  showOldPassword = false;
  showNewPassword = false;

  perfilForm: FormGroup = this.formBuilder.group({
    user_nombres: ['', [Validators.required]],
    user_apellidos: ['', [Validators.required]],
    user_username: ['', [Validators.required]],
    user_correo: ['', [Validators.required, Validators.email]]
  });

  passwordForm: FormGroup = this.formBuilder.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.cargarPerfil();
    this.perfilForm.disable();
  }

  cargarPerfil(): void {
    this.loading = true;

    this.usuariosService.obtenerMiPerfil().subscribe({
      next: (res: PerfilMeResponse) => {
        this.perfil = res;
        this.perfilForm.patchValue({
          user_nombres: res.user_nombres,
          user_apellidos: res.user_apellidos,
          user_username: res.user_username,
          user_correo: res.user_correo
        });
        this.editandoPerfil = false;
        this.perfilForm.disable();
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alertas.error('Error', err?.error?.message || 'No se pudo cargar tu perfil');
      }
    });
  }

  habilitarEdicion(): void {
    this.editandoPerfil = true;
    this.perfilForm.enable();
  }

  cancelarEdicion(): void {
    if (!this.perfil) return;
    this.editandoPerfil = false;
    this.perfilForm.patchValue({
      user_nombres: this.perfil.user_nombres,
      user_apellidos: this.perfil.user_apellidos,
      user_username: this.perfil.user_username,
      user_correo: this.perfil.user_correo
    });
    this.perfilForm.markAsPristine();
    this.perfilForm.markAsUntouched();
    this.perfilForm.disable();
  }

  async guardarPerfil(): Promise<void> {
    if (!this.editandoPerfil) return;

    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const confirm = await this.alertas.confirm(
      '¿Guardar cambios?',
      'Se actualizarán tus datos de perfil.',
      'Sí, guardar',
      'Cancelar'
    );
    if (!confirm?.isConfirmed) return;

    this.savingPerfil = true;

    this.usuariosService.actualizarMiPerfil(this.perfilForm.getRawValue()).subscribe({
      next: () => {
        this.savingPerfil = false;
        this.alertas.success('Éxito', 'Perfil actualizado correctamente');
        this.cargarPerfil();
      },
      error: (err: any) => {
        this.savingPerfil = false;
        this.alertas.error('Error', err?.error?.message || 'No se pudo actualizar tu perfil');
      }
    });
  }

  async cambiarContrasenia(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const confirm = await this.alertas.confirm(
      '¿Cambiar contraseña?',
      'Debes confirmar tu contraseña anterior.',
      'Sí, cambiar',
      'Cancelar'
    );
    if (!confirm?.isConfirmed) return;

    this.savingPassword = true;

    const payload = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.usuariosService.cambiarMiContrasenia(payload).subscribe({
      next: () => {
        this.savingPassword = false;
        this.alertas.success('Éxito', 'Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: (err: any) => {
        this.savingPassword = false;
        this.alertas.error('Error', err?.error?.message || 'No se pudo cambiar la contraseña');
      }
    });
  }

  toggleOldPassword(): void {
    this.showOldPassword = !this.showOldPassword;
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  irSetup2FA(): void {
    this.router.navigate(['/home/setup-2fa']);
  }
}
