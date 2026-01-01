export interface Auditoria {
  audi_id: number;
  audi_tabla: string;       // Ej: 'PRODUCTO', 'USUARIO'
  audi_registroid: number;  // ID del registro afectado
  audi_operacion: string;   // Ej: 'INSERT', 'UPDATE', 'DELETE'
  audi_datoantig?: string;  // CLOB en base de datos
  audi_datonuevo?: string;  // CLOB en base de datos
  user_id: number;
  usuario_nombre?: string;  // Campo calculado (JOIN con tabla USUARIO en backend)
  audi_fechregistro: Date;
}

export interface AuditoriaSesion {
  sesion_id: number;
  usuario: string;
  ip_address: string;
  user_agent: string;
  fecha_inicio: string;
  ultima_actividad: string;
  activo: boolean;
  fingerprint: string;
}

// Interfaz genérica para la respuesta paginada del backend
export interface RespuestaPaginada<T> {
  total: number;
  ok: boolean;
  data: T[];
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}