const express = require('express');
const router = express.Router();
const ctlCompras = require('../controladores/Compras/ctlCompras');
const authenticateToken = require('../middleware/auth');

router.get('/listar/:estado', authenticateToken,
    ctlCompras.getComprasEstado);

router.get('/listar', authenticateToken,
    ctlCompras.getCompras);

router.get('/:id', authenticateToken,
    ctlCompras.getcompraId);

router.delete('/Eliminar/:id', authenticateToken,
   ctlCompras.eliminarcompra);

router.post('/Registrar', authenticateToken,
    ctlCompras.Registrarcompra);

router.put('/Actualizar', authenticateToken,
    ctlCompras.Actualizarcompra);


module.exports = router; 