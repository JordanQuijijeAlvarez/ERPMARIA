import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


import { InCitaPacienteLista } from '../modelos/modeloCitas/InCitaPacienteLista';
import { InConsultas } from '../modelos/modeloConsultas/InConsultas';

@Injectable({
  providedIn: 'root'
})
export class consultasService {

  private urlServidor = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  LcitasPacientesPendientes (id:number,estado: boolean): Observable<InCitaPacienteLista[]> {

    return this.http.get<InCitaPacienteLista[]>(`${this.urlServidor}/consultas/citasPendientes/${id}/${estado}`);
  }
 
  CrearConsulta(consulta: InConsultas): Observable<any> {

    return this.http.post(`${this.urlServidor}/consultas/Registrar`, consulta);
  }


  

}