const poolsec = require('../../configuracion/dbmini');

// LISTAR POR ESTADO
exports.getProveedoresEstado = async (req, res) => {
    const {estado} = req.params;
    // Llamada a la función que retorna tabla
    const query = 'SELECT * FROM listarproveedoresestado($1)';
    const values = [estado];
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LISTAR TODOS (TABLA PURA)
exports.getProveedores = async (req, res) => {
    const query = 'SELECT * FROM proveedor;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// OBTENER POR ID
exports.getproveedorId = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: La columna es 'prove_id', no 'codigo'
    const query ='SELECT * FROM proveedor WHERE prove_id = $1';
    const values = [id];
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount > 0){
            res.json(result.rows[0]);
        } else {
            res.status(400).json({error:"NO EXISTE ESE PROVEEDOR"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};

// REGISTRAR
exports.RegistrarProveedor = async (req, res) => {
    const {ruc, nombre, telefono, direccion, descripcion} = req.body;
    const query ='SELECT registrarproveedor($1, $2, $3, $4, $5);';
    const values = [ruc, nombre, telefono, direccion, descripcion];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'proveedor registrado'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registrar al proveedor"});
    }
};

// ACTUALIZAR
exports.ActualizarProveedor = async (req, res) => {
    // CORRECCIÓN: Asegúrate de enviar el id_prov desde el front
    const {id_prov, ruc, nombre, telefono, direccion, descripcion} = req.body;
    
    const query ='SELECT actualizarproveedor($1, $2, $3, $4, $5, $6);';
    const values = [id_prov, ruc, nombre, telefono, direccion, descripcion];
    
    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query,values);
        actor.release();
        res.status(200).json({message:'proveedor actualizado'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
};

// ELIMINAR (LÓGICO)
exports.eliminarProveedor = async (req, res) => {
    const {id} = req.params;
    // CORRECCIÓN: Sintaxis correcta y sin callbacks
    const query ='SELECT eliminarproveedor($1);';
    const values = [id];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        await actor.query(query, values);
        actor.release();
        
        res.status(200).json({message:"El registro se eliminó correctamente"});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    }
};