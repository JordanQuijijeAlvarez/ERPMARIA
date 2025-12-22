const express = require('express');

const cors = require('cors');
require('dotenv').config();


const rutasCliente = require('./rutas/rutasCliente');
const rutasProductos = require('./rutas/rutasProducto');
const rutasCompra = require('./rutas/rutasCompra');
const rutasVentas = require('./rutas/rutasVenta');
const rutasCajas = require('./rutas/rutasCaja');
const rutasCategoria = require('./rutas/rutasCategoria');
const rutasSubCategoria = require('./rutas/rutasSubCategoria');
const rutasLocal = require('./rutas/rutasLocal');
const rutasProveedor = require('./rutas/rutasProveedor');
const rutasUsuarios = require('./rutas/rutasUsuarios');
const rutasRoles = require('./rutas/rutasRoles');
const auditoria = require('./rutas/rutasAuditoria');


const login = require('./controladores/Login/ctlLogin');
const verificacion = require('./controladores/Verificacion-otp/ctlVerificacion');
const ctl2FA = require('./controladores/2FA/ctl2FA');
const authenticateToken = require('./middleware/auth');

const app = express();
// Middleware
app.use(express.json());
app.use(cors());

// Rutas

app.use('/clientes', rutasCliente);
app.use('/productos', rutasProductos);
app.use('/categorias', rutasCategoria);
app.use('/compras', rutasCompra);
app.use('/ventas', rutasVentas);
app.use('/caja', rutasCajas);
app.use('/subcategorias', rutasSubCategoria);
app.use('/local', rutasLocal);
app.use('/proveedores', rutasProveedor);
app.use('/usuarios', rutasUsuarios);
app.use('/roles', rutasRoles);
app.use('/auditoria', auditoria);


// Ruta provisional 
app.post('/loginprov', login.validacionProvUsers);



//Rutas de autenticación
app.post('/login', login.validacionUsers);
app.post('/logout', authenticateToken, login.logout);
app.get('/sesiones-activas', authenticateToken, login.getSesionesActivas);
app.post('/invalidar-otras-sesiones', authenticateToken, login.invalidarOtrasSesiones);


app.post('/recuperacion/enviarcodigo', login.enviarCodigo);
app.post('/recuperacion/cambiarcontrasenia', login.cambiarContrasenia);

// Ruta para verificar OTP
app.post('/validar-otp', verificacion.validarOTP);

// Rutas para autenticación 2FA
app.post('/2fa/setup', authenticateToken, ctl2FA.setup2FA);
app.post('/2fa/verify', ctl2FA.verify2FA);
app.post('/2fa/disable', authenticateToken, ctl2FA.disable2FA);
app.get('/2fa/status', ctl2FA.check2FAStatus);

module.exports = app;
