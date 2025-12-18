import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MedicosService } from '../../../servicios/medicos.service';
import { AuthService } from '../../../servicios/authservicio.service';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../servicios/Alertas/alertas.service';

@Component({
    selector: 'app-header',
    imports: [CommonModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  nombreUserAccedido: string='';
  rol: string='';

  constructor(
        private router: Router,
    private authService: AuthService,
    private alertaServ :AlertService

  ) {}
  ngOnInit(): void {
    this.nombreUserAccedido = this.authService.cargarInfoUsuario();
    this.rol= this.authService.obtenerRol()??'';

  }
 

  isDropdownOpen = false;
  isSubMenuOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.isSubMenuOpen = false; // Cerrar submenú si el menú principal se cierra
    }
  }

  toggleSubMenu() {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }

  cerrarSesion(){
    this.alertaServ.preguntaRedireccion('¿CERRAR SESIÓN?', 'login');
  }

  irPerfil(){
    this.isDropdownOpen = false;
    this.router.navigate(['/home/perfil']);
  }
 
  
}
