const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { getConnection, oracledb } = require('../../configuracion/oraclePool');

/**
 * Generar QR para configurar 2FA
 * El usuario debe escanear el QR con Google Authenticator
 */
exports.setup2FA = async (req, res) => {
  const { userId } = req.body;
  console.log('Setup 2FA - userId recibido:', userId);

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario requerido'
    });
  }

  let connection;
  try {
    connection = await getConnection();
    console.log('Conexión obtenida exitosamente');

    // Verificar que el usuario existe
    const userCheck = await connection.execute(
      `SELECT user_username FROM USUARIO WHERE user_id = :id AND user_estado = 1`,
      { id: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = userCheck.rows[0];

    // Generar secreto para 2FA
    const secret = speakeasy.generateSecret({
      name: `ERPMARIA (${usuario.USER_USERNAME})`,
      length: 32
    });

    // Guardar o actualizar secreto en BD (aún no habilitado)
    await connection.execute(
      `MERGE INTO USUARIO_2FA u2fa
       USING (SELECT :userId AS usuario_id FROM DUAL) src
       ON (u2fa.usuario_id = src.usuario_id)
       WHEN MATCHED THEN
         UPDATE SET u2fa.secret_2fa = :secret, u2fa.enabled = 0, u2fa.updated_at = CURRENT_TIMESTAMP
       WHEN NOT MATCHED THEN
         INSERT (usuario_id, secret_2fa, enabled)
         VALUES (:userId, :secret, 0)`,
      { userId, secret: secret.base32 },
      { autoCommit: true }
    );

    // Generar código QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      qrCode: qrCodeUrl,
      secret: secret.base32,
      message: 'Escanea el código QR con Google Authenticator y verifica el código generado'
    });

  } catch (error) {
    console.error('Error configurando 2FA:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error configurando autenticación de dos factores',
      error: error.message
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error cerrando conexión:', e); }
    }
  }
};

/**
 * Verificar código 2FA y activar la autenticación
 */
exports.verify2FA = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario y código requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Obtener secreto del usuario
    const result = await connection.execute(
      `SELECT secret_2fa FROM USUARIO_2FA WHERE usuario_id = :id`,
      { id: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0 || !result.rows[0].SECRET_2FA) {
      return res.status(404).json({
        success: false,
        message: '2FA no configurado para este usuario. Configure primero el 2FA.'
      });
    }

    const secret = result.rows[0].SECRET_2FA;

    // Verificar código
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Permite códigos anteriores/siguientes por diferencia horaria
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Código de verificación inválido. Verifica que el código sea correcto.'
      });
    }

    // Activar 2FA
    await connection.execute(
      `UPDATE USUARIO_2FA SET enabled = 1, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = :id`,
      { id: userId },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: 'Autenticación de dos factores activada exitosamente'
    });

  } catch (error) {
    console.error('Error verificando 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando código 2FA'
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error cerrando conexión:', e); }
    }
  }
};

/**
 * Desactivar 2FA para un usuario
 */
exports.disable2FA = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario requerido'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Desactivar y eliminar secreto
    await connection.execute(
      `UPDATE USUARIO_2FA SET enabled = 0, secret_2fa = NULL, updated_at = CURRENT_TIMESTAMP WHERE usuario_id = :id`,
      { id: userId },
      { autoCommit: true }
    );

    res.json({
      success: true,
      message: '2FA desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error desactivando 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error desactivando 2FA'
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error cerrando conexión:', e); }
    }
  }
};

/**
 * Verificar si un usuario tiene 2FA habilitado
 */
exports.check2FAStatus = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'ID de usuario requerido'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT enabled FROM USUARIO_2FA WHERE usuario_id = :id`,
      { id: userId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const enabled = result.rows.length > 0 && result.rows[0].ENABLED === 1;

    res.json({
      success: true,
      enabled: enabled
    });

  } catch (error) {
    console.error('Error verificando estado 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado 2FA'
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error cerrando conexión:', e); }
    }
  }
};
