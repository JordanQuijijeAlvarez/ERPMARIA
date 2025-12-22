import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CajaService } from '../servicios/caja.service'; // Ajusta tu ruta
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class CajaAbiertaGuard implements CanActivate {

  constructor(private cajaService: CajaService, private router: Router) {}

  canActivate(): Observable<boolean> {
    
    // 1. Obtener ID del usuario logueado (Ajusta según tu Auth)
    const userId = JSON.parse(localStorage.getItem('user_id') || '{}');

    if (!userId) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // 2. Consultar al Backend
    return this.cajaService.verificarEstadoCaja(userId).pipe(
      map((res: any) => {
        if (res.abierta) {
          // TIENE CAJA ABIERTA -> PASA
          return true;
        } else {
          // CAJA CERRADA -> BLOQUEAR Y REDIRIGIR
          this.mostrarAlerta();
          this.router.navigate(['/home/caja']); // Redirige al módulo de caja
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error verificando caja', error);
        return of(false); // Si falla la conexión, bloqueamos por seguridad
      })
    );
  }

  mostrarAlerta() {
    Swal.fire({
      icon: 'warning',
      title: '¡Caja Cerrada!',
      text: 'Para realizar ventas o compras, primero debes abrir tu caja.',
      confirmButtonText: 'Ir a Abrir Caja',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
      allowEscapeKey: false
    });
  }
}