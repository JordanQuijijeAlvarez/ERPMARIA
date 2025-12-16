const express = require('express');
const router = express.Router();
const controladorProducto = require('../controladores/Producto/ctlProducto');
const authenticateToken = require('../middleware/auth');


router.get('/alerta/stock', authenticateToken,
    controladorProducto.getProductosBajoStock);

router.get('/listar', authenticateToken,
    controladorProducto.getProductos);

router.get('/alerta', authenticateToken,
    controladorProducto.getProductosPrecioAlert);

router.get('/listar/:estado', authenticateToken,
    controladorProducto.getProductosEstado);

router.get('/:codbarra/:estado', authenticateToken,
    controladorProducto.getProductosCodigoBarrasEstado);

router.delete('/Eliminar/:id', authenticateToken,
    controladorProducto.eliminarproducto);

router.post('/Registrar', authenticateToken,
    controladorProducto.RegistrarProducto);

router.put('/Actualizar', authenticateToken,
    controladorProducto.Actualizarproducto);

router.put('/actualizar/precioprod', authenticateToken,
    controladorProducto.actualizarPrecioVenta);

router.get('/:id', authenticateToken,
    controladorProducto.getProductoId);

module.exports = router; 