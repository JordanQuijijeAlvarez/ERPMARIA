import { Injectable } from '@angular/core';
import { InProducto, InProductoDetalle } from '../modelos/modeloProductos/InProducto';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { InVentaCompleto } from '../modelos/modeloVentas/InVentas';
import { InCompraCompleto } from '../modelos/modeloCompras/InCompras';

@Injectable({
  providedIn: 'root'
})

export class compraService {
  confirmarRecepcionCompra(id: number): Observable<any> {

    return this.http.post(`${this.urlServidor}/ventas/Registrar`, id);
  }

  

 private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  
CrearCompra(venta: InCompraCompleto): Observable<any> {

    return this.http.post(`${this.urlServidor}/ventas/Registrar`, venta);
  }



  getDetalleCompras(id: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/ventas/detalle/${id}`);
  }

  getComprasEstado(estado: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/ventas/${estado}`);
  }

  ObtenerCompraPorId(idVenta: number): Observable<any> {
    return this.http.get<any>(`${this.urlServidor}/ventas/obtener/${idVenta}`);

  }

    ActualizarCompra(idVenta: number,venta: InCompraCompleto): Observable<any> {
    return this.http.put(`${this.urlServidor}/ventas/Actualizar/${idVenta}`,venta);

  } 

  
  AnularCompra(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/ventas/Anular/${id}`);

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

  

  Actualizarproducto(producto: InProducto): Observable<any> {

    return this.http.put(`${this.urlServidor}/productos/Actualizar`, producto);
  }


}
