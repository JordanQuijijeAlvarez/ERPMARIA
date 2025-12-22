import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormsModule,
  NgModel,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InClientes } from '../../../../modelos/modelClientes/InClientes';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../../servicios/Alertas/alertas.service';
import Swal from 'sweetalert2';
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
import { Observable, of, timer } from 'rxjs';
import { map, catchError, switchMap, debounceTime } from 'rxjs/operators';
import { clienteService } from '../../../../servicios/clientes.service';
import { CajaService } from '../../../../servicios/caja.service';

@Component({
  selector: 'app-frmcaja',
  imports: [ReactiveFormsModule, RouterModule, CommonModule,FormsModule],
  templateUrl: './frmcaja.component.html',
  styleUrl: './frmcaja.component.css',
})
export class frmCajaComponent implements OnInit {

  // Estado del usuario
  usuarioId: number = 1; // Deberías sacarlo del login (localStorage)
  
  // Estado de la Caja
  cajaAbierta: boolean = false;
  cajaIdActual: number = 0;
  
  // Modales
  mostrarModalApertura: boolean = false;
  mostrarModalCierre: boolean = false;

  // Datos para Apertura
  montoInicialInput: number = 0;

  // Datos para Cierre (Resumen)
  resumenCierre: any = {
    monto_inicial: 0,
    total_ventas: 0,
    total_egresos: 0,
    saldo_esperado: 0
  };
  
  // Datos del Arqueo (Lo que cuenta el usuario)
  montoRealUsuario: number = 0;
  diferencia: number = 0;
  observacionCierre: string = '';

  constructor(
    private cajaService: CajaService,
    private alertaService: AlertService
  ) {}

  ngOnInit(): void {
    this.verificarEstadoCaja();
  }

  // 1. VERIFICAR AL INICIO
  verificarEstadoCaja() {
    this.cajaService.verificarEstadoCaja(this.usuarioId).subscribe({
      next: (res: any) => {
        this.cajaAbierta = res.abierta;
        if (this.cajaAbierta) {
          this.cajaIdActual = res.caja_id;
        }
      },
      error: (err) => console.error(err)
    });
  }

  // ==========================================
  // LÓGICA DE APERTURA
  // ==========================================
  abrirModalApertura() {
    this.montoInicialInput = 0;
    this.mostrarModalApertura = true;
  }

  confirmarApertura() {
    if (this.montoInicialInput < 0) {
      this.alertaService.info('Atención', 'El monto inicial no puede ser negativo');
      return;
    }

    const datos = {
      user_id: this.usuarioId,
      monto_inicial: this.montoInicialInput
    };

    this.cajaService.abrirCaja(datos).subscribe({
      next: (res) => {
        this.alertaService.success('Éxito', 'Caja abierta correctamente');
        this.mostrarModalApertura = false;
        this.verificarEstadoCaja(); // Actualizamos estado
      },
      error: (err) => this.alertaService.error('Error', 'No se pudo abrir la caja')
    });
  }

  // ==========================================
  // LÓGICA DE CIERRE (ARQUEO)
  // ==========================================
  abrirModalCierre() {
    this.alertaService.loading('Calculando totales...');
    
    this.cajaService.obtenerResumenCierre(this.cajaIdActual).subscribe({
      next: (res: any) => {
        this.alertaService.close(); // Cerramos loading
        this.resumenCierre = res;
        this.montoRealUsuario = 0; // Resetear input
        this.calcularDiferencia(); // Calcular inicial
        this.mostrarModalCierre = true;
      },
      error: (err) => {
        this.alertaService.close();
        this.alertaService.error('Error', 'No se pudo obtener el resumen de caja');
      }
    });
  }

  // Se ejecuta cada vez que el usuario escribe en el input de dinero real
  calcularDiferencia() {
    // Diferencia = Lo que tengo en mano - Lo que dice el sistema
    this.diferencia = this.montoRealUsuario - this.resumenCierre.saldo_esperado;
  }

  confirmarCierre() {
    // Advertencia si hay mucha diferencia
    if (Math.abs(this.diferencia) > 10) { // Ejemplo: si falta/sobra más de $10
      this.alertaService.confirm(
        'Diferencia Detectada',
        `Hay una diferencia de $${this.diferencia.toFixed(2)}. ¿Desea cerrar la caja de todos modos?`,
        'Sí, cerrar', 'Revisar'
      ).then((res) => {
        if (res.isConfirmed) this.procesarCierreDefinitivo();
      });
    } else {
      this.procesarCierreDefinitivo();
    }
  }

  procesarCierreDefinitivo() {
    const datos = {
      caja_id: this.cajaIdActual,
      monto_real: this.montoRealUsuario,
      observacion: this.observacionCierre
    };

    this.cajaService.cerrarCaja(datos).subscribe({
      next: () => {
        this.alertaService.success('Cierre Exitoso', 'La jornada ha finalizado.');
        this.mostrarModalCierre = false;
        this.cajaAbierta = false;
        this.cajaIdActual = 0;
      },
      error: () => this.alertaService.error('Error', 'No se pudo cerrar la caja')
    });
  }

  cerrarModales() {
    this.mostrarModalApertura = false;
    this.mostrarModalCierre = false;
  }
}