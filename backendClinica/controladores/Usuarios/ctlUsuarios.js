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

exports.getUsuariosEstado = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM usuario WHERE user_estado = :estado`,
      { estado: 1 },
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

exports.getUsuarioId = async (req, res) => {};

exports.registrarUsuario = async (req, res) => {};

exports.actualizarUsuario = async (req, res) => {};

exports.eliminarUsuario = async (req, res) => {};
