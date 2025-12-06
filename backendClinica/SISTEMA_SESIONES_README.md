# Sistema de Sesiones Activas - Guía de Implementación

## 📋 Resumen de Cambios

Se ha implementado un sistema de sesiones activas con device fingerprinting para prevenir el uso no autorizado de tokens JWT copiados.

## 🔧 Componentes Añadidos

### 1. **Tabla de Base de Datos**
- `sesiones_activas`: Almacena información de sesiones activas
- Índices optimizados para consultas rápidas
- Función de limpieza automática

### 2. **SessionManager** (`middleware/sessionManager.js`)
- Gestión completa de sesiones activas
- Device fingerprinting básico
- Métodos para crear, validar e invalidar sesiones

### 3. **Middleware Mejorado** (`middleware/auth.js`)
- Verificación de sesiones activas
- Device fingerprinting automático
- Manejo de errores mejorado

### 4. **Login Mejorado** (`controladores/Login/ctlLogin.js`)
- Generación de JWT con ID único (jti)
- Registro automático de sesiones
- Nuevos endpoints para gestión de sesiones

## 🚀 Pasos para Activar

### 1. **Inicializar Base de Datos**
```bash
node initDB.js
```

### 2. **Instalar Dependencias Adicionales** (si no las tienes)
```bash
npm install crypto
```

### 3. **Reiniciar Servidor**
```bash
npm start
# o
node server.js
```

## 📡 Nuevos Endpoints

### **POST /logout**
Invalida la sesión actual del usuario.
```javascript
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Logout exitoso" }
```

### **GET /sesiones-activas**
Obtiene lista de sesiones activas del usuario.
```javascript
Headers: Authorization: Bearer <token>
Response: { 
  success: true, 
  sesiones: [
    {
      session_id: "uuid",
      user_agent: "Chrome/...",
      ip_address: "192.168.1.1",
      created_at: "2025-01-01T10:00:00Z",
      last_activity: "2025-01-01T10:30:00Z"
    }
  ]
}
```

### **POST /invalidar-otras-sesiones**
Cierra todas las otras sesiones del usuario, manteniendo la actual.
```javascript
Headers: Authorization: Bearer <token>
Response: { 
  success: true, 
  message: "X sesiones invalidadas",
  invalidatedCount: X
}
```

## 🔒 Cómo Funciona la Seguridad

### **Problema Original**
1. Usuario hace login en Chrome → obtiene token
2. Alguien copia el token desde developer tools
3. Usa el token en Edge → ¡acceso no autorizado!

### **Solución Implementada**
1. Usuario hace login en Chrome → se crea sesión activa con fingerprint del dispositivo
2. Alguien copia el token e intenta usarlo en Edge
3. Sistema detecta device fingerprinting diferente → ¡acceso denegado!
4. Sesión original se invalida automáticamente por seguridad

### **Device Fingerprinting Incluye**
- User-Agent del navegador
- Dirección IP del cliente
- Hash único generado con esta información

## ⚡ Beneficios

### **Seguridad**
- ✅ Tokens copiados no funcionan desde otros dispositivos
- ✅ Detección automática de uso sospechoso
- ✅ Invalidación inmediata de sesiones comprometidas
- ✅ Control granular sobre sesiones activas

### **Experiencia de Usuario**
- ✅ Funcionamiento normal no se ve afectado
- ✅ Múltiples pestañas del mismo navegador funcionan
- ✅ Logout adecuado invalida la sesión
- ✅ Usuario puede ver y controlar sus sesiones activas

## 🎯 Pruebas Sugeridas

### **Prueba 1: Funcionamiento Normal**
1. Hacer login normal
2. Navegar por la aplicación
3. Verificar que todo funciona igual

### **Prueba 2: Prevención de Tokens Copiados**
1. Hacer login en Chrome
2. Copiar token desde developer tools
3. Abrir Edge, pegar token en sessionStorage
4. Intentar acceder → debería fallar
5. Verificar que Chrome también perdió acceso (sesión invalidada)

### **Prueba 3: Logout Adecuado**
1. Hacer login
2. Llamar endpoint /logout
3. Verificar que token ya no funciona

### **Prueba 4: Gestión de Sesiones**
1. Hacer login desde diferentes dispositivos (simulado con diferentes user-agents)
2. Usar /sesiones-activas para ver todas las sesiones
3. Usar /invalidar-otras-sesiones para cerrar las demás

## 🔧 Mantenimiento

### **Limpieza Automática**
La base de datos incluye una función para limpiar sesiones expiradas:
```sql
SELECT limpiar_sesiones_expiradas();
```

### **Configuración Avanzada** (Futuro)
- Tiempo de expiración de sesiones personalizable
- Límite de sesiones concurrentes por usuario
- Notificaciones por email de actividad sospechosa
- Dashboard de administración de sesiones

## 📊 Monitoreo

Para monitorear el sistema, puedes consultar:

```sql
-- Sesiones activas por usuario
SELECT usuario_id, COUNT(*) as sesiones_activas 
FROM sesiones_activas 
WHERE is_active = true AND expires_at > NOW() 
GROUP BY usuario_id;

-- Actividad reciente
SELECT * FROM sesiones_activas 
WHERE last_activity > NOW() - INTERVAL '1 hour'
ORDER BY last_activity DESC;
```

## ⚠️ Importante

- **Backup**: Asegúrate de hacer backup de la base de datos antes de ejecutar initDB.js
- **Producción**: En producción considera usar Redis para las sesiones en lugar de PostgreSQL
- **Monitoreo**: Implementa logging para detectar intentos de acceso sospechosos
- **IPs Dinámicas**: Ten en cuenta que usuarios con IPs dinámicas pueden experimentar desconexiones

## 🆘 Troubleshooting

### **Error: "Tabla ya existe"**
- Normal si ya ejecutaste initDB.js antes
- Puedes ignorar este error

### **Error: "SessionManager no encontrado"**
- Verificar que el archivo sessionManager.js existe en middleware/
- Verificar rutas de importación

### **Tokens siguen funcionando después de copiar**
- Verificar que la tabla sesiones_activas tiene datos
- Verificar que el JWT incluye el campo 'jti'
- Verificar logs del servidor para errores

### **Usuario se desconecta constantemente**
- Posible problema con device fingerprinting
- Verificar si el usuario usa VPN o proxy
- Considerar relajar las validaciones de IP
