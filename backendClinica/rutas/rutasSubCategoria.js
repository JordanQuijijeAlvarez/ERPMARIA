const express = require('express');
const router = express.Router();
const controladorSubCategoria = require('../controladores/SubCategoria/ctlSubCategorias.js');
const authenticateToken = require('../middleware/auth');


router.get('/listar/:estado', authenticateToken,
    controladorSubCategoria.getSubcategoriasEstado);

router.get('/listar', authenticateToken,
    controladorSubCategoria.getSubCategorias);

router.get('/:id', authenticateToken,
    controladorSubCategoria.getSubcategoriaId);

router.delete('/Eliminar/:id', authenticateToken,
   controladorSubCategoria.eliminarSubcategoria);

router.post('/Registrar', authenticateToken,
    controladorSubCategoria.RegistrarSubcategoria);

router.put('/Actualizar', authenticateToken,
    controladorSubCategoria.Actualizarsubcategoria);


module.exports = router; 