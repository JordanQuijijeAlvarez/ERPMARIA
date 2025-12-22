# Snippets de Código para Integración Rápida

Este archivo contiene código copiable para integrar rápidamente el modal de reportes en tus componentes de lista.

## 📋 Checklist de Integración

- [ ] Importar componente y tipos
- [ ] Agregar al array de imports del @Component
- [ ] Agregar propiedades de control al componente
- [ ] Agregar botón en el HTML
- [ ] Agregar componente modal en el HTML
- [ ] Implementar métodos abrirModalReporte y cerrarModalReporte
- [ ] Configurar datos de la empresa
- [ ] Configurar columnas y formato de datos

---

## 1. Imports (Copiar al inicio del archivo .ts)

```typescript
import { ModalReportePdfComponent, ConfiguracionReporte } from '../../../shared/modal-reporte-pdf/modal-reporte-pdf.component';
```

## 2. Agregar a imports del @Component

```typescript
@Component({
  selector: 'app-tu-componente',
  imports: [
    CommonModule, 
    RouterModule, 
    DirectivasModule, 
    FormsModule,
    ModalReportePdfComponent  // <-- Agregar esta línea
  ],
  templateUrl: './tu-componente.component.html',
  styleUrl: './tu-componente.component.css'
})
```

## 3. Propiedades (Agregar en la clase del componente)

```typescript
// Propiedades para el modal de reportes
mostrarModalReporte: boolean = false;
configuracionReporte!: ConfiguracionReporte;
```

## 4. Botón HTML (Copiar donde quieras el botón)

### Opción A: Botón individual
```html
<button type="button" class="btn btn--secondary" (click)="abrirModalReporte()" title="Generar reporte PDF">
  <i class="fas fa-file-pdf"></i>
  <span>Generar Reporte</span>
</button>
```

### Opción B: Junto a otro botón (como en ventas)
```html
<div style="display: flex; gap: 10px;">
  <button type="button" class="btn btn--secondary" (click)="abrirModalReporte()" title="Generar reporte PDF">
    <i class="fas fa-file-pdf"></i>
    <span>Generar Reporte</span>
  </button>
  
  <a routerLink="../crear">
    <button type="button" class="btn btn--primary">
      <i class="fas fa-plus"></i>
      <span>Nuevo Registro</span>
    </button>
  </a>
</div>
```

## 5. Componente Modal (Agregar al final del HTML)

```html
<!-- Modal de Reporte PDF -->
<app-modal-reporte-pdf
  [mostrar]="mostrarModalReporte"
  [configuracion]="configuracionReporte"
  (cerrar)="cerrarModalReporte()">
</app-modal-reporte-pdf>
```

## 6. Métodos (Agregar al final de la clase del componente)

### Template Básico
```typescript
// Métodos para el modal de reportes
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE [TU ENTIDAD EN MAYÚSCULAS]',
    nombreArchivo: 'Reporte_[TuEntidad]',
    columnas: ['Columna1', 'Columna2', 'Columna3'], // Tus columnas aquí
    datosOriginales: this.tuListaDeDatos, // Tu array de datos
    nombreEntidad: 'tu_entidad',
    campoFecha: 'campo_fecha_en_tus_datos', // Ej: 'created_at', 'fecha_registro'
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (item: any) => {
      return [
        item.campo1,
        item.campo2,
        item.campo3
        // Agregar más campos según tus columnas
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

---

## 🎯 Templates Específicos por Entidad

### CLIENTES
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE CLIENTES',
    nombreArchivo: 'Reporte_Clientes',
    columnas: ['Cédula', 'Nombre Completo', 'Teléfono', 'Email', 'Dirección'],
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
      return [
        cliente.client_cedula || 'N/A',
        `${cliente.client_nombre} ${cliente.client_apellido}`,
        cliente.client_telefono || 'N/A',
        cliente.client_email || 'N/A',
        cliente.client_direccion || 'N/A'
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

### PRODUCTOS
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE PRODUCTOS',
    nombreArchivo: 'Reporte_Productos',
    columnas: ['Código', 'Nombre', 'Categoría', 'Stock', 'Precio Venta', 'Estado'],
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

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

### PROVEEDORES
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE PROVEEDORES',
    nombreArchivo: 'Reporte_Proveedores',
    columnas: ['RUC', 'Nombre', 'Contacto', 'Teléfono', 'Email', 'Dirección'],
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
        proveedor.prov_contacto || 'N/A',
        proveedor.prov_telefono || 'N/A',
        proveedor.prov_email || 'N/A',
        proveedor.prov_direccion || 'N/A'
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

### COMPRAS
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE COMPRAS',
    nombreArchivo: 'Reporte_Compras',
    columnas: ['N° Compra', 'Fecha', 'Proveedor', 'Total', 'Usuario', 'Estado'],
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
        compra.usuario_nombre || 'N/A',
        compra.compra_estado === 1 ? 'Activa' : 'Anulada'
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

### USUARIOS
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE USUARIOS',
    nombreArchivo: 'Reporte_Usuarios',
    columnas: ['Usuario', 'Nombre Completo', 'Email', 'Rol', 'Estado'],
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
        usuario.user_email || 'N/A',
        usuario.rol_nombre || 'Sin rol',
        usuario.user_estado === 1 ? 'Activo' : 'Inactivo'
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

### CATEGORÍAS
```typescript
abrirModalReporte() {
  this.configuracionReporte = {
    titulo: 'REPORTE DE CATEGORÍAS',
    nombreArchivo: 'Reporte_Categorias',
    columnas: ['ID', 'Nombre', 'Descripción', 'Estado'],
    datosOriginales: this.listacategorias,
    nombreEntidad: 'categorias',
    campoFecha: 'cat_fecha_creacion',
    empresa: {
      nombre: 'MI EMPRESA',
      ruc: '094847366001',
      direccion: 'PASAJE Y JUNIN ESQUINA',
      telefono: '0989847332',
      email: 'info@miempresa.com'
    },
    formatearFila: (categoria: any) => {
      return [
        categoria.cat_id,
        categoria.cat_nombre,
        categoria.cat_descripcion || 'Sin descripción',
        categoria.cat_estado === 1 ? 'Activa' : 'Inactiva'
      ];
    }
  };
  this.mostrarModalReporte = true;
}

cerrarModalReporte() {
  this.mostrarModalReporte = false;
}
```

---

## 🎨 CSS para el Botón (Opcional)

Si tu componente no tiene estos estilos, puedes agregarlos al CSS:

```css
/* Estilos para el botón de reporte */
.btn--secondary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn--secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn--secondary i {
  font-size: 16px;
}
```

---

## ⚙️ Configuración Avanzada

### Formateo de Fechas Personalizado
```typescript
formatearFila: (item: any) => {
  const fecha = new Date(item.fecha_campo);
  const fechaFormateada = !isNaN(fecha.getTime()) 
    ? `${fecha.toLocaleDateString('es-ES')} ${fecha.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`
    : 'Fecha no válida';
  
  return [
    // ... tus otros campos
    fechaFormateada
  ];
}
```

### Formateo de Moneda
```typescript
formatearFila: (item: any) => {
  return [
    // ... otros campos
    `$${parseFloat(item.precio).toFixed(2)}`,
    // Para moneda con separadores de miles:
    `$${parseFloat(item.total).toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  ];
}
```

### Manejo de Valores Nulos
```typescript
formatearFila: (item: any) => {
  return [
    item.campo1 || 'N/A',
    item.campo2 || 'Sin especificar',
    item.campo3 ?? '-' // Usando nullish coalescing
  ];
}
```

---

## 🚀 Pasos para Implementar (Resumen)

1. Copia el import al inicio del archivo `.ts`
2. Agrégalo a los imports del `@Component`
3. Agrega las propiedades a la clase
4. Copia el botón HTML donde lo necesites
5. Agrega el componente modal al final del HTML
6. Copia y personaliza el método `abrirModalReporte()` según tu entidad
7. Copia el método `cerrarModalReporte()`
8. Personaliza las columnas y el formateo de datos según tus necesidades

¡Listo! Tu componente ahora puede generar reportes PDF con filtros de fecha.

---

**Nota:** Asegúrate de ajustar los nombres de campos según tu estructura de datos.
