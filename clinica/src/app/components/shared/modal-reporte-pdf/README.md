# Componente Modal Reporte PDF - Documentación de Uso

## 📋 Descripción

Componente reutilizable para generar reportes PDF con filtros de fecha de cualquier entidad del sistema. El componente permite generar reportes por:
- Todos los registros
- Día específico
- Mes y año
- Rango de fechas personalizado

## 🚀 Instalación

El componente es standalone y ya está creado en:
```
clinica/src/app/components/shared/modal-reporte-pdf/
```

## 📦 Uso Básico

### 1. Importar en tu componente

```typescript
import { ModalReportePdfComponent, ConfiguracionReporte } from '../../../shared/modal-reporte-pdf/modal-reporte-pdf.component';

@Component({
  selector: 'app-tu-componente',
  imports: [CommonModule, RouterModule, ModalReportePdfComponent],
  // ... resto de configuración
})
```

### 2. Agregar propiedades al componente

```typescript
export class TuComponente {
  mostrarModalReporte: boolean = false;
  configuracionReporte!: ConfiguracionReporte;
  
  // Tus datos originales
  tusDatos: any[] = [];
}
```

### 3. Agregar el componente en el HTML

```html
<!-- Botón para abrir el modal -->
<button type="button" (click)="abrirModalReporte()">
  <i class="fas fa-file-pdf"></i>
  Generar Reporte
</button>

<!-- Componente del modal (al final del archivo) -->
<app-modal-reporte-pdf
  [mostrar]="mostrarModalReporte"
  [configuracion]="configuracionReporte"
  (cerrar)="cerrarModalReporte()">
</app-modal-reporte-pdf>
```

### 4. Implementar métodos

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE TU ENTIDAD',
    nombreArchivo: 'Reporte_TuEntidad',
    columnas: ['Columna 1', 'Columna 2', 'Columna 3'],
    datosOriginales: this.tusDatos,
    nombreEntidad: 'tu_entidad',
    campoFecha: 'campo_fecha_en_tus_datos', // Ej: 'created_at', 'fecha_registro'
    empresa: {
      nombre: 'NOMBRE DE TU EMPRESA',
      ruc: 'TU RUC',
      direccion: 'TU DIRECCIÓN',
      telefono: 'TU TELÉFONO',
      email: 'TU EMAIL'
    },
    formatearFila: (item: any) => {
      // Retorna un array con los valores en el orden de las columnas
      return [
        item.campo1,
        item.campo2,
        item.campo3
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

## 📚 Ejemplos para Diferentes Entidades

### Ejemplo 1: Reporte de Clientes

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE CLIENTES',
    nombreArchivo: 'Reporte_Clientes',
    columnas: ['Cédula', 'Nombre', 'Teléfono', 'Email', 'Fecha Registro'],
    datosOriginales: this.listaclientes,
    nombreEntidad: 'clientes',
    campoFecha: 'client_fecha_registro',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (cliente: any) => {
      const fecha = new Date(cliente.client_fecha_registro);
      const fechaStr = !isNaN(fecha.getTime()) 
        ? fecha.toLocaleDateString('es-ES')
        : cliente.client_fecha_registro;
      
      return [
        cliente.client_cedula || 'N/A',
        `${cliente.client_nombre} ${cliente.client_apellido}`,
        cliente.client_telefono || 'N/A',
        cliente.client_email || 'N/A',
        fechaStr
      ];
    }
  };
  this.mostrarModalReporte = true;
}
```

### Ejemplo 2: Reporte de Productos

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE PRODUCTOS',
    nombreArchivo: 'Reporte_Productos',
    columnas: ['Código', 'Nombre', 'Categoría', 'Stock', 'Precio', 'Estado'],
    datosOriginales: this.listaproductos,
    nombreEntidad: 'productos',
    campoFecha: 'prod_fecha_creacion',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (producto: any) => {
      return [
        producto.prod_codigo || 'N/A',
        producto.prod_nombre,
        producto.categoria_nombre || 'Sin categoría',
        producto.prod_stock,
        `$${parseFloat(producto.prod_precioventa).toFixed(2)}`,
        producto.prod_estado === 1 ? 'Activo' : 'Inactivo'
      ];
    }
  };
  this.mostrarModalReporte = true;
}
```

### Ejemplo 3: Reporte de Compras

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE COMPRAS',
    nombreArchivo: 'Reporte_Compras',
    columnas: ['N° Compra', 'Fecha', 'Proveedor', 'Total', 'Estado'],
    datosOriginales: this.listacompras,
    nombreEntidad: 'compras',
    campoFecha: 'compra_fecha',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (compra: any) => {
      const fecha = new Date(compra.compra_fecha);
      const fechaStr = !isNaN(fecha.getTime()) 
        ? fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES')
        : compra.compra_fecha;
      
      return [
        String(compra.compra_id).padStart(6, '0'),
        fechaStr,
        compra.proveedor_nombre || 'N/A',
        `$${parseFloat(compra.compra_total).toFixed(2)}`,
        compra.compra_estado === 1 ? 'Activa' : 'Anulada'
      ];
    }
  };
  this.mostrarModalReporte = true;
}
```

### Ejemplo 4: Reporte de Usuarios

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE USUARIOS',
    nombreArchivo: 'Reporte_Usuarios',
    columnas: ['Usuario', 'Nombre Completo', 'Rol', 'Email', 'Estado'],
    datosOriginales: this.listausuarios,
    nombreEntidad: 'usuarios',
    campoFecha: 'user_fecha_creacion',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (usuario: any) => {
      return [
        usuario.user_username,
        `${usuario.user_nombre} ${usuario.user_apellido}`,
        usuario.rol_nombre || 'Sin rol',
        usuario.user_email || 'N/A',
        usuario.user_estado === 1 ? 'Activo' : 'Inactivo'
      ];
    }
  };
  this.mostrarModalReporte = true;
}
```

### Ejemplo 5: Reporte de Proveedores

```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE PROVEEDORES',
    nombreArchivo: 'Reporte_Proveedores',
    columnas: ['RUC', 'Nombre', 'Teléfono', 'Email', 'Dirección'],
    datosOriginales: this.listaproveedores,
    nombreEntidad: 'proveedores',
    campoFecha: 'prov_fecha_registro',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (proveedor: any) => {
      return [
        proveedor.prov_ruc || 'N/A',
        proveedor.prov_nombre,
        proveedor.prov_telefono || 'N/A',
        proveedor.prov_email || 'N/A',
        proveedor.prov_direccion || 'N/A'
      ];
    }
  };
  this.mostrarModalReporte = true;
}
```

## 🔧 Configuración Detallada

### Interface ConfiguracionReporte

```typescript
export interface ConfiguracionReporte {
  titulo: string;              // Título del reporte (aparece en el PDF)
  nombreArchivo: string;        // Nombre del archivo a descargar (sin extensión)
  columnas: string[];           // Array con los nombres de las columnas
  datosOriginales: any[];       // Array con todos los datos a reportar
  nombreEntidad: string;        // Nombre de la entidad (para referencia)
  campoFecha?: string;          // Campo de fecha para filtrar (opcional)
  empresa?: {                   // Datos de la empresa (opcional)
    nombre?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
  };
  formatearFila?: (item: any) => any[];  // Función para formatear cada fila
}
```

## 🎨 Características

✅ **Filtros de fecha flexibles:**
- Todos los registros
- Por día específico
- Por mes y año
- Por rango de fechas

✅ **Diseño profesional:**
- Encabezado con datos de la empresa
- Tabla con diseño moderno
- Información del filtro aplicado
- Totales y estadísticas

✅ **Fácil de usar:**
- Componente standalone
- Configuración mediante objeto
- Reutilizable en cualquier lista

✅ **Responsive:**
- Adaptable a diferentes tamaños de pantalla
- Modal centrado y accesible

## 💡 Consejos de Uso

1. **Campo de fecha:** Asegúrate de especificar el campo correcto de fecha en `campoFecha` para que los filtros funcionen correctamente.

2. **Formateo de filas:** La función `formatearFila` debe retornar un array con exactamente la misma cantidad de elementos que columnas definidas.

3. **Datos de empresa:** Puedes reutilizar los datos de empresa en todos tus componentes definiendo una constante global.

4. **Validación de fechas:** El componente maneja fechas inválidas automáticamente, pero es buena práctica validar tus datos.

## 🐛 Solución de Problemas

**Problema:** El modal no se muestra
- Verifica que `mostrarModalReporte` esté en `true`
- Asegúrate de haber importado el componente correctamente

**Problema:** No hay datos en el reporte
- Verifica que `datosOriginales` contenga datos
- Revisa que el campo de fecha especificado exista en tus datos

**Problema:** Error al generar PDF
- Verifica que jsPDF y jspdf-autotable estén instalados
- Asegúrate de que la función `formatearFila` retorne datos válidos

## 📝 Notas

- El componente utiliza jsPDF para la generación de PDFs
- Los filtros de fecha funcionan con objetos Date de JavaScript
- El archivo se descarga automáticamente al generarse

## 🔄 Actualizaciones Futuras

Posibles mejoras a implementar:
- Exportación a Excel
- Gráficos y estadísticas
- Múltiples páginas automáticas
- Personalización de colores y logos
- Envío por email

---

**Creado para el sistema ERP Maria**
**Última actualización: Diciembre 2025**
