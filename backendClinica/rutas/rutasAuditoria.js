const express = require('express');
const router = express.Router();
const AudiController = require('../controladores/auditoria/ctlauditoria.js');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, AudiController.getAuditoria);

router.get('/sesiones', AudiController.getSesiones);

module.exports = router; 