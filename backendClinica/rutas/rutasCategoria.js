const express = require('express');
const router = express.Router();
const controladorCategoria = require('../controladores/Categoria/ctlCategorias');
const authenticateToken = require('../middleware/auth');


router.get('/listar/:estado', authenticateToken,
    controladorCategoria.getCategoriasEstado);

  
router.delete('/Eliminar/:id', authenticateToken,
   controladorCategoria.eliminarCategoria);

router.post('/Registrar', authenticateToken,
    controladorCategoria.Registrarcategoria);

router.put('/Actualizar', authenticateToken,
    controladorCategoria.Actualizarcategoria);


module.exports = router; 