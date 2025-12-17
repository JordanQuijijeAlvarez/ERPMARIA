import { Injectable } from '@angular/core';
import { InProducto, InProductoDetalle } from '../modelos/modeloProductos/InProducto';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class productosService {

 private urlServidor = 'http://localhost:3000';


  constructor(private http: HttpClient) { }

  

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

  CrearProducto(producto: InProducto): Observable<any> {

    return this.http.post(`${this.urlServidor}/productos/Registrar`, producto);
  }

  EliminarProducto(id:number):Observable<any>{
    return this.http.delete(`${this.urlServidor}/productos/Eliminar/${id}`);

  }
  Actualizarproducto(producto: InProducto): Observable<any> {

    return this.http.put(`${this.urlServidor}/productos/Actualizar`, producto);
  }


  
    LproductosPrecioNovedad (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/alerta`);
    }
    obtenerSinMovimiento (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/alerta/prodsinmov`);
    }

    obtenerKPIVentas (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/alerta/kpiventas`);
    }
      obtenerStockBajo (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/alerta/stock`);
    }


    obtenerGraficoVentas (dia:number): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/info/ventas/${dia}`);
    }
    obtenerGraficoTop (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/info/top`);
    }
    obtenerGraficoFinanzas (): Observable<any[]> {
      return this.http.get<any[]>(`${this.urlServidor}/productos/info/finanzas`);
    }




    ActualizarPrecio (precio :any)  {
      return this.http.put(`${this.urlServidor}/productos/actualizar/precioprod`, precio);
    }
  

}
