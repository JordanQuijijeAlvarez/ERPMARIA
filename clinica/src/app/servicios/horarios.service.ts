import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InHorarios } from '../modelos/modeloHorarios/InHorarios';

@Injectable({
  providedIn: 'root'
})
export class horariosService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }
  
  LhorariosEstado (estado: boolean): Observable<InHorarios[]> {

    return this.http.get<InHorarios[]>(`${this.urlServidor}/horarios/listar/${estado}`);
  }


  Lhorarios (): Observable<InHorarios[]> {

    return this.http.get<InHorarios[]>(`${this.urlServidor}/horarios/listar`);
  }
  LhorariosId(id: number): Observable<InHorarios> {

    return this.http.get<InHorarios[]>(`${this.urlServidor}/horarios/${id}`).pipe(map((horarios) => horarios[0]));
  }


  CrearHorario(horarios: InHorarios): Observable<any> {

    return this.http.post(`${this.urlServidor}/horarios/Registrar`, horarios);
  }


  EliminarHorario(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/horarios/eliminar/${id}`);

  }
  ActualizarHorario(horarios: InHorarios): Observable<any> {

    return this.http.put(`${this.urlServidor}/horarios/Actualizar`, horarios);
  }
}