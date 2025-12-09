const poolsec = require('../../configuracion/dbmini'); // Si ya no usas pg, esta linea quiza sobre, pero la dejo por si acaso
const { getConnection, oracledb } = require('../../configuracion/oraclePool');

// ==========================================================
// FUNCIÓN DE AYUDA (HELPER)
// Convierte las llaves de ORACLE (MAYUSCULAS) a minúsculas
// ==========================================================
function formatearSalida(rows) {
    if (!rows || rows.length === 0) return [];
    return rows.map(obj => {
        const newObj = {};
        Object.keys(obj).forEach(key => {
            newObj[key.toLowerCase()] = obj[key];
        });
        return newObj;
    });
}




exports.getCategoriasEstado = async (req, res) => {
  
         const { estado } = req.params;
         let connection;
     
         try {
             connection = await getConnection();
             const result = await connection.execute(
                 `SELECT cat_id,cat_nombre FROM CATEGORIA WHERE cat_estado = :estado`,
                 [estado],
                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
             );
     
             if (result.rows.length > 0) {
                 const categoriaFormat = formatearSalida(result.rows);
                 res.json(categoriaFormat);
             } else {
                 res.status(400).json({ error: "NO EXISTE CATEGORIAS" });
             }
     
         } catch (error) {
             console.log(error);
             res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
         } finally {
             if (connection) await connection.close();
         }
   };
   



exports.Registrarcategoria = async (req, res) => {
    
    const { cat_nombre, cat_descripcion } = req.body;
    let connection;

    try {
        connection = await getConnection();

        // 1. CORREGIDO: Se agregó el nombre de la tabla 'CATEGORIA'
        // 2. CORREGIDO: Se eliminó el 'commit;' del string
        const query = `INSERT INTO CATEGORIA (cat_nombre, cat_descripcion) VALUES (:cat_nombre, :cat_descripcion)`;
        
        // 3. CORREGIDO: Se usa un Objeto {} en lugar de un Array [] para coincidir con los :nombres
        const values = {
            cat_nombre: cat_nombre,
            cat_descripcion: cat_descripcion
        };

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Categoria registrada exitosamente' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar la categoria", details: error.message });
    } finally {
        if (connection) await connection.close();
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