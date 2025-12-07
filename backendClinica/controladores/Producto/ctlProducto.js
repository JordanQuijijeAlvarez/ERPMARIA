const { getConnection, oracledb } = require('../../configuracion/oraclePool');

// helper para convertir llaves a minúsculas
function formatearSalida(rows) {
    if (!rows || rows.length === 0) return [];
    return rows.map(obj => {
        const nuevo = {};
        Object.keys(obj).forEach(k => nuevo[k.toLowerCase()] = obj[k]);
        return nuevo;
    });
}

exports.getProductosEstado = async (req, res) => {
    const { estado } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM VW_PRODUCTO_DETALLE WHERE prod_estado = :estado`,
            { estado },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // Formatear claves a minúscula
        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });

    } finally {
        if (connection) await connection.close();
    }
};



exports.getProductos = async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM vw_producto_detalle`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json(formatearSalida(result.rows));

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.getProductoId = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `SELECT * FROM producto WHERE prod_id = :id`,
            { id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length > 0) {
            res.json(formatearSalida(result.rows)[0]);
        } else {
            res.status(404).json({ error: "NO EXISTE ESE PRODUCTO" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "ERROR EN EL SERVIDOR" });
    } finally {
        if (connection) await connection.close();
    }
};

exports.RegistrarProducto = async (req, res) => {
    const { subcat_id, prod_nombre, prod_codbarra,prod_descripcion,prod_preciocompra,prod_precioventa,prod_stock, prod_stockmin } = req.body;
    let connection;

    try {
        connection = await getConnection();

        const query = `BEGIN registrarProducto(:1, :2, :3, :4, :5, :6, :7, :8); END;`;

        const params = [
            subcat_id, prod_nombre, prod_codbarra,prod_descripcion,prod_preciocompra,prod_precioventa,prod_stock, prod_stockmin
        ];

        await connection.execute(query, params, { autoCommit: true });

        res.json({ message: "producto registrado" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.Actualizarproducto = async (req, res) => {
    const { prod_id, subcat_id,  prod_nombre, prod_codbarra, prod_descripcion,prod_preciocompra,prod_precioventa, prod_stock, prod_stockmin } = req.body;
    let connection;

    try {
        connection = await getConnection();

        const query = `BEGIN actualizarProducto(:1, :2, :3, :4, :5, :6, :7, :8, :9); END;`;

        const params = [
            prod_id, subcat_id, prod_nombre, prod_codbarra, prod_descripcion,prod_preciocompra,prod_precioventa, prod_stock, prod_stockmin
        ];

        await connection.execute(query, params, { autoCommit: true });

        res.json({ message: "producto actualizado" });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.eliminarproducto = async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
        connection = await getConnection();

        const query = `BEGIN eliminarProducto(:1); END;`;

        await connection.execute(query, [id], { autoCommit: true });

        res.json({ message: "producto eliminado correctamente" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};
