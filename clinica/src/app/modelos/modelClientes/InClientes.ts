export interface InClientes {
  client_id:number,	
	client_cedula: string,
	client_nombres: string,
	client_apellidos:string,
	client_direccion:string,
	client_correo:string
    //estado: string,
  user_id?:number;
	client_fechregistro?:Date
}