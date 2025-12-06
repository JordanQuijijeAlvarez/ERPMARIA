import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgModel,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuariosService } from '../../../../servicios/usuarios.service';
import { AuthService } from '../../../../servicios/authservicio.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperarcontrasena',
  imports: [ReactiveFormsModule ,CommonModule,RouterLink ],
  templateUrl: './recuperarcontrasena.component.html',
  styleUrl: './recuperarcontrasena.component.css',
})
export class RecuperarContraseniaComponent {
  form: FormGroup;
  username: string = '';
  correo: string = '';
  banderaenvio: boolean = false;

  servUser = inject(UsuariosService);
  servlogin = inject(AuthService);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
        private router: Router,

  ) {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      nuevaContrasenia: ['', Validators.required],
    });
  }

  ngOnInit(): void {
      this.form.get('codigo')?.setValue('');

    this.username = this.route.snapshot.paramMap.get('username') || '';
    this.obtenerCorreo();
  }

  obtenerCorreo() {
    this.servUser.ObtenerCorreoCifrado(this.username).subscribe({
      next: (res) => {
        this.correo = res.correoOculto;
      },
      error: (err) => {
        alert('ERROR AL OBTENER CORREO, COMUNIQUESE CON ADMINISTRADOR DE TI'); 
         this.router.navigate(['/login']);
      },
    });
  }

  enviarCodigo() {
    this.servlogin.enviarCodigoAcorreo(this.username).subscribe({
      next: (res) => {
        this.banderaenvio = true;
        alert('Código enviado al correo.');
      },
      error: (err) => {
        this.banderaenvio = false;
         alert('Error al enviar el código: ' + err.error.message);
      },
    });
  }


  

  actualizarContrasenia() {
    if (this.form.invalid) return;


    this.servlogin.actualizarContrasenia(this.username,this.Getcodigo.value,this.GetnuevaContrasenia.value).subscribe(
        (res: any) => {
          alert(res.mensaje || 'Contraseña actualizada correctamente');
          this.router.navigate(['/login']);
        },
        (err) => {
          alert('Código inválido o error al actualizar la contraseña');
        }
      );
  }

  get Getcodigo(): FormControl {
    return this.form.get('codigo') as FormControl;
  }

  get GetnuevaContrasenia(): FormControl {
    return this.form.get('nuevaContrasenia') as FormControl;
  }
}
