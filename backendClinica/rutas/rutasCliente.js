const express = require('express');
const router = express.Router();
const controladorPacientes = require('../controladores/Clientes/ctlClientes');
const authenticateToken = require('../middleware/auth');


// router.get('/listar/:estado', controladorPacientes.getClientesEstado);

router.get('/listar/:estado', authenticateToken,
    controladorPacientes.getClientesEstado);

router.get('/:cedula/:estado', authenticateToken,
        controladorPacientes.getclienteCedulaEstado);

router.get('/listar', authenticateToken,
    controladorPacientes.getClientes);


router.get('/:id', authenticateToken,
    controladorPacientes.getclienteId);

router.delete('/Eliminar/:id', authenticateToken,
   controladorPacientes.eliminarcliente);

router.post('/Registrar', authenticateToken,
    controladorPacientes.Registrarcliente);

router.put('/Actualizar', authenticateToken,
    controladorPacientes.Actualizarcliente);


module.exports = router; 