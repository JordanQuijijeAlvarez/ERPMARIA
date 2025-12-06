import { Component } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { PanelcontenidoComponent } from "../panelcontenido/panelcontenido.component";
import { AuthService } from '../../../servicios/authservicio.service';
import { InLogin } from '../../../modelos/InLogin';

@Component({
    selector: 'app-panelprincipal',
    imports: [ SidebarComponent, PanelcontenidoComponent],
    templateUrl: './panelprincipal.component.html',
    styleUrl: './panelprincipal.component.css'

  
})



export class PanelprincipalComponent {
   constructor(
    private authService: AuthService
  ) {}
  openMenu: number | null = null;
  toggleMenu(menuId: number): void {
  this.openMenu = this.openMenu === menuId ? null : menuId;

  
}
usuario:InLogin={
    nombre_usuario:'admin',
    contrasenia:'admin123'
  };
ngOnInit(): void {
 this.authService.login(this.usuario).subscribe({
    next: res => {
      const token = res?.token;
    
      if (token && typeof token === 'string') {
        try {
          this.authService.guardarToken(token);
        } catch {
          console.log( 'Hubo un problema al guardar el token.');
        }
      } else {
        console.log( 'Token no recibido o inválido.');
      }
    },
    error: err => {
      console.log( err.error?.mensaje || 'Código incorrecto');
    }
  });
}

}


