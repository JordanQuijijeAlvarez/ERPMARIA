import { Component } from '@angular/core';
import { PanelprincipalComponent } from "./components/ui/panelprincipal/panelprincipal.component";
import { ComponenteloginComponent } from "./components/pages/login/componentelogin/componentelogin.component";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'clinica';
}
