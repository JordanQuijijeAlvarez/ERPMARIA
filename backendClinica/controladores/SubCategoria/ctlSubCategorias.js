const poolsec = require('../../configuracion/dbmini');


const { getConnection, oracledb } = require('../../configuracion/oraclePool');

// helper para convertir llaves a minúsculas
function formatearSalida(rows) {
    if (!rows || rows.length === 0) return [];
    return rows.map(obj => {
        const nuevo = {};
        Object.keys(obj).forEach(k => nuevo[k.toLowerCase()] = obj[k]);
        return nuevo;
    });
}



exports.getSubcategoriasEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT subcat_id,subcat_nombre,subcat_descripcion,cat_id FROM SUBCATEGORIA WHERE subcat_estado = :estado`,
            { estado },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Formatear claves a minúscula
        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

    } finally {
        if (connection) await connection.close();
    }
};



exports.RegistrarSubcategoria = async (req, res) => {
    
    const { cat_id, subcat_nombre, subcat_descripcion  } = req.body;
    let connection;

    try {
        connection = await getConnection();

        // 1. CORREGIDO: Se agregó el nombre de la tabla 'CATEGORIA'
        // 2. CORREGIDO: Se eliminó el 'commit;' del string
        const query = `INSERT INTO SUBCATEGORIA (cat_id,subcat_nombre, subcat_descripcion) VALUES (:cat_id, :subcat_nombre, :subcat_descripcion)`;
        
        // 3. CORREGIDO: Se usa un Objeto {} en lugar de un Array [] para coincidir con los :nombres
        const values = {
            cat_id:cat_id,
            subcat_nombre: subcat_nombre,
            subcat_descripcion: subcat_descripcion
        };

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'SubCategoria registrada exitosamente' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar la Subcategoria", details: error.message });
    } finally {
        if (connection) await connection.close();
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