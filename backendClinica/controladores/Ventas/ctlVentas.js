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



exports.getComprasEstado = async (req, res) => {
     
    const {estado} = req.params;
    const query = 'SELECT * FROM listarComprasEstado($1)';
    const values = [estado]
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getCompras = async (req, res) => {
     
    const query = 'SELECT * FROM compra;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getcompraId = async (req, res) => {
    const {id} = req.params;
    
    // CAMBIO: Usamos la función que trae todo junto
    const query ='SELECT * FROM obtener_compra_full($1)'; 
    const values = [id];

    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount > 0){
            // result.rows[0] tendrá { datos_compra: {...}, items: [...] }
            res.json(result.rows[0]); 
        } else {
            res.status(400).json({error:"NO EXISTE ESA COMPRA"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};


exports.Registrarventa = async (req, res) => {

  const {
    local_id,
    cliente_id,
    user_id,
    venta_iva,
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
            const encabeformateado = formatearSalida(result.rows)[0];
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




exports.eliminarcompra = async (req, res) => {

    const { id } = req.params;
    
    // Corregido: Quitamos el "FROM" que sobraba y usamos alias para la respuesta
    const query = 'SELECT eliminar_compra($1) as respuesta;';
    const values = [id];

    console.log("ID a eliminar/anular:", values);

    try {
        const actor = await poolsec.connect();
        
        // Usamos await puro, sin callback function
        const result = await actor.query(query, values);
        actor.release();

        // Verificamos qué devolvió la base de datos
        // La función SQL debería retornar un JSON o texto confirmando la anulación
        const respuestaBD = result.rows[0].respuesta;

        if (respuestaBD) {
            res.status(200).json({ message: "Proceso completado", db_response: respuestaBD });
        } else {
            res.status(404).json({ error: "No se encontró el registro o ya estaba anulado" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Error en el servidor al eliminar", 
            detalle: error.message 
        });
    }
};

