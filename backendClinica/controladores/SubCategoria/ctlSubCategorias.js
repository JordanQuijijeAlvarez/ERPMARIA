const poolsec = require('../../configuracion/dbmini');

// Listar subcategorías por estado
exports.getSubcategoriasEstado = async (req, res) => {
    const {estado} = req.params;
    // Corregido: nombre de función en SQL
    const query = 'SELECT * FROM listarsubcategoriasestado($1)';
    const values = [estado];
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener todas (tabla cruda)
exports.getSubCategorias = async (req, res) => {
    const query = 'SELECT * FROM subcategoria;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener por ID
exports.getSubcategoriaId = async (req, res) => {
    const {id} = req.params;
    // Corregido: nombre de columna subcat_id
    const query ='SELECT * FROM subcategoria WHERE subcat_id = $1';
    const values = [id];
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount > 0){
            res.json(result.rows[0]);
        }else{
            res.status(400).json({error:"NO EXISTE ESA SUBCATEGORIA"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};

// Registrar
exports.RegistrarSubcategoria = async (req, res) => {
    const {cat_id, nombre, descripcion} = req.body;
    const query ='SELECT registrarsubcategoria($1, $2, $3);';
    const values = [cat_id, nombre, descripcion];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'subcategoria registrada'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registrar la subcategoria"});
    }
};

// Actualizar
exports.Actualizarsubcategoria = async (req, res) => {
    // CORRECCIÓN: Se requiere el subcat_id para saber cuál actualizar
    const {subcat_id, cat_id, nombre, descripcion} = req.body;
    
    const query ='SELECT actualizarsubcategoria($1, $2, $3, $4);';
    // El orden de values debe coincidir con los parámetros de la función SQL
    const values = [subcat_id, cat_id, nombre, descripcion];
    
    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'subcategoria actualizada'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

// Eliminar
exports.eliminarSubcategoria = async (req, res) => {
    const {id} = req.params;
    // Corregido: sintaxis SELECT función()
    const query ='SELECT eliminarsubcategoria($1);';
    const values = [id];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        // Usamos await puro, sin callbacks
        await actor.query(query, values);
        actor.release();
        
        res.status(200).json({message:"El registro se eliminó correctamente"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};