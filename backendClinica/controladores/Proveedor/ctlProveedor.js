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
exports.RegistrarProveedor = async (req, res) => {
    const { prove_ruc, prove_nombre, prove_telefono, prove_correo,prove_direccion, prove_descripcion} = req.body;
    let connection;

    try {
        connection = await getConnection();
        
        // Cambio de sintaxis SELECT funcion() -> BEGIN funcion(); END;
        const query = `BEGIN registrarproveedor(:1, :2, :3, :4, :5,:6); END;`;
        const values = [prove_ruc, prove_nombre, prove_telefono, prove_correo,prove_direccion, prove_descripcion];

        console.log("Registrando valores:", values);

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Proveedor registrado correctamente' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar al proveedor", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 5. ACTUALIZAR PROVEEDOR
// ==========================================
exports.ActualizarProveedor = async (req, res) => {
    const { prove_id, prove_ruc, prove_nombre, prove_telefono, prove_correo,prove_direccion, prove_descripcion } = req.body;
    let connection;

    try {
        connection = await getConnection();

        const query = `BEGIN actualizarproveedor(:1, :2, :3, :4, :5, :6,:7); END;`;
        const values = [ prove_id, prove_ruc, prove_nombre, prove_telefono,prove_correo, prove_direccion, prove_descripcion];
        
        console.log("Actualizando valores:", values);

        await connection.execute(query, values, { autoCommit: true });
        
        res.status(200).json({ message: 'Proveedor actualizado correctamente' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 6. ELIMINAR PROVEEDOR (LÓGICO)
// ==========================================
exports.eliminarProveedor = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        
        const query = `BEGIN eliminarproveedor(:1); END;`;
        
        await connection.execute(query, [id], { autoCommit: true });
        
        res.status(200).json({ message: "El registro se eliminó correctamente" });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

