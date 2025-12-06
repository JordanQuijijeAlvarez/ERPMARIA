export interface  InUsuario{
    codigo:string,
    codigo_rol: string,	
	nombre_usuario: string,
    contrasenia: string,
    email: string

    // estado:string,
}

export interface InUsuarioVista {
    codigo_usuario: string,	
	nombre_usuario: string,
    contrasenia: string,
    email: string,
    rol_nombre: string;
    rol_descripcion: string;
    estado:string,
}

