import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { InCategoria } from '../modelos/modeloCategoria/InCategoria';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

  LCategoriasEstado (estado: number): Observable<InCategoria[]> {
    return this.http.get<InCategoria[]>(`${this.urlServidor}/categorias/listar/${estado}`);
  }

  
  CrearCategoria(categorias: InCategoria): Observable<any> {

    return this.http.post(`${this.urlServidor}/categorias/Registrar`, categorias);
  }


  LSubcategorias (): Observable<InCategoria[]> {

    return this.http.get<InCategoria[]>(`${this.urlServidor}/categorias/listar`);
  }
  LSubcategoriasId(id: number): Observable<InCategoria> {

    return this.http.get<InCategoria[]>(`${this.urlServidor}/categorias/${id}`).pipe(map((Subcategorias) => Subcategorias[0]));
  }


  CrearConsultorio(Subcategorias: InCategoria): Observable<any> {

    return this.http.post(`${this.urlServidor}/categorias/Registrar`, Subcategorias);
  }


  EliminarCategoria(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/categorias/eliminar/${id}`);

  }
  ActualizarCategoria(Subcategorias: InCategoria): Observable<any> {

    return this.http.put(`${this.urlServidor}/categorias/Actualizar`, Subcategorias);
  }
}