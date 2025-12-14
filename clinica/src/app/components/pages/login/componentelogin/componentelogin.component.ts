import { Component,  OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InLogin } from '../../../../modelos/InLogin';
import { AuthService } from '../../../../servicios/authservicio.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-componenteloging',
    imports: [RouterLink,ReactiveFormsModule,CommonModule],
    templateUrl: './componentelogin.component.html',
    styleUrl: './componentelogin.component.css'
})
export class ComponenteloginComponent implements OnInit {

  formLogin: FormGroup;
  requires2FA: boolean = false;
  userId: number = 0;
  errorMessage: string = '';
  
  constructor(
    private formBuilder :FormBuilder,
    private authservicio: AuthService,
    private router :Router
  ){
      this.formLogin= formBuilder.group({
        usuario : ['',Validators.required],
        password: ['',Validators.required],
        token2fa: ['']
      });
  }
  ngOnInit(): void {
  this.formLogin.get('usuario')?.valueChanges.subscribe(value => {
    console.log('Usuario:', value);
  });
}

  Login(): void {
    const usuarioLogin: any = {
      nombre_usuario: this.formLogin.value.usuario,
      contrasenia: this.formLogin.value.password
    };

    // Si ya se solicitó 2FA, incluir el código
    if (this.requires2FA && this.formLogin.value.token2fa) {
      usuarioLogin.token2fa = this.formLogin.value.token2fa;
    }

    this.authservicio.login(usuarioLogin).subscribe({
      next: res => {
        console.log('Respuesta del login:', res);
        // Si la respuesta indica que requiere 2FA
        if (res.requires2FA) {
          console.log('2FA requerido para userId:', res.userId);
          this.requires2FA = true;
          this.userId = res.userId || 0;
          this.errorMessage = res.message || '';
          // Agregar validación al campo token2fa
          this.formLogin.get('token2fa')?.setValidators([Validators.required, Validators.pattern(/^\d{6}$/)]);
          this.formLogin.get('token2fa')?.updateValueAndValidity();
        } else {
          // Login exitoso
          console.log('Login exitoso, redirigiendo...');
          this.router.navigate(['home/dashboard']);
        }
      }, 
      error: err => {
        this.errorMessage = err.error?.message || 'Hubo un problema con la autenticación';
        // Si el error es por 2FA inválido, mantener el campo visible
        if (err.error?.requires2FA) {
          this.requires2FA = true;
          this.userId = err.error.userId || 0;
        }
      }
    });
  }


    get  Getusername(): string {
      return this.formLogin.get('usuario')?.value || '';
    }

    //otra   forma de obtener el valor del usuario
  get geTUser(){
    return this.formLogin.get('usuario') as FormControl;

  }
  }





