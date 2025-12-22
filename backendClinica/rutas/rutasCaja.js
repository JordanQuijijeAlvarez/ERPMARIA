const express = require('express');
const router = express.Router();
const cajaController = require('../controladores/Caja/ctlCaja');
const authenticateToken = require('../middleware/auth');

router.get('/verificar/:user_id', authenticateToken,cajaController.verificarEstadoCaja);
router.get('/historial', cajaController.listarCajas);
router.post('/abrir', authenticateToken, cajaController.abrirCaja);
router.get('/resumen/:caja_id', authenticateToken, cajaController.obtenerResumenCaja);
router.post('/cerrar', authenticateToken, cajaController.cerrarCaja);

module.exports = router; 