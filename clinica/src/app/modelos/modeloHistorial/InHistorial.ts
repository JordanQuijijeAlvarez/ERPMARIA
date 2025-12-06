export interface InHistorial {
	codigo_consulta :number,
    fecha_consulta:string,
    nombre_paciente :string,
    apellido_paciente :string,
    cedula_paciente :string,
    edad_paciente :number,
    peso :number,
    temperatura :number,
    presion_arterial :number,
    estatura: number,
    diagnostico :string,
    tratamiento :string,
    nombre_medico :string,
    apellido_medico :string,
    cedula_medico :string,
    especialidad :string,
    consultorio :string,
    observaciones :string
  }

  export interface InHistorialLista {
	codigo_consulta :number,
	fecha_consulta:string,
    nombre_paciente :string,
    apellido_paciente :string,
    cedula_paciente :string,
    nombre_medico :string,
    apellido_medico :string,
    especialidad :string,
	observaciones:string
  }

