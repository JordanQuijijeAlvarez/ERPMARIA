const express = require('express');
const router = express.Router();
const controladorRoles = require('../controladores/Roles/ctlRoles');
const authenticateToken = require('../middleware/auth');

router.get('/listar', authenticateToken, 
    controladorRoles.getRolesEstado);

router.get('/:id', authenticateToken,
    controladorRoles.getRolId);
    

module.exports = router; 