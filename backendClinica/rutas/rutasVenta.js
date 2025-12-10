const express = require('express');
const router = express.Router();
const ctlVentas = require('../controladores/Ventas/ctlVentas');
const authenticateToken = require('../middleware/auth');

router.post('/Registrar', authenticateToken,
    ctlVentas.Registrarventa)

router.get('/detalle/:id', authenticateToken,
    ctlVentas.getDetalleVenta)
router.get('/:estado', authenticateToken,
    ctlVentas.getEncabVentaEstado)
router.get('/obtener/:id', authenticateToken,
    ctlVentas.ObtenerVentaPorId);

router.put('/Actualizar/:id', authenticateToken,
    ctlVentas.ActualizarVenta);
router.delete('/Anular/:id', authenticateToken,
   ctlVentas.AnularVenta);
/*
router.get('/listar/:estado', authenticateToken,
    ctlCompras.get);

router.get('/listar', authenticateToken,
    ctlCompras.getCompras);

router.get('/:id', authenticateToken,
    ctlCompras.getcompraId);



router.post('/Registrar', authenticateToken,
    ctlCompras.Registrarcompra);

router.put('/Actualizar', authenticateToken,
    ctlCompras.Actualizarcompra);

*/
module.exports = router; 