import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../servicios/authservicio.service';

@Component({
  selector: 'app-verificacion-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verificacion-otp.component.html',
  styleUrls: ['./verificacion-otp.component.css']
})
export class VerificacionOtpComponent {
  @Input() codigoUsuario!: number;

  formOtp: FormGroup;
  mensajeError: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.formOtp = this.fb.group({
      codigo_otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });

    this.route.queryParams.subscribe((params) => {
      this.codigoUsuario = +params['codigo_usuario'];
    });
  }

  verificarOTP() {
  const codigo_otp = this.formOtp.value.codigo_otp;

  this.authService.verificarOTP(this.codigoUsuario, codigo_otp).subscribe({
    next: res => {
      const token = res?.token;
    
      if (token && typeof token === 'string') {
        try {
          this.authService.guardarToken(token);
          setTimeout(() => this.router.navigate(['home/dashboard']), 0);
        } catch {
          this.mensajeError = 'Hubo un problema al guardar el token.';
        }
      } else {
        this.mensajeError = 'Token no recibido o inválido.';
      }
    },
    error: err => {
      this.mensajeError = err.error?.mensaje || 'Código incorrecto';
    }
  });
}
}
