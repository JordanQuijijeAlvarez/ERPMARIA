const express = require('express');
const router = express.Router();
const controladorLocal = require('../controladores/DatosLocal/ctlDatosLocal');
const authenticateToken = require('../middleware/auth');



router.get('/listar', authenticateToken,
    controladorLocal.getLocal);


router.get('/:id', authenticateToken,
    controladorLocal.getLocalId);

router.delete('/Eliminar/:id', authenticateToken,
   controladorLocal.eliminarlocal);

router.post('/Registrar', authenticateToken,
   controladorLocal.Registrarlocal);

router.put('/Actualizar', authenticateToken,
    controladorLocal.Actualizarlocal);


module.exports = router; 