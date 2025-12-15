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
      confirmButtonColor: 'var(--color-info)',
      cancelButtonColor: 'var(--color-danger)',
      confirmButtonText,
      cancelButtonText,
    });
  }

  success(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonColor: 'var(--color-success)',
    });
  }

  error(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonColor: 'var(--color-danger)',
    });
  }

  info(title: string, text: string): void {
    Swal.fire({
      title,
      text,
      icon: 'info',
      confirmButtonColor: 'var(--color-info)',
    });
  }

  eliminacionCorrecta(){

    Swal.fire({
      title: "Eliminado!",
      text: "Registro Eliminado con éxito ",
      icon: "success",
      confirmButtonColor: 'var(--color-success)',
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
      confirmButtonColor: "var(--color-primary)",
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
      confirmButtonColor: 'var(--color-info)',
    }).then((result) => {
      if (result.isConfirmed && redirectCallback) {
        redirectCallback();
      }
    });
  }
loading(title: string ): void {
  Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

close(): void {
  Swal.close();
}




}
