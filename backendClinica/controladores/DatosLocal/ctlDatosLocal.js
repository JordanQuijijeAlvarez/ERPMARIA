const poolsec = require('../../configuracion/dbmini');

// LISTAR POR ESTADO
exports.getLocalEstado = async (req, res) => {
    const {estado} = req.params;
    const query = 'SELECT * FROM listarlocalestado($1)';
    const values = [estado];
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LISTAR TODOS
exports.getLocal = async (req, res) => {
    const query = 'SELECT * FROM local;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// OBTENER POR ID
exports.getLocalId = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: La columna es 'local_id' según source 2
    const query ='SELECT * FROM local WHERE local_id = $1'; 
    const values = [id];
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount > 0){
            res.json(result.rows[0]);
        } else {
            res.status(400).json({error:"NO EXISTE ESE LOCAL"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};

// REGISTRAR
exports.Registrarlocal = async (req, res) => {
    const {nombre, ruc, telefono, direccion} = req.body;
    const query ='SELECT registrarlocal($1, $2, $3, $4);';
    const values = [nombre, ruc, telefono, direccion];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'local registrado'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registrar al local"});
    }
};

// ACTUALIZAR
exports.Actualizarlocal = async (req, res) => {
    // CORRECCIÓN: Quitamos 'estado' del array para coincidir con los 5 placeholders ($1-$5)
    // El ID es necesario para el WHERE
    const {local_id, nombre, ruc, telefono, direccion} = req.body;
    
    const query ='SELECT actualizarlocal($1, $2, $3, $4, $5);';
    const values = [local_id, nombre, ruc, telefono, direccion];
    
    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'local actualizado'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

// ELIMINAR (LÓGICO)
exports.eliminarlocal = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: Sintaxis correcta y uso de await sin callback
    const query ='SELECT eliminarlocal($1);';
    const values = [id];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query, values);
        actor.release();
        
        res.status(200).json({message:"El registro se elimino correctamente"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};