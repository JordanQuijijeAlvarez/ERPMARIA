const express = require('express');
const router = express.Router();
const controladorUsuarios = require('../controladores/Usuarios/ctlUsuarios');
const controladorLogin = require('../controladores/Login/ctlLogin');
const controladorVerificacion = require('../controladores/Verificacion-otp/ctlVerificacion');

const authenticateToken = require('../middleware/auth');

// Rutas de verificación OTP
router.post('/reenviar-otp', 
    controladorVerificacion.reenviarOTP);

router.get('/listar', authenticateToken,
    controladorUsuarios.getUsuariosEstado);

router.get('/me', authenticateToken,
    controladorUsuarios.getMe);

router.get('/:id', authenticateToken,
    controladorUsuarios.getUsuarioId);

router.delete('/Eliminar/:id', authenticateToken,
   controladorUsuarios.eliminarUsuario);

router.post('/Registrar', authenticateToken,
    controladorUsuarios.registrarUsuario);

router.put('/Actualizar', authenticateToken,
    controladorUsuarios.actualizarUsuario);

router.put('/perfil', authenticateToken,
    controladorUsuarios.actualizarPerfil);

router.put('/password', authenticateToken,
    controladorUsuarios.cambiarContraseniaPerfil);

router.put('/activar/:id', authenticateToken,
    controladorUsuarios.activarUsuario);
    
router.post('/recuperar/correo', controladorLogin.obtenerCorreo);

module.exports = router; 