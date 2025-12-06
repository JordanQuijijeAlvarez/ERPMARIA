import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DirectivasModule } from '../../../directivas/directivas.module';
import { AlertService } from '../../../servicios/Alertas/alertas.service';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterLink, DirectivasModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  openMenu: number | null = null;
  isClosing: boolean = false;
  userRole: string = 'administrador'; 

  constructor(
    private alertaServ:AlertService
  ){
  }

  toggleMenu(menuId: number): void {
    if (this.openMenu === menuId) {
      this.isClosing = true;
      
      setTimeout(() => {
        this.openMenu = null;
        this.isClosing = false;
      }, 300);
    } else {
      this.isClosing = false;
      this.openMenu = menuId;
    }
  }

  cerrarSesion(){
    this.alertaServ.preguntaRedireccion('¿CERRAR SESIÓN?', 'login');
  }
 
}
