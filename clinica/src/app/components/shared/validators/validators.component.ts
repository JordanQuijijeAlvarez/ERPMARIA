import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-validators',
  imports: [CommonModule],
  templateUrl: './validators.component.html',
  styleUrl: './validators.component.css'
})
export class ValidatorsComponent {
  @Input() control!: AbstractControl;
  @Input() showCounter: boolean = false;
  @Input() expectedLength: number = 10;

  /**
   * Validador personalizado para campos numéricos de 10 dígitos
   * Retorna errores específicos para mejor UX
   */
  static numericTenDigits(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = control.value.toString();
    
    // Verificar si contiene solo números
    if (!/^\d+$/.test(value)) {
      return { 'onlyNumbers': true };
    }
    
    // Verificar si tiene exactamente 10 dígitos
    if (value.length !== 10) {
      return { 'tenDigits': true };
    }
    
    return null;
  }

  static numericTreceDigits(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = control.value.toString();
    
    // Verificar si contiene solo números
    if (!/^\d+$/.test(value)) {
      return { 'onlyNumbers': true };
    }
    
    // Verificar si tiene exactamente 10 dígitos
    if (value.length !== 13) {
      return { 'treceDigits': true };
    }
    
    return null;
  }

  /**
   * Validador personalizado para campos numéricos con longitud específica
   * @param length - Longitud requerida
   */
  static numericLength(length: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const value = control.value.toString();
      
      // Verificar si contiene solo números
      if (!/^\d+$/.test(value)) {
        return { 'onlyNumbers': true };
      }
      
      // Verificar si tiene la longitud exacta
      if (value.length !== length) {
        return { 'exactLength': { requiredLength: length, actualLength: value.length } };
      }
      
      return null;
    };
  }

  /**
   * Validador para solo números (sin restricción de longitud)
   */
  static onlyNumbers(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const value = control.value.toString();
    
    if (!/^\d+$/.test(value)) {
      return { 'onlyNumbers': true };
    }
    
    return null;
  }

  /**
   * Validador personalizado para campos select
   * Verifica que se haya seleccionado una opción válida (no vacía, no null, no undefined)
   */
  static selectRequired(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    // Verificar si el valor está vacío, es null, undefined o es una cadena vacía
    if (!value || value === '' || value === null || value === undefined) {
      return { 'selectRequired': true };
    }
    
    // Verificar si el valor es "0" (que a veces se usa como valor por defecto)
    if (value === '0' || value === 0) {
      return { 'selectRequired': true };
    }
    
    return null;
  }

  /**
   * Obtiene la longitud actual del campo
   */
  getCurrentLength(): number {
    return this.control?.value?.length || 0;
  }

  /**
   * Verifica si debe mostrar el contador
   */
  shouldShowCounter(): boolean {
    return this.showCounter && 
           this.control?.value?.length > 0 && 
           this.getCurrentLength() < this.expectedLength &&
           !this.control?.errors?.['onlyNumbers'];
  }

  /**
   * Verifica si el campo está completo y válido
   */
  isFieldComplete(): boolean {
    return this.showCounter &&
           this.getCurrentLength() === this.expectedLength && 
           this.control?.valid;
  }

  /**
   * Calcula dígitos faltantes
   */
  getMissingDigits(): number {
    return this.expectedLength - this.getCurrentLength();
  }
}
