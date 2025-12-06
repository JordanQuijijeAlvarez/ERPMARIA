const poolsec = require('../../configuracion/dbmini');

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

exports.Registrarcompra = async (req, res) => {

    // 1. AHORA EXTRAEMOS TAMBIÉN "detalles" DEL BODY
    const { 
        local_id, 
        prove_id, 
        user_id, 
        fecha_hora, 
        monto, 
        iva, 
        estado_compra, 
        detalles // <--- Este es el array de productos: [{prod_id:1, cantidad:10...}, ...]
    } = req.body;

    // 2. CONVERTIMOS EL ARRAY A UN STRING JSON PARA QUE SQL LO ENTIENDA
    const detallesJson = JSON.stringify(detalles);

    // 3. CAMBIAMOS LA QUERY PARA LLAMAR A LA NUEVA FUNCIÓN QUE ACEPTA 8 PARÁMETROS
    // (Asumiendo que creaste la función 'registrar_compra_completa' como vimos antes)
    const query = 'SELECT registrar_compra_completa($1, $2, $3, $4, $5, $6, $7, $8) as respuesta;';

    // 4. AGREGAMOS EL JSON AL FINAL DEL ARRAY DE VALORES
    const values = [ 
        local_id, 
        prove_id, 
        user_id, 
        fecha_hora, 
        monto, 
        iva, 
        estado_compra, 
        detallesJson // <--- El $8
    ];

    console.log("Datos enviados a la BD:", values);

    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query, values);
        actor.release();

        // Si la función SQL devuelve un JSON con el resultado, lo enviamos al front
        // result.rows[0].respuesta contendrá lo que retorne tu función (ej: { status: 'OK', id: 105 })
        res.status(200).json(result.rows[0].respuesta); 
    
    } catch (error) {
        console.log(error);
        // Enviamos error.message para saber si la BD falló (ej: "Stock insuficiente")
        res.status(400).json({
            error: "No se pudo registrar la compra", 
            detalle: error.message 
        });
    }
};

exports.Actualizarcompra = async (req, res) => {

    const {
        compra_id, // Necesitamos el ID para saber cuál actualizar
        local_id,
        prove_id,
        user_id,
        fecha_hora,
        monto,
        iva,
        estado_compra,
        detalles // Array de productos modificados
    } = req.body;

    // 1. Convertimos el array de detalles a String JSON
    const detallesJson = JSON.stringify(detalles);

    // 2. Llamamos a la función SQL pasando el ID y el JSON al final
    // Nota: Asumo que la función recibirá 9 parámetros en total
    const query = 'SELECT actualizar_compra($1, $2, $3, $4, $5, $6, $7, $8, $9) as respuesta;';
    
    const values = [
        compra_id,     // $1
        local_id,      // $2
        prove_id,      // $3
        user_id,       // $4
        fecha_hora,    // $5
        monto,         // $6
        iva,           // $7
        estado_compra, // $8
        detallesJson   // $9 (El JSON con los items)
    ];

    console.log("Datos de actualización enviados:", values);

    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query, values);
        actor.release();

        // Devolvemos lo que responda la BD (ej: "Compra actualizada y stock recalculado")
        res.status(200).json(result.rows[0].respuesta); 
    
    } catch (error) {
        console.error(error);
        res.status(400).json({
            error: "No se pudo actualizar la compra", 
            detalle: error.message 
        });
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

