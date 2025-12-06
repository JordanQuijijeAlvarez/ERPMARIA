const express = require('express');
const router = express.Router();
const controladorConsultorios = require('../controladores/Consultorios/ctlConsultorios');
const authenticateToken = require('../middleware/auth');


router.get('/listar/:estado', authenticateToken,
    controladorConsultorios.getConsultoriosEstado);

router.get('/listar', authenticateToken,
    controladorConsultorios.getConsultorios);

router.get('/:id', authenticateToken,
    controladorConsultorios.getConsultoriosId);

router.delete('/Eliminar/:id', authenticateToken,
   controladorConsultorios.eliminarConsultorio);

router.post('/Registrar', authenticateToken,
    controladorConsultorios.RegistrarConsultorios);

router.put('/Actualizar', authenticateToken,
    controladorConsultorios.ActualizarConsultorio);


module.exports = router; 