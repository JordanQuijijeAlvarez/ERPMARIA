import { Injectable } from '@angular/core';
import { InMedico } from '../modelos/modelMedicos/InMedico';
import { InEspecialidadMedico } from '../modelos/modelMedicos/InEspecialidadMedico';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InCitasVista } from '../modelos/modeloCitas/InCitasVista';
import { InHorarios } from '../modelos/modeloHorarios/InHorarios';

@Injectable({
  providedIn: 'root'
})

export class MedicosService {

 private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LMedicosEstado (estado: boolean): Observable<InMedico[]> {

    return this.http.get<InMedico[]>(`${this.urlServidor}/medicos/listar/${estado}`);
  }

  LMedicos (): Observable<InMedico[]> {

    return this.http.get<InMedico[]>(`${this.urlServidor}/medicos/listar`);
  }
  LMedicosId(id: number): Observable<InMedico> {

    return this.http.get<InMedico>(`${this.urlServidor}/medicos/${id}`);
  }

  LEspecialidadMedicoId(id: number): Observable<InEspecialidadMedico[]> {

    return this.http.get<InEspecialidadMedico[]>(`${this.urlServidor}/medicos/Especialidad/${id}`);
  }

  LMedicoSinUsuario (): Observable<InMedico[]> {
    return this.http.get<InMedico[]>(`${this.urlServidor}/medicos/ListarSinUsuario`);
  }

  CrearMedico(medico: InMedico): Observable<any> {

    return this.http.post(`${this.urlServidor}/medicos/Registrar`, medico);
  }

  EliminarMedico(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/medicos/Eliminar/${id}`);

  }
  ActualizarMedico(medico: InMedico): Observable<any> {

    return this.http.put(`${this.urlServidor}/medicos/Actualizar`, medico);
  }

  AsignarUsuario(codigoMedico: number, codigoUsuario: number): Observable<any> {
    const body = { codigo_medico: codigoMedico, codigo_usuario: codigoUsuario };
    return this.http.put(`${this.urlServidor}/medicos/asignarUsuario`, body);
  }

  LCitasMedico(id: number): Observable<InCitasVista[]> {
    console.log(id)
    return this.http.get<InCitasVista[]>(`${this.urlServidor}/citas/citasDisponiblesMedico/${id}`);
  }
  LMedicoHorario(id: number): Observable<InHorarios> {
    return this.http.get<InHorarios>(`${this.urlServidor}/medicos/horario/${id}`);
  }



}
