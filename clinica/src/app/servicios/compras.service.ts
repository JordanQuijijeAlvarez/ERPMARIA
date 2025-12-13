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

    return this.http.post(`${this.urlServidor}/compras/Registrar`, venta);
  }



  getDetalleCompras(id: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/compras/detalle/${id}`);
  }

  getComprasEstado(estado: number): Observable<any> {

    return this.http.get<any>(`${this.urlServidor}/compras/listar/${estado}`);
  }

  ObtenerCompraPorId(idCompra: number): Observable<any> {
    return this.http.get<any>(`${this.urlServidor}/compras/${idCompra}`);
  }

    ActualizarCompra(venta: InCompraCompleto): Observable<any> {
    return this.http.put(`${this.urlServidor}/compras/Actualizar`,venta);

  } 

  
  AnularCompra(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/compras/Anular/${id}`);

  }

}