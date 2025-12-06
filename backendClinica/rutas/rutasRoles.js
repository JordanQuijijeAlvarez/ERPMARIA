const express = require('express');
const router = express.Router();
const controladorRoles = require('../controladores/Roles/ctlRoles');
const authenticateToken = require('../middleware/auth');

router.get('/listarRoles', authenticateToken, 
    controladorRoles.getRolesActivos);

router.get('/:id', authenticateToken,
    controladorRoles.getRolId);
    

module.exports = router; 