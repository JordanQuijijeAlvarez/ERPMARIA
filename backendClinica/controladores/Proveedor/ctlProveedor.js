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
// 1. LISTAR POR ESTADO (Usa Cursor)
// ==========================================
exports.getProveedoresEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        // En Oracle, las funciones que retornan tablas devuelven un CURSOR
        const result = await connection.execute(
            `BEGIN :cursor := listarproveedoresestado(:estado); END;`,
            {
                estado: estado,
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        // Extraer filas del cursor
        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        await resultSet.close();

        // Formatear a minúsculas y responder
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
// 1. LISTAR POR RUC ESTADO (Usa Cursor)
// ==========================================
exports.getProveedoresRucEstado = async (req, res) => {
    const { ruc, estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        // En Oracle, las funciones que retornan tablas devuelven un CURSOR
        const result = await connection.execute(
            `BEGIN :cursor := listarproveedoresrucestado(:ruc,:estado); END;`,
            {
                estado: estado,
                ruc: ruc,
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        // Extraer filas del cursor
        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        await resultSet.close();

        // Formatear a minúsculas y responder
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
// 2. LISTAR TODOS (TABLA PURA)
// ==========================================
exports.getProveedores = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const result = await connection.execute(
            `SELECT * FROM PROVEEDOR`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 3. OBTENER POR ID
// ==========================================
exports.getproveedorId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        
        const result = await connection.execute(
            `SELECT * FROM PROVEEDOR WHERE prove_id = :id`,
            [id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length > 0) {
            const proveedorFormateado = formatearSalida(result.rows)[0];
            res.json(proveedorFormateado);
        } else {
            res.status(400).json({ error: "NO EXISTE ESE PROVEEDOR" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 4. REGISTRAR PROVEEDOR
// ==========================================
// ==========================================
// 1. REGISTRAR PROVEEDOR (CON AUDITORÍA)
// ==========================================
exports.RegistrarProveedor = async (req, res) => {
    // 1. Recibimos user_id para la auditoría
    const { user_id, prove_ruc, prove_nombre, prove_telefono, prove_correo, prove_direccion, prove_descripcion } = req.body;
    let connection;

    // Validación de seguridad
    if (!user_id) {
        return res.status(400).json({ error: "Falta el ID del usuario para auditar el registro." });
    }

    try {
        connection = await getConnection();
        
        // 2. Modificamos el Query: Agregamos :1 al inicio (Total 7 parámetros)
        // SP esperado: registrarProveedor(p_user_id, p_ruc, p_nombre, p_telefono, p_correo, p_dir, p_desc)
        const query = `BEGIN registrarproveedor(:1, :2, :3, :4, :5, :6, :7); END;`;
        
        // 3. user_id va PRIMERO en el array
        const values = [
            user_id, 
            prove_ruc, 
            prove_nombre, 
            prove_telefono, 
            prove_correo, 
            prove_direccion, 
            prove_descripcion
        ];

        console.log("Registrando Proveedor con Auditoría:", values);

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Proveedor registrado y auditado correctamente' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar al proveedor", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 2. ACTUALIZAR PROVEEDOR (CON AUDITORÍA)
// ==========================================
exports.ActualizarProveedor = async (req, res) => {
    // 1. Recibimos user_id
    const { user_id, prove_id, prove_ruc, prove_nombre, prove_telefono, prove_correo, prove_direccion, prove_descripcion } = req.body;
    let connection;

    if (!user_id) {
        return res.status(400).json({ error: "Falta el ID del usuario para auditar la actualización." });
    }

    try {
        connection = await getConnection();

        // 2. Modificamos el Query: Agregamos :1 al inicio (Total 8 parámetros)
        // SP esperado: actualizarProveedor(p_user_id, p_id, p_ruc, ...)
        const query = `BEGIN actualizarproveedor(:1, :2, :3, :4, :5, :6, :7, :8); END;`;
        
        // 3. user_id va PRIMERO
        const values = [
            user_id, 
            prove_id, 
            prove_ruc, 
            prove_nombre, 
            prove_telefono, 
            prove_correo, 
            prove_direccion, 
            prove_descripcion
        ];
        
        console.log("Actualizando Proveedor con Auditoría:", values);

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Proveedor actualizado y auditado correctamente' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 3. ELIMINAR PROVEEDOR (CON AUDITORÍA)
// ==========================================
exports.eliminarProveedor = async (req, res) => {
    const { id } = req.params;
    // user_id puede venir en el body (si usas axios.delete con data) o en query params (?user_id=5)
    const user_id = req.body.user_id || req.query.user_id; 
    let connection;

    if (!user_id) {
        return res.status(400).json({ error: "Falta el ID del usuario para auditar la eliminación." });
    }

    try {
        connection = await getConnection();
        
        // SP esperado: eliminarProveedor(p_user_id, p_prove_id)
        const query = `BEGIN eliminarproveedor(:1, :2); END;`;
        
        // user_id primero, luego el id del proveedor
        await connection.execute(query, [user_id, id], { autoCommit: true });
        
        res.status(200).json({ message: "El registro se eliminó y auditó correctamente" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};