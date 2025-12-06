import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InConsultorios } from '../modelos/modelConsultorios/InConsultorios';

@Injectable({
  providedIn: 'root'
})
export class ConsultoriosService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LConsultoriosEstado (estado: boolean): Observable<InConsultorios[]> {

    return this.http.get<InConsultorios[]>(`${this.urlServidor}/consultorios/listar/${estado}`);
  }


  LConsultorios (): Observable<InConsultorios[]> {

    return this.http.get<InConsultorios[]>(`${this.urlServidor}/consultorios/listar`);
  }
  LConsultoriosId(id: number): Observable<InConsultorios> {

    return this.http.get<InConsultorios[]>(`${this.urlServidor}/consultorios/${id}`).pipe(map((consultorios) => consultorios[0]));
  }


  CrearConsultorio(consultorios: InConsultorios): Observable<any> {

    return this.http.post(`${this.urlServidor}/consultorios/Registrar`, consultorios);
  }


  EliminarConsultorio(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/consultorios/eliminar/${id}`);

  }
  ActualizarConsultorio(consultorios: InConsultorios): Observable<any> {

    return this.http.put(`${this.urlServidor}/consultorios/Actualizar`, consultorios);
  }
}