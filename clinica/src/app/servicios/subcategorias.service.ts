import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InSubcategoria } from '../modelos/modeloSubcategoria/InSubcategoria';

@Injectable({
  providedIn: 'root'
})
export class SubcategoriasService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LSubcategoriasEstado (estado: boolean): Observable<InSubcategoria[]> {

    return this.http.get<InSubcategoria[]>(`${this.urlServidor}/subcategoria/listar/${estado}`);
  }


  LSubcategorias (): Observable<InSubcategoria[]> {

    return this.http.get<InSubcategoria[]>(`${this.urlServidor}/Subcategorias/listar`);
  }
  LSubcategoriasId(id: number): Observable<InSubcategoria> {

    return this.http.get<InSubcategoria[]>(`${this.urlServidor}/Subcategorias/${id}`).pipe(map((Subcategorias) => Subcategorias[0]));
  }


  CrearConsultorio(Subcategorias: InSubcategoria): Observable<any> {

    return this.http.post(`${this.urlServidor}/Subcategorias/Registrar`, Subcategorias);
  }


  EliminarConsultorio(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/Subcategorias/eliminar/${id}`);

  }
  ActualizarConsultorio(Subcategorias: InSubcategoria): Observable<any> {

    return this.http.put(`${this.urlServidor}/Subcategorias/Actualizar`, Subcategorias);
  }
}