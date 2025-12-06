import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InMedicoEspecialidad } from '../modelos/modeloEspecialidades/InMedicoEspecialidad';

@Injectable({
  providedIn: 'root'
})
export class MedicoEspecialidadService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  CrearMedicoEspecialidad(especialidades: any[]): Observable<any> {
    return this.http.post(`${this.urlServidor}/medicoespecialidad/Registrar`, especialidades);
  }

  // EliminarMedicoEspecialidad(especialidades: any[]):Observable<any>{
  //   return this.http.delete(`${this.urlServidor}/medicoespecialidad/Eliminar${especialidades}`);
  // }

  EliminarMedicoEspecialidad(codigos: string[]): Observable<any> {
    const params = codigos.map(codigo => `codigo=${codigo}`).join('&');
    return this.http.delete(`${this.urlServidor}/medicoespecialidad/Eliminar?${params}`);
  }


    
}