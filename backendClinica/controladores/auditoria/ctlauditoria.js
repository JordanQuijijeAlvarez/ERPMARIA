const { getConnection, oracledb } = require('../../configuracion/oraclePool');

exports.getAuditoria = async(req, res) => {
    let connection;

    try {
        // Obtener parámetros de la URL (Query Params)
        // Ejemplo: /api/auditoria?page=1&size=10&search=VENTAS
        const page = parseInt(req.query.page) || 1;
        const size = parseInt(req.query.size) || 10;
        const search = req.query.search || '';

        connection = await getConnection(); // O oracledb.getConnection(...)

        // IMPORTANTE: Configurar oracledb para que devuelva los CLOB como Strings automáticamente
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

        // Procesar el cursor
        const resultSet = result.outBinds.p_cursor;
        const rows = await resultSet.getRows(); // Obtener todas las filas de la página actual
        const totalRecords = result.outBinds.p_total_recs;

        await resultSet.close(); // Siempre cerrar el ResultSet

        // Estructura de respuesta estándar
        res.status(200).json({
            ok: true,
            data: rows.map(row => ({
               
                audi_id: row[0],
                tabla: row[1],
                registro_id: row[2],
                operacion: row[3],
                dato_antiguo: row[4], // JSON texto
                dato_nuevo: row[5],   // JSON texto
                user_id: row[6],
                user_nombres: row[7],
                fecha: row[8]
        
            })),
            pagination: {
                page: page,
                size: size,
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
}

