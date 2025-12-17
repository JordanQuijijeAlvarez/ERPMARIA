// export interface  InUsuario{
//     codigo:string,
//     codigo_rol: string,	
// 	nombre_usuario: string,
//     contrasenia: string,
//     email: string

//     // estado:string,
// }

// export interface InUsuarioVista {
//     codigo_usuario: string,	
// 	nombre_usuario: string,
//     contrasenia: string,
//     email: string,
//     rol_nombre: string;
//     rol_descripcion: string;
//     estado:string,
// }

export interface InUsuario{
    user_id: string,
    user_nombres: string,
    user_apellidos: string,
    user_username: string,
    user_contrasenia: string,
    user_correo: string,
    user_estado: string
}

export interface InUsuarioVista{
    user_id: string,
    user_nombres: string,
    user_apellidos: string,
    user_username: string,
    user_contrasenia: string,
    user_correo: string,
    user_estado: string,
    rol_id: string,
    rol_nombre: string,
    // user_rol_descripcion: string //La tabla no tiene esta columna
}