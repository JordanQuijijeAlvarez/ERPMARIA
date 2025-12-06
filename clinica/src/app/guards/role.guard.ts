import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../servicios/authservicio.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const userRole = this.authService.obtenerRol();
    const allowedRoles = route.data['roles'] as string[];

    if (!userRole || !allowedRoles.includes(userRole)) {
      this.router.navigate(['/no-autorizado']);
      return false;
    }

    return true;
  }
}
