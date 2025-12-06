import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InUsuario, InUsuarioVista } from '../modelos/modeloUsuarios/InUsuarios';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }
  

  LUsuarios (): Observable<InUsuarioVista[]> {

    return this.http.get<InUsuarioVista[]>(`${this.urlServidor}/usuarios/listar`);
  }

  LUsuariosId(id: number): Observable<InUsuario> {
  
    return this.http.get<InUsuario>(`${this.urlServidor}/usuarios/${id}`);
  }
    
  CrearUsuario(usuarios: InUsuario): Observable<any> {

    return this.http.post(`${this.urlServidor}/usuarios/Registrar`, usuarios);
  }


  EliminarUsuario(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/usuarios/Eliminar/${id}`);

  }
  ActualizarUsuario(usuarios: InUsuario): Observable<any> {

    return this.http.put(`${this.urlServidor}/usuarios/Actualizar`, usuarios);
  }


   ObtenerCorreoCifrado(username: string): Observable<any> {

       return this.http.post(`${this.urlServidor}/usuarios/recuperar/correo`,{ 'nombreUsuario': username });
     }
}