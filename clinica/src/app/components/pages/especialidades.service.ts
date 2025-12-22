import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InEspecialidades } from '../modelos/modeloEspecialidades/InEspecialidades';

@Injectable({
  providedIn: 'root'
})
export class especialidadesService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LespecialidadesEstado (estado: boolean): Observable<InEspecialidades[]> {

    return this.http.get<InEspecialidades[]>(`${this.urlServidor}/especialidades/listar/${estado}`);
  }


  Lespecialidades (): Observable<InEspecialidades[]> {

    return this.http.get<InEspecialidades[]>(`${this.urlServidor}/especialidades/listar`);
  }
  LespecialidadesId(id: number): Observable<InEspecialidades> {

    return this.http.get<InEspecialidades[]>(`${this.urlServidor}/especialidades/${id}`).pipe(map((especialidades) => especialidades[0]));
  }


  CrearEspecialidad(especialidades: InEspecialidades): Observable<any> {

    return this.http.post(`${this.urlServidor}/especialidades/Registrar`, especialidades);
  }


  EliminarEspecialidad(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/especialidades/eliminar/${id}`);

  }
  ActualizarEspecialidad(especialidades: InEspecialidades): Observable<any> {

    return this.http.put(`${this.urlServidor}/especialidades/Actualizar`, especialidades);
  }


 

}