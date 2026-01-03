import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Asegúrate de que la ruta de importación sea correcta
import { AuditoriaSesion, RespuestaPaginada } from '../modelos/modelHistorial/InHistorial';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  // IMPORTANTE: Verifica si tu backend usa /api/auditoria o solo /auditoria
  private urlServidor = 'http://localhost:3000/auditoria'; 

  constructor(private http: HttpClient) { }

  // 1. Listar Auditoría de Datos
  listar(page: number, size: number, filtro: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      // CAMBIO: El backend espera 'search', no 'filtro'
      .set('search', filtro); 

    return this.http.get<any>(this.urlServidor, { params });
  }

  // 2. Listar Historial de Sesiones
  getAuditoriaSesiones(page: number, size: number, search: string): Observable<RespuestaPaginada<AuditoriaSesion>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', search);

    return this.http.get<RespuestaPaginada<AuditoriaSesion>>(`${this.urlServidor}/sesiones`, { params });
  }

  getFallos(page: number, size: number, search: string): Observable<any> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString())
    .set('search', search);

  return this.http.get<any>(`${this.urlServidor}/fallos`, { params });
}

}