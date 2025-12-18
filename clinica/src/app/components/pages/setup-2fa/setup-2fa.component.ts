import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../servicios/authservicio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-2fa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup-2fa.component.html',
  styleUrl: './setup-2fa.component.css'
})
export class Setup2faComponent implements OnInit {
  qrCode: string = '';
  secret: string = '';
  verificationForm: FormGroup;
  showQR: boolean = false;
  isEnabled: boolean = false;
  userId: number = 0;
  loading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  constructor() {
    this.verificationForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.getUserId();
    this.check2FAStatus();
  }

  getUserId(): void {
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userId = payload.id;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.showMessage('Error al obtener información del usuario', 'error');
      }
    }
  }

  check2FAStatus(): void {
    if (this.userId) {
      this.authService.check2FAStatus(this.userId).subscribe({
        next: (response: any) => {
          this.isEnabled = response.enabled;
        },
        error: (error: any) => {
          console.error('Error al verificar estado 2FA:', error);
        }
      });
    }
  }

  setup2FA(): void {
    console.log('Setup2FA - userId:', this.userId);
    
    if (!this.userId || this.userId === 0) {
      this.showMessage('Error: No se pudo obtener el ID del usuario. Intenta cerrar sesión y volver a entrar.', 'error');
      return;
    }
    
    this.loading = true;
    this.authService.setup2FA(this.userId).subscribe({
      next: (response: any) => {
        console.log('Respuesta setup2FA:', response);
        this.qrCode = response.qrCode;
        this.secret = response.secret;
        this.showQR = true;
        this.loading = false;
        this.showMessage('Escanea el código QR con Google Authenticator', 'success');
      },
      error: (error: any) => {
        console.error('Error en setup2FA:', error);
        this.loading = false;
        this.showMessage('Error al generar código QR: ' + (error.error?.message || 'Error desconocido'), 'error');
      }
    });
  }

  verifyCode(): void {
    if (this.verificationForm.valid) {
      this.loading = true;
      const code = this.verificationForm.value.code;
      
      this.authService.verify2FA(this.userId, code).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.isEnabled = true;
          this.showQR = false;
          this.verificationForm.reset();
          this.showMessage('¡Autenticación de dos factores activada exitosamente!', 'success');
        },
        error: (error: any) => {
          this.loading = false;
          this.showMessage('Código inválido. Verifica e intenta nuevamente.', 'error');
        }
      });
    }
  }

  disable2FA(): void {
    if (confirm('¿Estás seguro de que deseas desactivar la autenticación de dos factores?')) {
      this.loading = true;
      this.authService.disable2FA(this.userId).subscribe({
        next: (response: any) => {
          this.loading = false;
          this.isEnabled = false;
          this.showQR = false;
          this.qrCode = '';
          this.secret = '';
          this.showMessage('Autenticación de dos factores desactivada', 'success');
        },
        error: (error: any) => {
          this.loading = false;
          this.showMessage('Error al desactivar 2FA: ' + (error.error?.message || 'Error desconocido'), 'error');
        }
      });
    }
  }

  showMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 5000);
  }

  goBack(): void {
    this.router.navigate(['/home/perfil']);
  }
}
