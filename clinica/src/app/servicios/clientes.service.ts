import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { InClientes } from '../modelos/modelClientes/InClientes';

@Injectable({
  providedIn: 'root'
})
export class clienteService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LclienteEstado (estado: string): Observable<InClientes[]> {

    return this.http.get<InClientes[]>(`${this.urlServidor}/clientes/listar/${estado}`);
  }


  Lcliente (): Observable<InClientes[]> {

    return this.http.get<InClientes[]>(`${this.urlServidor}/clientes/listar`);
  }
  LclienteId(id: number): Observable<InClientes> {

    return this.http.get<InClientes>(`${this.urlServidor}/clientes/${id}`);
  }

  LclienteCedulaEstado(cedula: string,estado : string): Observable<InClientes> {

    return this.http.get<InClientes>(`${this.urlServidor}/clientes/${cedula}/${estado}`);
  }


  Crearcliente(cliente: InClientes): Observable<any> {

    return this.http.post(`${this.urlServidor}/clientes/Registrar`, cliente);
  }


  Eliminarcliente(id:number, userid:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/clientes/eliminar/${id}`, { body: { user_id: userid } });

  }
  Actualizarcliente(cliente: InClientes): Observable<any> {

    return this.http.put(`${this.urlServidor}/clientes/Actualizar`, cliente);
  }


}
