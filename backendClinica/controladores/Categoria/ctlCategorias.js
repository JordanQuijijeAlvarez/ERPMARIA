const poolsec = require('../../configuracion/dbmini');

exports.getCategoriasEstado = async (req, res) => {
    const {estado} = req.params;
    const query = 'SELECT * FROM listarcategoriasestado($1)';
    const values = [estado];
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategorias = async (req, res) => {
    const query = 'SELECT * FROM categoria;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getCategoriaId = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: La columna es 'cat_id', no 'codigo'
    const query ='SELECT * FROM categoria WHERE cat_id = $1';
    const values = [id];
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount > 0){
            res.json(result.rows[0]);
        } else {
            res.status(400).json({error:"NO EXISTE ESA CATEGORIA"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};

exports.Registrarcategoria = async (req, res) => {
    const {nombre, descripcion} = req.body;
    const query ='SELECT registrarcategoria($1, $2);';
    const values = [nombre, descripcion];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'categoria registrada'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registrar la categoria"});
    }
};

exports.Actualizarcategoria = async (req, res) => {
    // CORRECCIÓN: Necesitamos el ID para saber qué actualizar
    const {cat_id, nombre, descripcion} = req.body; 
    
    const query ='SELECT actualizarcategoria($1, $2, $3);';
    const values = [cat_id, nombre, descripcion];
    
    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'categoria actualizada'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

exports.eliminarCategoria = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: Sintaxis correcta y sin callbacks
    const query ='SELECT eliminarcategoria($1);';
    const values = [id];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query, values);
        actor.release();
        
        res.status(200).json({message:"El registro se eliminó correctamente"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};