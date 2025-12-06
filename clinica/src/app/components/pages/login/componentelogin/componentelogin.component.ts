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
  constructor(
    private formBuilder :FormBuilder,
    private authservicio: AuthService,
    private router :Router
  ){
      this.formLogin= formBuilder.group({
        usuario : ['',Validators.required],
        password: ['',Validators.required]
        
      });
  }
  ngOnInit(): void {
  this.formLogin.get('usuario')?.valueChanges.subscribe(value => {
    console.log('Usuario:', value);
  });
}

  Login(): void {
  const usuarioLogin: InLogin = {
    nombre_usuario: this.formLogin.value.usuario,
    contrasenia: this.formLogin.value.password
  };

  this.authservicio.loginConOTP(usuarioLogin).subscribe({
    next: res => {
      const codigoUsuario = res.usuario_codigo;
      
      // Aquí puedes navegar a la ruta del nuevo componente o mostrar un modal
      this.router.navigate(['/verificacion-otp'], { queryParams: { codigo_usuario: codigoUsuario } });

    }, error: err => {
      alert('Hubo un problema con la autenticación: ' + err.error.mensaje);
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





