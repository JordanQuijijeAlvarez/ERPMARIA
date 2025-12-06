import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  confirm(
    title: string,
    text: string,
    confirmButtonText: string = 'Confirmar',
    cancelButtonText: string = 'Cancelar'
  ): Promise<any> {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText,
      cancelButtonText,
    });
  }

  success(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: '#3085d6',
    });
  }

  error(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: '#d33',
    });
  }

  info(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: '#3085d6',
    });
  }

  eliminacionCorrecta(){

    Swal.fire({
      title: "Eliminado!",
      text: "Registro Eliminado con éxito ",
      icon: "success"
    });

  }

  preguntaRedireccion(title: string, url: string) {
    Swal.fire({
      title: title,
      icon: "question",
      iconHtml: "?",
      confirmButtonText: "SI, SALIR",
      cancelButtonText: "NO",
      showCancelButton: true,
      showCloseButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = url;
      }
    });
  }

  infoEventoConfir(title: string, text: string, redirectCallback?: () => void): void {
    Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed && redirectCallback) {
        redirectCallback();
      }
    });
  }



}
