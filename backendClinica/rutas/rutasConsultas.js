const express = require('express');
const router = express.Router();
const controladorConsultas = require('../controladores/Consultas/ctlConsultas');
const controladorHistorialMedico = require('../controladores/Consultas/ctlHistorialConsultas');
const authenticateToken = require('../middleware/auth');


router.get('/citasPendientes/:id/:estado', authenticateToken,
    controladorConsultas.getCitasPendientesMedico);

router.get('/historialmedicocompleto', authenticateToken,
    controladorHistorialMedico.getHistorialDeConsultasCompleta);

router.get('/historialmedicocompleto', authenticateToken,
    controladorHistorialMedico.getHistorialDeConsultasCompleta);

router.get('/historialCondicional/:cedula_paciente/:codigo_medico/:fecha_inicio/:fecha_fin', authenticateToken,
    controladorHistorialMedico.getHistorialporCedPacienteCodMedicoFechaIF);    
router.get(
    "/historialCodConsulta/:codigo_consulta",
    authenticateToken,
    controladorHistorialMedico.getHistorialporCodigoConsulta
    );
    
router.post('/Registrar', authenticateToken,
    controladorConsultas.RegistrarConsulta);


    module.exports = router;