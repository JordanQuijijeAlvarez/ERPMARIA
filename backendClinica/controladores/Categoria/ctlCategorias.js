// Eliminamos la referencia a Postgres y dejamos solo Oracle
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

// ==========================================================
// 1. LISTAR CATEGORÍAS POR ESTADO (Usando Cursor)
// ==========================================================
exports.getCategoriasEstado = async (req, res) => {
     const { estado } = req.params;
       let connection;
   
       try {
           connection = await getConnection();
           
           const result = await connection.execute(
               `BEGIN :cursor := listarcategoriasestado(:estado); END;`,
               {
                   estado: estado,
                   cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
               },
               { outFormat: oracledb.OUT_FORMAT_OBJECT }
           );
   
           const resultSet = result.outBinds.cursor;
           let rows = [];
           let row;
           
           while ((row = await resultSet.getRow())) {
               rows.push(row);
           }
   
           await resultSet.close();
   
           // Enviamos formateado a minúsculas
           res.json(formatearSalida(rows));
   
       } catch (error) {
           console.error(error);
           res.status(500).json({ message: error.message });
       } finally {
           if (connection) {
               try { await connection.close(); } catch (err) { console.error(err); }
           }
       }
};

// ==========================================================
// 2. OBTENER CATEGORÍA POR ID (Para cargar el formulario de editar)
// ==========================================================
exports.getCategoriaId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `BEGIN :cursor := obtenercategoriaid(:id); END;`,
            {
                id: id,
                     cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
               },
               { outFormat: oracledb.OUT_FORMAT_OBJECT }
           );
   
           const resultSet = result.outBinds.cursor;
           let rows = [];
           let row;
           
           while ((row = await resultSet.getRow())) {
               rows.push(row);
           }
   
           await resultSet.close();
   
           // Enviamos formateado a minúsculas
           res.json(formatearSalida(rows));
   
       } catch (error) {
           console.error(error);
           res.status(500).json({ message: error.message });
       } finally {
           if (connection) {
               try { await connection.close(); } catch (err) { console.error(err); }
           }
       }
    };

// ==========================================================
// 3. REGISTRAR CATEGORÍA
// ==========================================================
exports.Registrarcategoria = async (req, res) => {
    // Asegúrate que desde el front envíes estos nombres exactos en el JSON
    const { cat_nombre, cat_descripcion } = req.body;
    let connection;

    try {
        connection = await getConnection();

        // Usamos el PROCEDIMIENTO ALMACENADO
        const query = `BEGIN registrarcategoria(:nombre, :descripcion); END;`;
        
        const values = {
            nombre: cat_nombre,
            descripcion: cat_descripcion
        };

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Categoría registrada exitosamente' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar la categoría", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 4. ACTUALIZAR CATEGORÍA
// ==========================================================
exports.Actualizarcategoria = async (req, res) => {
    const { cat_id, cat_nombre, cat_descripcion } = req.body; 
    let connection;
    
    try {
        connection = await getConnection();

        const query = `BEGIN actualizarcategoria(:id, :nombre, :descripcion); END;`;
        
        const values = {
            id: cat_id,
            nombre: cat_nombre,
            descripcion: cat_descripcion
        };

        await connection.execute(query, values, { autoCommit: true });

        res.status(200).json({ message: 'Categoría actualizada correctamente' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "Error al actualizar la categoría", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 5. ELIMINAR CATEGORÍA (Lógico)
// ==========================================================
exports.eliminarCategoria = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const query = `BEGIN eliminarcategoria(:id); END;`;
        const values = { id: id };

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: "La categoría se eliminó correctamente" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};