const poolsec = require('../../configuracion/dbmini');

exports.getProductosEstado = async (req, res) => {
     
    const {estado} = req.params;
    const query = 'SELECT * FROM listarProductosEstado($1)';
    const values = [estado]
    try {
        const result = await poolsec.query(query,values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getProductos = async (req, res) => {
     
    const query = 'SELECT * FROM producto;';
    try {
        const result = await poolsec.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProductoId = async (req, res) => {
   
    const {id} = req.params;
    const query ='select* from producto where codigo=$1'
    const values = [id]
    try {
        const result = await poolsec.query(query,values);
        
        if (result.rowCount>0){
            res.json(result.rows[0]);
        }else{
            res.status(400).json({error:"NO EXISTE ESE producto"});

        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"ERROR EN EL SERVIDOR"});

        
    }

    };

exports.RegistrarProducto = async (req, res) => {


    const {id_subcat,id_prov,nombre,descripcion,precioventa,stock,stock_min} = req.body;
    const query ='select registrarproducto( $1,$2,$3,$4,$5,$6,$7);';
    const values = [id_subcat,id_prov,nombre,descripcion,precioventa,stock,stock_min];

    console.log(values);
    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query,values);
        actor.release();
        res.status(200).json({message:'producto registrado'});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:"No se pudo registar al producto"});

        
    }
};

exports.Actualizarproducto = async (req, res) => {

    const {id_prod,id_subcat,id_prov,nombre,descripcion,precioventa,stock,stock_min} = req.body;
    const query ='select actualizarproducto( $1,$2,$3,$4,$5,$6,$7,$8);';
    const values = [id_prod,id_subcat,id_prov,nombre,descripcion,precioventa,stock,stock_min];
    console.log(values);
    try {
        const actor = await poolsec.connect();
        const result = await poolsec.query(query,values);
        actor.release();
        res.status(200).json({message:'producto actualizado '});
    
    } catch (error) {
        console.log(error);
        res.status(400).json({error:error.message});
    
        
    }
    };


exports.eliminarproducto = async (req, res) => {

    const {id} = req.params;
        const query ='select from eliminarproducto($1);'
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

