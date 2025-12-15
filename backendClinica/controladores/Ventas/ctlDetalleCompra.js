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
    const query ='select* from compra where compra_id=$1'
    const values = [id]
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount>0){
            res.json(result.rows[0]);
        }else{
            res.status(400).json({error:"NO EXISTE ESE compra"});

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});

        
    }

    };

exports.Registrarcompra = async (req, res) => {


    const {local_id,prove_id,user_id,fecha_hora,monto,iva,estado_compra} = req.body;
    const query ='select registrarcompra( $1,$2,$3,$4,$5,$6,$7);';
    const values = [ local_id,prove_id,user_id,fecha_hora,monto,iva,estado_compra];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query,values);
        actor.release();
        res.status(200).json({message:'compra registrada'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registar al compra"});

        
    }
};

exports.Actualizarcompra = async (req, res) => {

    const {local_id,prove_id,user_id,fecha_hora,monto,iva,estado_compra} = req.body;
    const query ='select actualizarcompra( $1,$2,$3,$4,$5,$6,$7);';
    const values = [local_id,prove_id,user_id,fecha_hora,monto,iva,estado_compra];
    console.log(values);
    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query,values);
        actor.release();
        res.status(200).json({message:'compra actualizada '});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:error.message});
    
        
    }
    };


exports.eliminarcompra = async (req, res) => {

    const {id} = req.params;
        const query ='select from eliminarCompra($1);'
        const values = [id]
    
        console.log(values);
        try {
            const actor = await poolsec.connect();
            const result = await poolsec.query(query,values,(error,result)=>{
    
                if (error){
                    res.status(400).json({error: error.message});
    
                }else{
                    res.status(200).json({message:"El registro se elimino correctamente"});
                }
    
            });
            actor.release();
            
        } catch (error) {
            console.log(error);
            res.status(500).json({error:"ERROR EN EL SERVIDOR"});
    
            
        }
    };

