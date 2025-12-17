const express = require('express');
const router = express.Router();
const controladorProducto = require('../controladores/Producto/ctlProducto');
const authenticateToken = require('../middleware/auth');


router.get('/alerta/stock', authenticateToken,
    controladorProducto.getProductosBajoStock);

router.get('/alerta/prodsinmov', authenticateToken,
    controladorProducto.getProductosSinMovimiento);

router.get('/alerta/kpiventas', authenticateToken,
    controladorProducto.getKpiVentas);

router.get('/info/top', authenticateToken,
    controladorProducto.getGraficoTop);

    router.get('/info/ventas/:dias?', authenticateToken,
    controladorProducto.getGraficoVentas);

    router.get('/info/finanzas', authenticateToken,
    controladorProducto.getGraficoFinanzas);

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