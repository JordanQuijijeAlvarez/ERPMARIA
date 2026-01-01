const { getConnection, oracledb } = require('../../configuracion/oraclePool');
exports.getAuditoria = async (req, res) => {
    let connection;

    try {
        // Query params
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';

        connection = await getConnection();

        // Convertir CLOB a string automáticamente
        oracledb.fetchAsString = [oracledb.CLOB];

        const result = await connection.execute(
            `BEGIN 
                PKG_AUDITORIA.SP_LISTAR_AUDITORIA(
                    :p_page_number,
                    :p_page_size,
                    :p_filtro,
                    :p_total_recs,
                    :p_cursor
                ); 
             END;`,
            {
                p_page_number: page,
                p_page_size: size,
                p_filtro: search,
                p_total_recs: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            }
        );

        const resultSet = result.outBinds.p_cursor;

        // ✅ SOLUCIÓN 1: leer el cursor completo correctamente
        const rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        await resultSet.close();

        const totalRecords = result.outBinds.p_total_recs;

        res.status(200).json({
            ok: true,
            data: rows.map(row => ({
                audi_id: row[0],
                tabla: row[1],
                registro_id: row[2],
                operacion: row[3],
                dato_antiguo: row[4],
                dato_nuevo: row[5],
                user_id: row[6],
                user_nombres: row[7],
                fecha: row[8]
            })),
            pagination: {
                page,
                size,
                total: totalRecords
            }
        });

    } catch (err) {
        console.error('Error en getAuditoria:', err);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener auditoría',
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error cerrando conexión', err);
            }
        }
    }
};


exports.getSesiones = async(req, res) => {
    let connection;

    try {
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';

        connection = await getConnection();

        const result = await connection.execute(
            `BEGIN 
                PKG_AUDITORIA.SP_LISTAR_SESIONES(
                    :p_page_number,
                    :p_page_size,
                    :p_filtro,
                    :p_total_recs,
                    :p_cursor
                ); 
             END;`,
            {
                p_page_number: page,
                p_page_size: size,
                p_filtro: search,
                p_total_recs: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                p_cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            }
        );

        const resultSet = result.outBinds.p_cursor;
        const rows = await resultSet.getRows();
        const totalRecords = result.outBinds.p_total_recs;

        await resultSet.close();

        res.status(200).json({
            ok: true,
            data: rows.map(row => ({
                sesion_id: row[0],
                usuario: row[1],      // Nombre del usuario (del JOIN)
                ip_address: row[2],
                user_agent: row[3],   // Navegador / SO
                fecha_inicio: row[4],
                ultima_actividad: row[5],
                activo: row[6] === 1, // Convertimos 1/0 a true/false para el front
                fingerprint: row[7]
            })),
            pagination: {
                page: page,
                size: size,
                total: totalRecords
            }
        });

    } catch (err) {
        console.error('Error en getSesiones:', err);
        res.status(500).json({
            ok: false,
            msg: 'Error al obtener sesiones',
            error: err.message
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }
};
