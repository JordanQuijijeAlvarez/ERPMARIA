import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  private urlServidor = 'http://localhost:3000/auditoria';


  constructor(private http: HttpClient) { }
listar(page: number, size: number, filtro: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('filtro', filtro);

    return this.http.get<any>(this.urlServidor, { params });
  }
}