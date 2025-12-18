const { getConnection, oracledb } = require("../../configuracion/oraclePool");

// helper para convertir llaves a minúsculas
function formatearSalida(rows) {
  if (!rows || rows.length === 0) return [];
  return rows.map((obj) => {
    const nuevo = {};
    Object.keys(obj).forEach((k) => (nuevo[k.toLowerCase()] = obj[k]));
    return nuevo;
  });
}

exports.getRolesEstado = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM rol WHERE rol_estado = :estado`,
      { estado: req.query.estado },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(formatearSalida(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.getRolId = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM rol WHERE rol_id = :id AND rol_estado = 1`,
      { id: req.query.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    res.json(formatearSalida(result.rows)[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.cambiarRolUsuario = async (req, res) => {
  let connection;

  const { user_id, rol_id } = req.body;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        cambiar_rol_usuario(
          :user_id,
          :rol_id
        );
      END;
      `,
      {
        user_id,
        rol_id
      }
    );

    res.json({ message: "Rol del usuario actualizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};
