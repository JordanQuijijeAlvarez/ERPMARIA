import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InProveedor } from '../modelos/modelProveedor/InProveedor';
// Asegúrate de importar la interfaz correcta que creamos arriba

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private urlServidor = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  /**
   * Lista proveedores filtrando por estado (si tu backend lo soporta)
   * @param estado '1' para activos, '0' para inactivos, etc.
   */
  LproveedorEstado(estado: number): Observable<InProveedor[]> {
    return this.http.get<InProveedor[]>(`${this.urlServidor}/proveedores/listar/${estado}`);
  }

  /**
   * Lista todos los proveedores sin filtro
   */
  Lproveedor(): Observable<InProveedor[]> {
    return this.http.get<InProveedor[]>(`${this.urlServidor}/proveedores/listar`);
  }

  /**
   * Obtiene un proveedor por su RUC (clave primaria)
   * Nota: Cambié 'id: number' por 'ruc: string' basado en tu BD.
   */
  ObtenerProveedor(ruc: string): Observable<InProveedor> {
    return this.http.get<InProveedor>(`${this.urlServidor}/proveedores/${ruc}`);
  }

  /**
   * Busca un proveedor especifico por RUC y estado
   * Útil para validaciones antes de crear
   */
  LproveedorRucEstado(ruc: string, estado: string): Observable<InProveedor> {
    return this.http.get<InProveedor>(`${this.urlServidor}/proveedores/${ruc}/${estado}`);
  }

  /**
   * Registra un nuevo proveedor
   */
  CrearProveedor(proveedor: InProveedor): Observable<any> {
    return this.http.post(`${this.urlServidor}/proveedores/Registrar`, proveedor);
  }

  /**
   * Elimina un proveedor
   * Nota: Se usa el RUC como identificador
   */
  EliminarProveedor(id: string): Observable<any> {
    // Si tu backend requiere que el ID sea numérico, cambia esto. 
    // Pero por la imagen 'PROVE_RUC', asumo que se elimina por string.
    return this.http.delete(`${this.urlServidor}/proveedores/Eliminar/${id}`);
  }

  /**
   * Actualiza los datos de un proveedor
   */
  ActualizarProveedor(proveedor: InProveedor): Observable<any> {
    return this.http.put(`${this.urlServidor}/proveedores/Actualizar`, proveedor);
  }

}