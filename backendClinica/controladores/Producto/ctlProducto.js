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

exports.getProductosEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM VW_PRODUCTO_DETALLE WHERE prod_estado = :estado`,
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

exports.getProductosCodigoBarrasEstado = async (req, res) => {
    const { codbarra,estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM PRODUCTO WHERE prod_estado = :estado AND prod_codbarra=:codbarra`,
            { codbarra,estado },
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

exports.getProductosPrecioAlert = async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM VW_ALERTAS_PRECIOS`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};


exports.getProductos = async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM vw_producto_detalle`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.getProductoId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM producto WHERE prod_id = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            res.json(formatearSalida(result.rows)[0]);
        } else {
            res.status(404).json({ error: "NO EXISTE ESE PRODUCTO" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};
// ==========================================
// 1. REGISTRAR PRODUCTO (ACTUALIZADO)
// ==========================================
exports.RegistrarProducto = async (req, res) => {
    // 1. Agregamos user_id
    const { user_id, subcat_id, prod_nombre, prod_codbarra, prod_descripcion, prod_preciocompra, prod_precioventa, prod_stock, prod_stockmin } = req.body;
    let connection;

    // Validación básica
    if (!user_id || !prod_nombre || !subcat_id) {
        return res.status(400).json({ error: "Faltan datos obligatorios (Usuario, Nombre o Subcategoría)" });
    }

    try {
        connection = await getConnection();

        // 2. Modificamos Query: Agregamos :1 al inicio (Total 9 parámetros ahora)
        // SP esperado: registrarProducto(p_user_id, p_subcat_id, ...)
        const query = `BEGIN registrarProducto(:1, :2, :3, :4, :5, :6, :7, :8, :9); END;`;

        // 3. user_id va PRIMERO en el array
        const params = [
            user_id, 
            subcat_id, 
            prod_nombre, 
            prod_codbarra, 
            prod_descripcion, 
            prod_preciocompra, 
            prod_precioventa, 
            prod_stock, 
            prod_stockmin
        ];

        await connection.execute(query, params, { autoCommit: true });

        res.json({ message: "Producto registrado y auditado correctamente" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 2. ACTUALIZAR PRODUCTO (ACTUALIZADO)
// ==========================================
exports.Actualizarproducto = async (req, res) => {
    // 1. Agregamos user_id
    const { user_id, prod_id, subcat_id, prod_nombre, prod_codbarra, prod_descripcion, prod_preciocompra, prod_precioventa, prod_stock, prod_stockmin } = req.body;
    let connection;

    if (!user_id) {
        return res.status(400).json({ error: "Falta el ID del usuario para auditar" });
    }

    try {
        connection = await getConnection();

        // 2. Modificamos Query: Agregamos :1 al inicio (Total 10 parámetros)
        // SP esperado: actualizarProducto(p_user_id, p_prod_id, ...)
        const query = `BEGIN actualizarProducto(:1, :2, :3, :4, :5, :6, :7, :8, :9, :10); END;`;

        // 3. user_id va PRIMERO
        const params = [
            user_id, 
            prod_id, 
            subcat_id, 
            prod_nombre, 
            prod_codbarra, 
            prod_descripcion, 
            prod_preciocompra, 
            prod_precioventa, 
            prod_stock, 
            prod_stockmin
        ];

        await connection.execute(query, params, { autoCommit: true });

        res.json({ message: "Producto actualizado y auditado" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 3. ELIMINAR PRODUCTO (ACTUALIZADO)
// ==========================================
exports.eliminarproducto = async (req, res) => {
    const { id } = req.params;
    // Recibimos user_id por body o query
    const user_id = req.body.user_id || req.query.user_id; 
    let connection;

    if (!user_id) {
        return res.status(400).json({ error: "Falta el ID del usuario para auditar la eliminación" });
    }

    try {
        connection = await getConnection();

        // SP esperado: eliminarProducto(p_user_id, p_prod_id)
        const query = `BEGIN eliminarProducto(:1, :2); END;`;

        // user_id va PRIMERO
        await connection.execute(query, [user_id, id], { autoCommit: true });

        res.json({ message: "Producto eliminado correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================
// 4. ACTUALIZACIÓN PRECIO RÁPIDA (ESPECIAL)
// ==========================================
// Como este usa UPDATE directo (sin SP), debemos setear el identificador manualmente
// para que el Trigger lo capture.
exports.actualizarPrecioVenta = async (req, res) => {
    const { user_id, prod_id, nuevo_precio } = req.body; // Agregamos user_id
    let connection;

    if (!user_id) return res.status(400).json({ error: "Falta user_id" });

    try {
        connection = await getConnection();

        // PASO CLAVE: Seteamos el identificador de sesión ANTES del update
        // Esto hace que el Trigger detecte el usuario sin cambiar el SQL del update
        await connection.execute(
            `BEGIN DBMS_SESSION.SET_IDENTIFIER(:1); END;`,
            [user_id.toString()] // Debe ser string
        );

        const query = `UPDATE PRODUCTO SET prod_precioventa = :p_precio WHERE prod_id = :p_id`;
        
        await connection.execute(query, {
            p_precio: nuevo_precio,
            p_id: prod_id
        }, { autoCommit: true });

        res.status(200).json({ message: 'Precio actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};
exports.getProductosBajoStock = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM VW_STOCK_BAJO ORDER BY prod_stock ASC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(formatearSalida(result.rows)); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ctlDashboard.js

// Productos Hueso
exports.getProductosSinMovimiento = async (req, res) => {
 let connection;
    try {
        connection = await getConnection();    
        const result = await connection.execute(
        `SELECT * FROM VW_PRODUCTOS_SIN_MOVIMIENTO ORDER BY dinero_congelado DESC`, // Los más caros primero
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(formatearSalida(result.rows));
 } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// KPI Ventas
exports.getKpiVentas = async (req, res) => {
 let connection;
    try {
        connection = await getConnection();    
        const result = await connection.execute(    
        `SELECT * FROM VW_KPI_VENTAS_DIA`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(formatearSalida(result.rows)[0]); // Retornamos solo el objeto
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};


exports.getGraficoVentas = async (req, res) => {
    // Leemos el parámetro de la URL (ej: /grafico/ventas/30)
    const dias = req.params.dias || 7; 

    let connection;
    try {
        connection = await getConnection();
        
        // Consultamos la vista GENERAL pero filtramos AQUÍ con el parámetro
        const query = `
            SELECT * FROM VW_VENTAS_DIARIAS_GENERAL 
            WHERE fecha >= TRUNC(SYSDATE) - :p_dias
            ORDER BY fecha ASC
        `;

        const result = await connection.execute(
            query, 
            [dias], // Pasamos el número de días a Oracle
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        res.json(formatearSalida(result.rows));

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};


// 2. Datos para Gráfico de Barras
exports.getGraficoTop = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM VW_GRAFICO_TOP_PRODUCTOS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(formatearSalida(result.rows));
    } catch (error) { res.status(500).json({ error: error.message }); }
    finally { if (connection) await connection.close(); }
};

// 3. Datos para Gráfico Financiero
exports.getGraficoFinanzas = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM VW_GRAFICO_FINANZAS`, [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(formatearSalida(result.rows)[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
    finally { if (connection) await connection.close(); }
};


