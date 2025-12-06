# Validador para Elementos Select

## Descripción
El validador `selectRequired` es un validador personalizado para elementos `<select>` que verifica que se haya seleccionado una opción válida.

## Validaciones que realiza:
- ✅ Verifica que el valor no esté vacío
- ✅ Verifica que el valor no sea `null` o `undefined`
- ✅ Verifica que el valor no sea una cadena vacía `""`
- ✅ Verifica que el valor no sea `"0"` o `0` (valores por defecto comunes)

## Uso en TypeScript

### 1. Importar el componente ValidatorsComponent
```typescript
import { ValidatorsComponent } from '../../../shared/validators/validators.component';
```

### 2. Añadir a los imports del componente
```typescript
@Component({
  selector: 'app-mi-formulario',
  imports: [ReactiveFormsModule, CommonModule, ValidatorsComponent],
  templateUrl: './mi-formulario.component.html'
})
```

### 3. Aplicar el validador en el FormGroup
```typescript
// Para un select requerido
this.miFormulario = this.formBuilder.group({
  miSelect: ['', [Validators.required, ValidatorsComponent.selectRequired]],
});

// Para un select opcional pero que se valide si se toca
this.miFormulario = this.formBuilder.group({
  miSelectOpcional: ['', ValidatorsComponent.selectRequired],
});
```

## Uso en HTML

### 1. Estructura del select
```html
<div>
  <label class="block text-sm font-semibold text-gray-700 mb-2">
    <i class="fas fa-list text-gray-500 mr-1"></i>
    Mi Select *
  </label>
  <select
    formControlName="miSelect"
    class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 hover:bg-white hover:shadow-sm"
  >
    <option value="" disabled selected class="text-gray-400">
      Seleccione una opción
    </option>
    <option *ngFor="let item of listaItems" [value]="item.id">
      {{ item.nombre }}
    </option>
  </select>
  <app-validators [control]="miFormulario.get('miSelect')!"></app-validators>
</div>
```

## Mensaje de Error
Cuando la validación falla, se muestra el mensaje:
```
"Debe seleccionar una opción válida."
```

## Ejemplos de uso implementados

### 1. Formulario de Médicos
```typescript
// En frmmedicos.component.ts
cbxConsultorio: ['', [Validators.required, ValidatorsComponent.selectRequired]],
cbxHorario: ['', ValidatorsComponent.selectRequired],
```

### 2. Uso en otros formularios
```typescript
// Ejemplo para formulario de citas
cbxMedico: ['', [Validators.required, ValidatorsComponent.selectRequired]],
cbxEspecialidad: ['', [Validators.required, ValidatorsComponent.selectRequired]],

// Ejemplo para formulario de usuarios
cbxRol: ['', [Validators.required, ValidatorsComponent.selectRequired]],
```

## Beneficios
- ✅ **Reutilizable**: Un solo validador para todos los selects
- ✅ **Consistente**: Mismo comportamiento en toda la aplicación
- ✅ **Robusto**: Maneja múltiples casos edge (valores vacíos, null, undefined, "0")
- ✅ **UX Mejorada**: Mensajes de error claros y consistentes
- ✅ **Fácil implementación**: Solo añadir al FormGroup y usar el componente validator

## Notas importantes
- El validador funciona tanto con `Validators.required` como sin él
- Si se usa con `Validators.required`, ambas validaciones se ejecutan
- El validador detecta automáticamente si el campo ha sido "touched" para mostrar errores
- Compatible con el sistema de estilos Tailwind CSS del proyecto
