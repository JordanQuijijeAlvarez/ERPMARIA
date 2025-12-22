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
// 1. Verificar si hay caja abierta (Para bloquear/desbloquear ventas)
exports.verificarEstadoCaja = async (req, res) => {
    const { user_id } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `BEGIN SP_VERIFICAR_CAJA_ABIERTA(:p_user_id, :p_resultado); END;`,
            {
                p_user_id: user_id,
                p_resultado: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );

        const resultSet = result.outBinds.p_resultado;
        const row = await resultSet.getRow(); // Solo queremos la primera fila
        await resultSet.close();

        if (row) {
            res.json({ 
                abierta: true, 
                caja_id: row[0], 
                fecha_inicio: row[1], 
                monto_inicial: row[2] 
            });
        } else {
            res.json({ abierta: false, mensaje: 'No hay caja abierta' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', mensaje: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch (e) {}
    }
};

// 2. Abrir Caja
exports.abrirCaja = async (req, res) => {
    const { user_id, monto_inicial } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `BEGIN SP_ABRIR_CAJA(:p_user_id, :p_monto, :p_resp); END;`,
            {
                p_user_id: user_id,
                p_monto: monto_inicial,
                p_resp: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
            }
        );

        const respuesta = result.outBinds.p_resp;
        if (respuesta.startsWith('OK')) {
            res.status(200).json({ status: 'OK', mensaje: respuesta });
        } else {
            res.status(400).json({ status: 'Error', mensaje: respuesta });
        }

    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch (e) {}
    }
};

// 3. Obtener Resumen (Pre-Cierre)
exports.obtenerResumenCaja = async (req, res) => {
    const { caja_id } = req.params;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `BEGIN SP_OBTENER_RESUMEN_CAJA(:p_caja_id, :p_cursor); END;`,
            {
                p_caja_id: caja_id,
                p_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );

        const resultSet = result.outBinds.p_cursor;
        const row = await resultSet.getRow(); 
        await resultSet.close();

        if (row) {
            res.json({
                monto_inicial: row[0],
                total_ventas: row[1],
                total_egresos: row[2],
                saldo_esperado: row[3]
            });
        } else {
            res.status(404).json({ mensaje: 'Caja no encontrada' });
        }

    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch (e) {}
    }
};

// 4. Cerrar Caja (Acción Final)
exports.cerrarCaja = async (req, res) => {
    const { caja_id, monto_real, observacion } = req.body;
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `BEGIN SP_CERRAR_CAJA(:p_caja_id, :p_real, :p_obs, :p_resp); END;`,
            {
                p_caja_id: caja_id,
                p_real: monto_real,
                p_obs: observacion || '',
                p_resp: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
            }
        );

        const respuesta = result.outBinds.p_resp;
        res.json({ status: 'OK', mensaje: respuesta });

    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch (e) {}
    }
};

// 5. Listar Historial de Cajas
exports.listarCajas = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `BEGIN SP_LISTAR_CAJAS(:p_cursor); END;`,
            {
                p_cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT }
            }
        );

        const resultSet = result.outBinds.p_cursor;
        const rows = [];
        let row;
        
        // Transformamos el array de Oracle a Objetos JSON limpios
        while ((row = await resultSet.getRow())) {
            rows.push({
                caja_id: row[0],
                user_id: row[1],
                cajero_nombre: row[2],
                fecha_inicio: row[3],
                fecha_fin: row[4],
                monto_inicial: row[5],
                total_ventas: row[6],
                total_compras: row[7],
                monto_sistema: row[8],
                monto_real: row[9],
                diferencia: row[10],
                estado: row[11],
                observacion: row[12]
            });
        }
        await resultSet.close();
        res.json(rows);

    } catch (error) {
        res.status(500).json({ status: 'Error', mensaje: error.message });
    } finally {
        if (connection) try { await connection.close(); } catch (e) {}
    }
};