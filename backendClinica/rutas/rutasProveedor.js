const express = require('express');
const router = express.Router();
const controladorProveedores = require('../controladores/Proveedor/ctlProveedor');
const authenticateToken = require('../middleware/auth');


router.get('/listar/:estado', authenticateToken,
    controladorProveedores.getProveedoresEstado);

router.get('/listar', authenticateToken,
    controladorProveedores.getProveedores);


router.get('/:id', authenticateToken,
    controladorProveedores.getproveedorId);
router.get('/:ruc/:estado', authenticateToken,
    controladorProveedores.getProveedoresRucEstado);

router.delete('/Eliminar/:id', authenticateToken,
    controladorProveedores.eliminarProveedor);

router.post('/Registrar', authenticateToken,
    controladorProveedores.RegistrarProveedor);

router.put('/Actualizar', authenticateToken,
    controladorProveedores.ActualizarProveedor);


module.exports = router;  