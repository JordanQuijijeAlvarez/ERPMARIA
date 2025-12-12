export interface InProveedor {
	prove_id?:Number;
    prove_ruc: string;        // ID Principal
    prove_nombre: string;
    prove_telefono: string;
    prove_correo:string;
    prove_direccion: string;
    prove_descripcion?: string; // Opcional
}