const { getConnection, oracledb } = require('../../configuracion/oraclePool');

// ==========================================================
// HELPER: Convertir llaves a minúsculas
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
// 1. LISTAR COMPRAS POR ESTADO (Activas/Anuladas)
// ==========================================================
exports.getComprasEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        // Usamos la Vista VW_COMPRAS filtrando por estado
        // estado: 1 (Activas), 0 (Anuladas)
        const result = await connection.execute(
            `SELECT * FROM VW_COMPRAS WHERE compra_estado = :estado ORDER BY compra_id DESC`,
            [estado],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const compras = formatearSalida(result.rows);
        res.json(compras);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al listar compras", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 2. LISTAR TODAS LAS COMPRAS
// ==========================================================
exports.getCompras = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        
        const result = await connection.execute(
            `SELECT * FROM VW_COMPRAS ORDER BY compra_id DESC`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(formatearSalida(result.rows));
    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 3. OBTENER COMPRA POR ID (Cabecera + Detalles)
// ==========================================================
exports.getcompraId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        // A. Obtener Cabecera
        const resultCabecera = await connection.execute(
            `SELECT * FROM VW_COMPRAS WHERE compra_id = :id`,
            [id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (resultCabecera.rows.length === 0) {
            return res.status(404).json({ error: "NO EXISTE ESA COMPRA" });
        }

        // B. Obtener Detalles
        const resultDetalles = await connection.execute(
            `SELECT * FROM VW_DETALLE_COMPRA WHERE compra_id = :id`,
            [id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Formatear
        const cabecera = formatearSalida(resultCabecera.rows)[0];
        const items = formatearSalida(resultDetalles.rows);

        // C. Unir respuesta (Formato que espera tu Front para Edición/Visualización)
        // Nota: Adaptamos los nombres para que coincidan con lo que espera tu 'cargarVentaParaEditar' en Angular
        const respuesta = {
            ...cabecera,
            detalle_compra: items 
        };

        res.json(respuesta);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 4. REGISTRAR COMPRA
// ==========================================================
exports.Registrarcompra = async (req, res) => {
    const { 
        local_id, 
        prove_id, 
        user_id,
        compra_total, // Asegúrate de que Angular envíe este nombre
        compra_iva,
        compra_subiva, 
        compra_descripcion,       
        detalle_compra 
    } = req.body;

    let connection;

    try {
        connection = await getConnection();

        const detallesJson = JSON.stringify(detalle_compra || []);

        const query = `
            BEGIN 
                REGISTRAR_COMPRA_COMPLETA(
                    :p_local_id, :p_prove_id, :p_user_id, 
                    :p_monto, :p_iva, :p_subiva, :p_descripcion, 
                    :p_detalles_json, :p_respuesta
                ); 
            END;
        `;

        const values = {
            p_local_id: local_id || 1,
            p_prove_id: prove_id,
            p_user_id: user_id || 1,
            p_monto: compra_total || 0,
            p_iva: compra_iva || 0,
            p_subiva: compra_subiva || 0,
            p_descripcion: compra_descripcion || '',
            p_detalles_json: detallesJson,
            p_respuesta: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
        };

        const result = await connection.execute(query, values, { autoCommit: true });
        
        // Procesar CLOB
        const lob = result.outBinds.p_respuesta;
        let jsonRespuesta = typeof lob === 'string' ? JSON.parse(lob) : JSON.parse(await lob.getData());

        if (jsonRespuesta.status === 'OK') {
            res.status(200).json(jsonRespuesta);
        } else {
            res.status(400).json({ error: jsonRespuesta.message });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: "No se pudo registrar la compra", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 5. ACTUALIZAR COMPRA
// ==========================================================
exports.Actualizarcompra = async (req, res) => {
    const {
        compra_id, 
        local_id,
        prove_id,
        user_id,
        compra_total,
        compra_iva,
         compra_subiva, // Agregar si el SP lo pide
        detalle_compra // Array de productos
    } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const detallesJson = JSON.stringify(detalle_compra || []);

        const query = `
            BEGIN 
                ACTUALIZAR_COMPRA_COMPLETA(
                    :p_compra_id, :p_local_id, :p_prove_id, :p_user_id, 
                    :p_monto, :p_iva,:p_subiva, :p_detalles_json, :p_respuesta
                ); 
            END;
        `;
        
        const values = {
            p_compra_id: compra_id,
            p_local_id: local_id || 1,
            p_prove_id: prove_id,
            p_user_id: user_id || 1,
            p_monto: compra_total,
            p_iva: compra_iva,
            p_subiva: compra_subiva,
            p_detalles_json: detallesJson,
            p_respuesta: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
        };

        const result = await connection.execute(query, values, { autoCommit: true });

        const lob = result.outBinds.p_respuesta;
        let jsonRespuesta = typeof lob === 'string' ? JSON.parse(lob) : JSON.parse(await lob.getData());

        if (jsonRespuesta.status === 'OK') {
            res.status(200).json(jsonRespuesta);
        } else {
            res.status(400).json({ error: jsonRespuesta.message });
        }
    
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "No se pudo actualizar la compra", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

// ==========================================================
// 6. ELIMINAR (ANULAR) COMPRA
// ==========================================================
exports.eliminarcompra = async (req, res) => {
    const { id } = req.params;
    // Asumiendo que el ID del usuario viene en el body o hardcodeado
    const user_id = req.body.user_id || 1; 

    let connection;

    try {
        connection = await getConnection();
        
        // Llamamos al procedimiento ANULAR_COMPRA que definimos previamente
        const query = `
            BEGIN 
                ANULAR_COMPRA(:p_compra_id, :p_user_id, :p_respuesta); 
            END;
        `;
        
        const values = {
            p_compra_id: id,
            p_user_id: user_id,
            p_respuesta: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
        };

        const result = await connection.execute(query, values, { autoCommit: true });

        const lob = result.outBinds.p_respuesta;
        let jsonRespuesta = typeof lob === 'string' ? JSON.parse(lob) : JSON.parse(await lob.getData());

        if (jsonRespuesta.status === 'OK') {
            res.status(200).json({ message: "Compra anulada correctamente", db_response: jsonRespuesta });
        } else {
            res.status(404).json({ error: jsonRespuesta.message });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error en el servidor al eliminar", details: error.message });
    } finally {
        if (connection) await connection.close();
    }
};


exports.ConfirmarRegistroCompra = async (req, res) => {
    // 1. Obtenemos el ID de la compra de la URL (ej: /compras/confirmar/:id)
    const { id } = req.params; 
    
    // 2. Obtenemos el usuario del body (quién está haciendo la recepción)
    const { user_id } = req.body;

    let connection;

    try {
        connection = await getConnection();

        // 3. Llamamos al procedimiento de CONFIRMACIÓN (No al de registro)
        const query = `
            BEGIN 
                CONFIRMAR_RECEPCION_COMPRA(
                    :p_compra_id, 
                    :p_user_id, 
                    :p_respuesta
                ); 
            END;
        `;

        const values = {
            p_compra_id: id,
            p_user_id: user_id || 1, // Usuario por defecto si no viene
            p_respuesta: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
        };

        const result = await connection.execute(query, values, { autoCommit: true });
        
        // 4. Procesar respuesta del CLOB (Misma lógica que usas en los otros métodos)
        const lob = result.outBinds.p_respuesta;
        let jsonRespuesta;
        
        // Verificamos si oracledb lo devolvió como string o como objeto LOB
        if (typeof lob === 'string') {
             jsonRespuesta = JSON.parse(lob);
        } else {
             const lobData = await lob.getData();
             jsonRespuesta = JSON.parse(lobData);
        }

        // 5. Responder al Frontend
        if (jsonRespuesta.status === 'OK') {
            res.status(200).json(jsonRespuesta);
        } else {
            // Si el procedimiento dice ERROR (ej: "Ya estaba recibida"), devolvemos 400
            res.status(400).json({ error: jsonRespuesta.message });
        }

    } catch (error) {
        console.error("Error en ConfirmarRegistroCompra:", error);
        res.status(500).json({ 
            error: "Error interno al confirmar la recepción", 
            details: error.message 
        });
    } finally {
        if (connection) await connection.close();
    }
};