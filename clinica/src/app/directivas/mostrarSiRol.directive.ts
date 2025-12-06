import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../servicios/authservicio.service';

@Directive({
    selector: '[appMostrarSiRol]',
    standalone: false
})
export class MostrarSiRolDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input() set appMostrarSiRol(rolesPermitidos: string[]) {
    const rolUsuario = this.authService.obtenerRol();

    if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
