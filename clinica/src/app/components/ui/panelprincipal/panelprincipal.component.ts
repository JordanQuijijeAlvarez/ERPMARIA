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

ngOnInit(): void {
 
}

}


