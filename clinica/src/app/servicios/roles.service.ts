import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InRoles } from '../modelos/modeloRoles/InRoles';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }
  

  
  LRoles(): Observable<InRoles[]> {
    return this.http.get<InRoles[]>(`${this.urlServidor}/roles/listarRoles`);
  }

  
  LRolesId(id: number): Observable<InRoles> {

    return this.http.get<InRoles>(`${this.urlServidor}/roles/${id}`);
  }

}