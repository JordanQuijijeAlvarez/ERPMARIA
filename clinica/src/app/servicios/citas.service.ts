import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InEspecialidades } from '../modelos/modeloEspecialidades/InEspecialidades';
import { InMedico } from '../modelos/modelMedicos/InMedico';

import { InCitas } from '../modelos/modeloCitas/InCitas';
import { InCitaPacienteLista } from '../modelos/modeloCitas/InCitaPacienteLista';

@Injectable({
  providedIn: 'root'
})
export class citasService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  



  LcitasPacientesPendientes (id:number,estado: boolean): Observable<InCitaPacienteLista[]> {

    return this.http.get<InCitaPacienteLista[]>(`${this.urlServidor}/consultas/citasPendientes/${id}/${estado}`);
  }
 

  CrearCita(cita: InCitas): Observable<any> {

    return this.http.post(`${this.urlServidor}/citas/Registrar`, cita);
  }


  

}