const poolsec = require('../../configuracion/dbmini');
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

exports.Registrarventa = async (req, res) => {

  const {
    local_id,
    cliente_id,
    user_id,
    venta_iva,
    venta_subiva,
    venta_total,
    venta_descripcion,
    detalle_venta
  } = req.body;

  // Convertir detalles a JSON string
  const detallesJson = JSON.stringify(detalle_venta);

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        REGISTRAR_VENTA_COMPLETA(
          :p_local_id,
          :p_cliente_id,
          :p_user_id,
          :p_monto,
          :p_iva,
          :p_subiva,
          :p_descripcion,
          :p_detalles_json,
          :p_respuesta
        );
      END;
      `,
      {
        p_local_id: local_id,
        p_cliente_id: cliente_id,
        p_user_id: user_id,
        p_monto: venta_total,
        p_iva: venta_iva,
        p_subiva:venta_subiva,
        p_descripcion: venta_descripcion,
        p_detalles_json: detallesJson,
        p_respuesta: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
      }
    );

    const clob = result.outBinds.p_respuesta;

    let respuesta = '';

    if (clob) {
      respuesta = await clob.getData();
    }

    res.status(200).json(JSON.parse(respuesta));

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      mensaje: 'No se pudo registrar la venta',
      detalle: error.message
    });

  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};

exports.getEncabVentaEstado= async (req, res) => {
   const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM VW_VENTAS WHERE venta_estadoregistro = :estado`,
            [estado],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            const encabeformateado = formatearSalida(result.rows);
            res.json(encabeformateado);
        } else {
            res.status(400).json({ error: "NO EXISTE LA FACTURA" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};

exports.getDetalleVenta = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT * FROM VW_DETALLE_VENTA WHERE venta_id = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            const detalleFormateado = formatearSalida(result.rows);
            res.json(detalleFormateado);   
        } else {
            res.status(404).json({ error: "NO EXISTE LA FACTURA" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};


// Controlador de Ventas (ventas.controller.js)

// Asegúrate de tener estas importaciones arriba (como ya las tienes)
// const { getConnection, oracledb } = require('../../configuracion/oraclePool');
// const { formatearSalida } = require('./tu_archivo_de_helpers'); // O si está en el mismo archivo

exports.ObtenerVentaPorId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        // 1. Consultamos la VISTA creada en Oracle
        const result = await connection.execute(
            `SELECT * FROM VW_VENTA_COMPLETA WHERE venta_id = :id`,
            [id],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // 2. Si no hay filas, la venta no existe o no tiene detalles
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                status: 'ERROR',
                mensaje: 'Venta no encontrada o sin detalles' 
            });
        }

        // 3. Convertimos las keys a minúsculas usando tu helper
        // Oracle devuelve: [{ VENTA_ID: 1, PROD_NOMBRE: 'X' }, ...]
        // formatearSalida devuelve: [{ venta_id: 1, prod_nombre: 'x' }, ...]
        const filasFormateadas = formatearSalida(result.rows);

        // 4. TRANSFORMACIÓN DE DATOS (FLAT -> NESTED)
        // Tomamos los datos de cabecera de la PRIMERA fila (fila 0)
        const cabecera = filasFormateadas[0];

        const ventaRespuesta = {
            // Datos generales
            venta_id: cabecera.venta_id,
            venta_horafecha: cabecera.venta_horafecha,
            venta_subiva: cabecera.venta_subiva,
            venta_iva: cabecera.venta_iva,
            venta_total: cabecera.venta_total,
            venta_descripcion: cabecera.venta_descripcion,

            // Datos del Cliente (planos para facilitar al front)
            cliente_id: cabecera.cliente_id,
            cliente_cedula: cabecera.cliente_cedula,
            cliente_nombres: cabecera.cliente_nombres, // Viene concatenado de la vista
            cliente_direccion: cabecera.cliente_direccion,

            // Datos de Detalles (Array mapeado)
            detalle_venta: filasFormateadas.map(row => ({
                detv_id: row.detv_id,
                prod_id: row.prod_id,
                prod_codbarra: row.prod_codbarra,
                prod_nombre: row.prod_nombre,
                // Si tienes precio en detalle úsalo, si no usa el de producto
                detv_precio_unitario: row.detv_precio_unitario, 
                detv_cantidad: row.detv_cantidad,
                detv_subtotal: row.detv_subtotal,
                detv_estado: row.detv_estado
            }))
        };

        // 5. Enviamos el JSON estructurado
        res.status(200).json(ventaRespuesta);

    } catch (error) {
        console.error('Error en ObtenerVentaPorId:', error);
        res.status(500).json({
            status: 'ERROR',
            mensaje: 'Error al obtener la información de la venta',
            detalle: error.message
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { console.error(e); }
        }
    }



};

exports.ActualizarVenta = async (req, res) => {

  // 1. Obtenemos el ID de la venta a editar desde la URL
  const { id } = req.params;

  // 2. Obtenemos los datos del cuerpo (igual que en registrar)
  const {
    local_id,
    cliente_id,
    user_id,
    venta_iva,
    venta_subiva,
    venta_total,
    venta_descripcion,
    detalle_venta
  } = req.body;

  // Convertir detalles a JSON string
  const detallesJson = JSON.stringify(detalle_venta);

  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        ACTUALIZAR_VENTA_COMPLETA(
          :p_venta_id,        -- Nuevo parámetro obligatorio
          :p_local_id,
          :p_cliente_id,
          :p_user_id,
          :p_monto,
          :p_iva,
          :p_subiva,
          :p_descripcion,
          :p_detalles_json,
          :p_respuesta
        );
      END;
      `,
      {
        p_venta_id: id,       // Aquí pasamos el ID de la URL
        p_local_id: local_id,
        p_cliente_id: cliente_id,
        p_user_id: user_id,
        p_monto: venta_total,
        p_iva: venta_iva,
        p_subiva: venta_subiva,
        p_descripcion: venta_descripcion,
        p_detalles_json: detallesJson,
        p_respuesta: { type: oracledb.CLOB, dir: oracledb.BIND_OUT }
      }
    );

    const clob = result.outBinds.p_respuesta;

    let respuesta = '';

    if (clob) {
      respuesta = await clob.getData();
    }

    // Parseamos la respuesta para ver si Oracle devolvió un error lógico
    const jsonRespuesta = JSON.parse(respuesta);

    if (jsonRespuesta.status === 'ERROR') {
         return res.status(400).json(jsonRespuesta);
    }

    res.status(200).json(jsonRespuesta);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: 'ERROR',
      mensaje: 'No se pudo actualizar la venta',
      detalle: error.message
    });

  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) {}
    }
  }
};


exports.AnularVenta = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();
        const query = `BEGIN anularventa(:1); END;`;
        
        await connection.execute(query, [id], { autoCommit: true });
        
        res.status(200).json({ message: "El registro se anulo correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR", detalle: error.message });
    } finally {
        if (connection) await connection.close();
    }
};