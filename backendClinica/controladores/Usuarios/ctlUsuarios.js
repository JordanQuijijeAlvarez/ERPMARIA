const { getConnection, oracledb } = require("../../configuracion/oraclePool");
const bcrypt = require('bcrypt');

// helper para convertir llaves a minúsculas
function formatearSalida(rows) {
  if (!rows || rows.length === 0) return [];
  return rows.map((obj) => {
    const nuevo = {};
    Object.keys(obj).forEach((k) => (nuevo[k.toLowerCase()] = obj[k]));
    return nuevo;
  });
}

function getAuthenticatedUserId(req) {
  const id = req?.user?.id;
  const parsed = Number(id);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

exports.getMe = async (req, res) => {
  let connection;

  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Token inválido (sin id de usuario).' });
    }

    connection = await getConnection();

    const result = await connection.execute(
      `
      SELECT
        user_id,
        user_nombres,
        user_apellidos,
        user_username,
        user_correo,
        user_estado,
        rol_nombre
      FROM VW_USUARIO_ROL
      WHERE user_id = :id
      `,
      { id: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(formatearSalida(result.rows)[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

exports.actualizarPerfil = async (req, res) => {
  let connection;

  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({ message: 'Token inválido (sin id de usuario).' });
    }

    const {
      user_nombres,
      user_apellidos,
      user_username,
      user_correo
    } = req.body ?? {};

    if (!user_nombres || !user_apellidos || !user_username || !user_correo) {
      return res.status(400).json({ message: 'Faltan campos requeridos para actualizar el perfil.' });
    }

    connection = await getConnection();

    await connection.execute(
      `
      UPDATE USUARIO
      SET
        user_nombres = :user_nombres,
        user_apellidos = :user_apellidos,
        user_username = :user_username,
        user_correo = :user_correo
      WHERE user_id = :user_id
      `,
      {
        user_id: userId,
        user_nombres,
        user_apellidos,
        user_username,
        user_correo
      },
      { autoCommit: true }
    );

    return res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    // ORA-00001: unique constraint violated (por ejemplo username único)
    if (error && typeof error.message === 'string' && error.message.includes('ORA-00001')) {
      return res.status(409).json({ message: 'El nombre de usuario ya existe. Intenta con otro.' });
    }

    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

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
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM VW_USUARIO_ROL WHERE user_id = :id`,
      { id: req.params.id },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(formatearSalida(result.rows)[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
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

    // Encriptar la contraseña antes de guardarla
    const contraseniaEncriptada = await bcrypt.hash(user_contrasenia, 10);

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
        user_contrasenia: contraseniaEncriptada,
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

    // Encriptar la contraseña antes de actualizarla
    const contraseniaEncriptada = await bcrypt.hash(user_contrasenia, 10);

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
        user_contrasenia: contraseniaEncriptada,
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

exports.activarUsuario = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    await connection.execute(
      `
      BEGIN
        activar_usuario(:user_id);
      END;
      `,
      { user_id: req.params.id }
    );

    res.json({ message: "Usuario activado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};