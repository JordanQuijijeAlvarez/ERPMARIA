import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../servicios/authservicio.service';
import { DirectivasModule } from '../../../directivas/directivas.module';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    imports: [RouterLink,DirectivasModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  constructor(private authService: AuthService) { }

  nombreUserAccedido: string = '';
  
   
  ngOnInit(): void {
    this.nombreUserAccedido = this.authService.cargarInfoUsuario();

  }


 

}
