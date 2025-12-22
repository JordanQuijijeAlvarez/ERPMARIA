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

// ==========================================
// 1. OBTENER CLIENTES POR ESTADO (Cursor)
// ==========================================
exports.getClientesEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();
        
        const result = await connection.execute(
            `BEGIN :cursor := listarClientesestado(:estado); END;`,
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

// ==========================================
// 2. OBTENER TODOS LOS CLIENTES
// ==========================================
exports.getClientes = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM CLIENTE ORDER BY client_id DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({
            ok: true,
            clientes: formatearSalida(result.rows) // Aplicamos formato
        });
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ ok: false, message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 3. OBTENER CLIENTE POR ID
// ==========================================
exports.getclienteId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM CLIENTE WHERE client_id = :id`,
            [id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            // Formateamos y devolvemos solo el primer elemento
            const clienteFormateado = formatearSalida(result.rows)[0];
            res.json(clienteFormateado);
        } else {
            res.status(400).json({ error: "NO EXISTE ESE CLIENTE" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 4. OBTENER POR CEDULA Y ESTADO
// ==========================================
exports.getclienteCedulaEstado = async (req, res) => {
    const { cedula, estado } = req.params;
    let connection;

    try {
        connection = await getConnection();
        // Nota: En Oracle los parámetros posicionales son :1, :2 o por nombre :cedula, :estado
        // Es más seguro usar bind por nombre o posición estricta.
        const query = `SELECT * FROM CLIENTE WHERE client_cedula = :cedula AND client_estado = :estado `;
        
        const result = await connection.execute(
            query,
            [cedula, estado], // Mapea a :cedula y :estado por orden si usas array
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            const clienteFormateado = formatearSalida(result.rows)[0];
            res.json(clienteFormateado);
        } else {
            res.status(400).json({ error: "NO SE ENCONTRARON RESULTADOS" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};


// ==========================================
// 5. REGISTRAR CLIENTE (ACTUALIZADO)
// ==========================================
exports.Registrarcliente = async (req, res) => {
    // 1. Ahora recibimos también el user_id desde el front
    const { user_id, client_cedula, client_nombres, client_apellidos, client_direccion, client_correo } = req.body;
    let connection;
    
    // Validación
    if(!client_cedula || !client_nombres || !user_id) {
         return res.status(400).json({error: "Datos incompletos: Falta cédula, nombre o el usuario logueado."});
    }

    try {
        connection = await getConnection();
        
        // 2. Modificamos el Query: Agregamos un parámetro más (:1) al inicio
        // Suponiendo que tu SP es: registrarcliente(p_user_id, p_cedula, ...)
        const query = `BEGIN registrarcliente(:1, :2, :3, :4, :5, :6); END;`;
        
        // 3. El user_id va PRIMERO en el array
        const values = [user_id, client_cedula, client_nombres, client_apellidos, client_direccion, client_correo];

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Cliente registrado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar al cliente", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};
// ==========================================
// 6. ACTUALIZAR CLIENTE (ACTUALIZADO)
// ==========================================
exports.Actualizarcliente = async (req, res) => {
    // Recibimos user_id para saber quién editó
    const { user_id, client_id, client_cedula, client_nombres, client_apellidos, client_direccion, client_correo } = req.body;
    let connection;

    if(!user_id) {
        return res.status(400).json({error: "Falta el ID del usuario que realiza la acción"});
   }

    try {
        connection = await getConnection();
        
        // Asumiendo que actualizaste el SP actualizarcliente para recibir el user_id primero
        // QUERY: actualizarcliente(p_user_id, p_client_id, ...)
        const query = `BEGIN actualizarcliente(:1, :2, :3, :4, :5, :6, :7); END;`;
        
        // user_id va primero
        const values = [user_id, client_id, client_cedula, client_nombres, client_apellidos, client_direccion, client_correo];

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Cliente actualizado correctamente' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 7. ELIMINAR CLIENTE (ACTUALIZADO)
// ==========================================
exports.eliminarcliente = async (req, res) => {
    const { id } = req.params;
    // OJO: En DELETE a veces el body no llega dependiendo del cliente HTTP.
    // Asegúrate de enviar el user_id en el body o por query string (?user_id=5)
    const user_id = req.body.user_id || req.query.user_id; 
    
    let connection;

    if(!user_id) {
        return res.status(400).json({error: "Falta el ID del usuario para auditar la eliminación"});
    }

    try {
        connection = await getConnection();
        
        // Asumiendo SP: eliminarcliente(p_user_id, p_client_id)
        const query = `BEGIN eliminarcliente(:1, :2); END;`;
        
        // user_id primero
        await connection.execute(query, [user_id, id], { autoCommit: true });
        
        res.status(200).json({ message: "El registro se eliminó y auditó correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR", detalle: error.message });
    } finally {
        if (connection) await connection.close();
    }
};