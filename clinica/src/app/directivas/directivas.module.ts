import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MostrarSiRolDirective } from './mostrarSiRol.directive';  // Asegúrate de que la ruta sea correcta

@NgModule({
  declarations: [MostrarSiRolDirective],
  imports: [CommonModule],
  exports: [MostrarSiRolDirective] // Exporta la directiva para que puedas usarla en otros componentes
})
export class DirectivasModule { }
