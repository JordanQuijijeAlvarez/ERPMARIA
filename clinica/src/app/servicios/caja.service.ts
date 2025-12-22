import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InCategoria } from '../modelos/modeloCategoria/InCategoria';

@Injectable({
  providedIn: 'root'
})
export class CajaService {

  private urlServidor = 'http://localhost:3000/caja';


  constructor(private http: HttpClient) { }

 // 1. Verificar si el usuario tiene caja abierta
  verificarEstadoCaja(userId: number): Observable<any> {
    return this.http.get(`${this.urlServidor}/verificar/${userId}`);
  }
  listarHistorialCajas(): Observable<any[]> {
  return this.http.get<any[]>(`${this.urlServidor}/historial`);
}

  // 2. Abrir caja nueva
  abrirCaja(datos: { user_id: number, monto_inicial: number }): Observable<any> {
    return this.http.post(`${this.urlServidor}/abrir`, datos);
  }

  // 3. Obtener los números para el cierre (La Calculadora)
  obtenerResumenCierre(cajaId: number): Observable<any> {
    return this.http.get(`${this.urlServidor}/resumen/${cajaId}`);
  }

  // 4. Guardar el cierre definitivo
  cerrarCaja(datos: { caja_id: number, monto_real: number, observacion: string }): Observable<any> {
    return this.http.post(`${this.urlServidor}/cerrar`, datos);
  }
}