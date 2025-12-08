import { Injectable } from '@angular/core';
import { InProducto, InProductoDetalle } from '../modelos/modeloProductos/InProducto';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InVentaCompleto } from '../modelos/modeloVentas/InVentas';

@Injectable({
  providedIn: 'root'
})

export class ventaService {

 private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  
CrearVenta(venta: InVentaCompleto): Observable<any> {

    return this.http.post(`${this.urlServidor}/ventas/Registrar`, venta);
  }



  getDetalleVentas(id: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/ventas/detalle/${id}`);
  }

  getVentasEstado(estado: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/ventas/${estado}`);
  }


  LproductosEstado (estado: number): Observable<InProductoDetalle[]> {

    return this.http.get<InProductoDetalle[]>(`${this.urlServidor}/productos/listar/${estado}`);
  }

  BuscarprodCodBarras (codbarra: string,estado: number): Observable<InProducto> {

    return this.http.get<InProducto>(`${this.urlServidor}/productos/${codbarra}/${estado}`);
  }

  Lproductos (): Observable<InProducto[]> {

    return this.http.get<InProducto[]>(`${this.urlServidor}/productos/listar`);
  }
  LproductosId(id: number): Observable<InProducto> {

    return this.http.get<InProducto>(`${this.urlServidor}/productos/${id}`);
  }

  LproductosinUsuario (): Observable<InProducto[]> {
    return this.http.get<InProducto[]>(`${this.urlServidor}/productos/ListarSinUsuario`);
  }

  

  EliminarProducto(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/productos/Eliminar/${id}`);

  }
  Actualizarproducto(producto: InProducto): Observable<any> {

    return this.http.put(`${this.urlServidor}/productos/Actualizar`, producto);
  }


}
