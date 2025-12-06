export interface InMedico {
    codigo: string,	
	codigo_consultorio: string,
	codigo_horario: string,
	cedula: string,
	licencia_medica: string,
	nombre: string,
	apellido:string,
	fecha_nacimiento:string,
    edad?:number;
	direccion:string,
	telefono:string	,
	email:string,

    //estado: string,
    //usuario:string,
    //fecha_registro:string;
}