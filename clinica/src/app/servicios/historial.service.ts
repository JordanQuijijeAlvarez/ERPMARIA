import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';


import { InCitaPacienteLista } from '../modelos/modeloCitas/InCitaPacienteLista';
import { InConsultas } from '../modelos/modeloConsultas/InConsultas';
import { InHistorial, InHistorialLista } from '../modelos/modeloHistorial/InHistorial';

@Injectable({
  providedIn: 'root'
})
export class historialService {

  private urlServidor = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  LhistorialcedPacientecodMedicoFechaIF (cedulaPaciente:any,codigoMedico: any,fechaInicio:any,fechaFin:any): Observable<InHistorialLista[]> {

    return this.http.get<InHistorialLista[]>(`${this.urlServidor}/consultas/historialCondicional/${cedulaPaciente}/${codigoMedico}/${fechaInicio}/${fechaFin}`);
  }
   LhistorialCodigoConsulta (codigo_consulta:number): Observable<InHistorial> {

    console.log(codigo_consulta);
    return this.http.get<InHistorial>(`${this.urlServidor}/consultas/historialCodConsulta/${codigo_consulta}`);
  }
  CrearConsulta(consulta: InConsultas): Observable<any> {

    return this.http.post(`${this.urlServidor}/consultas/Registrar`, consulta);
  }


  

}