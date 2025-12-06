import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InPaciente } from '../modelos/modelPacientes/InPacientes';

@Injectable({
  providedIn: 'root'
})
export class PacientesService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LPacientesEstado (estado: boolean): Observable<InPaciente[]> {

    return this.http.get<InPaciente[]>(`${this.urlServidor}/pacientes/listar/${estado}`);
  }


  LPacientes (): Observable<InPaciente[]> {

    return this.http.get<InPaciente[]>(`${this.urlServidor}/pacientes/listar`);
  }
  LPacientesId(id: number): Observable<InPaciente> {

    return this.http.get<InPaciente>(`${this.urlServidor}/pacientes/${id}`);
  }

  LPacientesCedulaEstado(cedula: string,estado : boolean): Observable<InPaciente> {

    return this.http.get<InPaciente>(`${this.urlServidor}/pacientes/${cedula}/${estado}`);
  }


  CrearPaciente(paciente: InPaciente): Observable<any> {

    return this.http.post(`${this.urlServidor}/pacientes/Registrar`, paciente);
  }


  EliminarPaciente(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/pacientes/eliminar/${id}`);

  }
  ActualizarPaciente(paciente: InPaciente): Observable<any> {

    return this.http.put(`${this.urlServidor}/pacientes/Actualizar`, paciente);
  }


}
