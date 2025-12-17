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
      `SELECT * FROM VW_USUARIO_ROL WHERE user_estado = :estado`,
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

exports.getUsuarioId = async (req, res) => {
};

exports.registrarUsuario = async (req, res) => {
  let connection;

  const {
    user_nombres,
    user_apellidos,
    user_username,
    user_contrasenia,
    user_correo,
    rol_id
  } = req.body;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        registrar_usuario(
          :user_nombres,
          :user_apellidos,
          :user_username,
          :user_contrasenia,
          :user_correo,
          :rol_id
        );
      END;
      `,
      {
        user_nombres,
        user_apellidos,
        user_username,
        user_contrasenia,
        user_correo,
        rol_id
      }
    );

    res.status(201).json({ message: "Usuario registrado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.actualizarUsuario = async (req, res) => {
  let connection;

  const {
    user_id,
    user_nombres,
    user_apellidos,
    user_username,
    user_contrasenia,
    user_correo
  } = req.body;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        actualizar_usuario(
          :user_id,
          :user_nombres,
          :user_apellidos,
          :user_username,
          :user_contrasenia,
          :user_correo
        );
      END;
      `,
      {
        user_id,
        user_nombres,
        user_apellidos,
        user_username,
        user_contrasenia,
        user_correo
      }
    );

    res.json({ message: "Usuario actualizado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.eliminarUsuario = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        eliminar_usuario(:user_id);
      END;
      `,
      { user_id: req.params.id }
    );

    res.json({ message: "Usuario eliminado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};