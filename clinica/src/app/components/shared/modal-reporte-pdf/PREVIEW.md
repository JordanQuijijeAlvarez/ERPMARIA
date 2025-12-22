# 🎨 Vista Previa del Componente Modal Reporte PDF

## Cómo se ve el componente

### 1. Botón en la Lista
El botón de "Generar Reporte" aparece junto a los otros botones de acción:

```
┌─────────────────────────────────────────────────────────┐
│  GESTIÓN DE [ENTIDAD]                                   │
│  ┌──────────────────────────────────────────┐          │
│  │  🔍 Buscar...                             │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
│  [📄 Generar Reporte] [➕ Nuevo Registro]              │
└─────────────────────────────────────────────────────────┘
```

### 2. Modal de Filtros (Cuando se abre)

```
╔════════════════════════════════════════════════════════╗
║  📄 Generar Reporte PDF                           ✖    ║
╠════════════════════════════════════════════════════════╣
║                                                         ║
║  ℹ️ Generando reporte de: REPORTE DE VENTAS           ║
║     Total de registros disponibles: 125                ║
║                                                         ║
║  Seleccione el período del reporte:                    ║
║                                                         ║
║  [Todos] [Por Día] [Por Mes] [Por Rango]              ║
║   (activo)                                             ║
║                                                         ║
║  ┌────────────────────────────────────────────┐       ║
║  │ 📅 Fecha específica:                        │       ║
║  │ [2025-12-22]                                │       ║
║  └────────────────────────────────────────────┘       ║
║                                                         ║
║  🔍 Registros que coinciden: 15                        ║
║                                                         ║
╠════════════════════════════════════════════════════════╣
║              [Cancelar] [📄 Generar PDF]               ║
╚════════════════════════════════════════════════════════╝
```

### 3. Opciones de Filtro

#### Opción: Todos
```
┌────────────────────────────────────────────────┐
│ ℹ️ Se generará el reporte con todos los        │
│    registros disponibles sin filtros de fecha. │
└────────────────────────────────────────────────┘
```

#### Opción: Por Día
```
┌────────────────────────────────────────────────┐
│ 📅 Fecha específica:                           │
│ [2025-12-22]  ◀️ Selector de fecha            │
└────────────────────────────────────────────────┘
```

#### Opción: Por Mes
```
┌────────────────────────────────────────────────┐
│ 📅 Mes:          📅 Año:                      │
│ [Diciembre ▼]   [2025 ▼]                      │
└────────────────────────────────────────────────┘
```

#### Opción: Por Rango
```
┌────────────────────────────────────────────────┐
│ 📅 Fecha inicio:    📅 Fecha fin:             │
│ [2025-12-01]        [2025-12-22]               │
└────────────────────────────────────────────────┘
```

## Colores y Estilo

### Paleta de Colores
- **Principal**: Degradado púrpura (#667eea → #764ba2)
- **Fondo**: Blanco con sombras suaves
- **Bordes**: Grises claros (#e5e7eb)
- **Texto**: Gris oscuro (#374151)
- **Hover**: Efectos de elevación y brillo

### Animaciones
- ✨ Fade in al abrir el modal (0.2s)
- ✨ Slide up del contenedor (0.3s)
- ✨ Botón de cerrar rota 90° en hover
- ✨ Botones de filtro cambian de color con transición suave
- ✨ Botón principal se eleva en hover

## Ejemplo de PDF Generado

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  MI EMPRESA                         ┌─────────────────┐│
│  RUC: 094847366001                  │ REPORTE DE      ││
│  Dirección: PASAJE Y JUNIN ESQUINA  │ VENTAS          ││
│  Teléfono: 0989847332               │ Generado:       ││
│  Email: info@miempresa.com          │ 22/12/2025      ││
│                                      │ Filtro: Día     ││
│                                      │ Total: 15       ││
│                                      └─────────────────┘│
│  ────────────────────────────────────────────────────── │
│                                                          │
│  ╔═══════════════════════════════════════════════════╗ │
│  ║ ID    │ Fecha      │ Cliente  │ Total   │ Estado ║ │
│  ╠═══════════════════════════════════════════════════╣ │
│  ║ 000123│ 22/12/2025 │ Juan P.  │ $150.00 │ Activa║ │
│  ║ 000124│ 22/12/2025 │ María G. │ $280.50 │ Activa║ │
│  ║ 000125│ 22/12/2025 │ Pedro M. │ $95.25  │ Activa║ │
│  ║  ...  │    ...     │   ...    │   ...   │  ...  ║ │
│  ╚═══════════════════════════════════════════════════╝ │
│                                                          │
│            Reporte de ventas - Página 1                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Responsive Design

### Desktop (> 640px)
- Modal: 650px de ancho máximo
- Filtros de mes/rango: 2 columnas
- Botones de filtro: Grid automático

### Mobile (< 640px)
- Modal: 95% del ancho de pantalla
- Filtros de mes/rango: 1 columna (apilados)
- Botones de filtro: 2 columnas
- Botones de acción: Ancho completo, apilados

## Características de UX

### ✅ Feedback Visual
- Loading al generar PDF
- Contador de registros en tiempo real
- Alerta si no hay datos
- Confirmación al descargar

### ✅ Validaciones
- Fechas inválidas no se procesan
- Rango de fechas valida que inicio < fin
- Botón deshabilitado si no hay datos
- Mensajes claros de error

### ✅ Accesibilidad
- Click fuera del modal lo cierra
- Botón ✖ prominente
- Iconos descriptivos en todas las opciones
- Labels claros en todos los inputs

## Estados del Componente

### 1. Estado Inicial
```typescript
{
  mostrarModalReporte: false,
  configuracionReporte: undefined,
  tipoFiltro: 'todos',
  fechaInicio: '2025-12-22',
  fechaFin: '2025-12-22',
  mesSeleccionado: '12',
  anioSeleccionado: 2025
}
```

### 2. Modal Abierto
```typescript
{
  mostrarModalReporte: true,
  configuracionReporte: {
    titulo: 'REPORTE DE VENTAS',
    nombreArchivo: 'Reporte_Ventas',
    columnas: [...],
    datosOriginales: [...],
    // ... resto de configuración
  }
}
```

### 3. Generando PDF
- Muestra loading de SweetAlert2
- Bloquea interacción
- Procesa datos filtrados
- Genera y descarga PDF
- Muestra confirmación de éxito

## Flujo de Uso

```
1. Usuario hace click en [Generar Reporte]
   ↓
2. Se abre modal con filtros
   ↓
3. Usuario selecciona tipo de filtro
   - Todos
   - Por día
   - Por mes
   - Por rango
   ↓
4. Usuario configura fechas (si aplica)
   ↓
5. Ve contador de registros que coinciden
   ↓
6. Click en [Generar PDF]
   ↓
7. Muestra loading
   ↓
8. Genera PDF
   ↓
9. Descarga automática
   ↓
10. Muestra confirmación
    ↓
11. Cierra modal
```

## Casos de Uso Comunes

### Caso 1: Reporte del día
```
1. Click "Generar Reporte"
2. Click "Por Día"
3. Fecha ya está en hoy (por defecto)
4. Click "Generar PDF"
```

### Caso 2: Reporte mensual
```
1. Click "Generar Reporte"
2. Click "Por Mes"
3. Seleccionar mes y año
4. Click "Generar PDF"
```

### Caso 3: Reporte de última semana
```
1. Click "Generar Reporte"
2. Click "Por Rango"
3. Ajustar fecha inicio (hace 7 días)
4. Dejar fecha fin (hoy)
5. Click "Generar PDF"
```

### Caso 4: Reporte completo
```
1. Click "Generar Reporte"
2. Dejar en "Todos"
3. Click "Generar PDF"
```

## Integración en Diferentes Componentes

### En Ventas ✅
- Reporte de ventas del período
- Incluye cliente, total, fecha, estado

### En Clientes
- Listado completo de clientes
- Datos de contacto y registro

### En Productos
- Inventario actual
- Stock, precios, categorías

### En Compras
- Historial de compras
- Proveedores, montos, fechas

### En Usuarios
- Lista de usuarios del sistema
- Roles, estado, contacto

## Tips de Personalización

### 1. Cambiar colores del modal
Editar en [modal-reporte-pdf.component.css](modal-reporte-pdf.component.css):
```css
.modal-header {
  background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### 2. Agregar logo de empresa
Editar en [modal-reporte-pdf.component.ts](modal-reporte-pdf.component.ts):
```typescript
// Línea ~140
// Si tuvieras un logo en base64:
const logoBase64 = 'data:image/png;base64,...';
doc.addImage(logoBase64, 'PNG', 14, 10, 40, 20);
```

### 3. Cambiar colores del PDF
```typescript
// Cambiar color de cabecera de tabla
headStyles: { 
  fillColor: [R, G, B], // RGB de tu color
}
```

---

**Componente creado para ERP Maria**
**Versión: 1.0**
**Última actualización: Diciembre 2025**
