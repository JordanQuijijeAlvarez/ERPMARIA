const pool = require('../../configuracion/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const SessionManager = require('../../middleware/sessionManager');
const { sendOTPEmail } = require('../../utils/sendEmail');
const { getConnection, oracledb } = require('../../configuracion/oraclePool');


// Función auxiliar para generar código OTP
function generarCodigoOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}

// Función auxiliar para verificar 2FA con Google Authenticator
async function verificar2FAUsuario(connection, userId, token2FA) {
  const result = await connection.execute(
    `SELECT secret_2fa, enabled, last_used_code, last_used_at FROM USUARIO_2FA WHERE usuario_id = :id`,
    { id: userId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  if (result.rows.length === 0 || result.rows[0].ENABLED !== 1) {
    return { required: false, valid: true }; // 2FA no está habilitado
  }

  if (!token2FA) {
    return { required: true, valid: false }; // 2FA requerido pero no proporcionado
  }

  const record = result.rows[0];

  // Verificar si el código ya fue usado recientemente (últimos 90 segundos)
  if (record.LAST_USED_CODE === token2FA && record.LAST_USED_AT) {
    const lastUsedTime = new Date(record.LAST_USED_AT).getTime();
    const now = Date.now();
    const timeDiff = (now - lastUsedTime) / 1000; // diferencia en segundos

    if (timeDiff < 90) {
      console.log(`Código 2FA reutilizado. Usado hace ${timeDiff.toFixed(0)} segundos`);
      return { required: true, valid: false }; // Código ya usado
    }
  }

  // Verificar el código TOTP (reducido window a 1 para mayor seguridad)
  const verified = speakeasy.totp.verify({
    secret: record.SECRET_2FA,
    encoding: 'base32',
    token: token2FA,
    window: 1 // Solo permite 1 período antes/después (60 segundos total)
  });

  if (verified) {
    // Guardar el código usado para prevenir reutilización
    await connection.execute(
      `UPDATE USUARIO_2FA 
       SET last_used_code = :code, last_used_at = CURRENT_TIMESTAMP 
       WHERE usuario_id = :id`,
      { code: token2FA, id: userId },
      { autoCommit: true }
    );
  }

  return { required: true, valid: verified };
}

exports.validacionUsers = async (req, res) => {
  const { nombre_usuario, contrasenia, codigo_otp } = req.body;

  // Validación básica
  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({
      success: false,
      message: 'Nombre de usuario y contraseña son requeridos'
    });
  }

  // Query para obtener datos del usuario incluyendo email
  const query = `
    SELECT 
      u.codigo AS id_usuario, 
      u.nombre_usuario,
      u.contrasenia,
      u.email,
      r.nombre AS rol,
      m.codigo AS codigo_medico,
      m.nombre as nombre_medico,
      m.apellido as apellido_medico
    FROM usuario u
    JOIN rol r ON u.codigo_rol = r.codigo
    LEFT JOIN medico m ON u.codigo = m.codigo_usuario
    WHERE u.nombre_usuario = $1
      AND u.estado = true;
  `;
  const values = [nombre_usuario];

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = result.rows[0];
    const contraseñaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);

    if (!contraseñaValida) {
      console.log('Contraseña incorrecta');

      return res.status(401).json({
        success: false,
        message: 'Contraseña Incorrecta'
      });



    }

    // Si no se proporciona código OTP, enviar uno y solicitar verificación
    if (!codigo_otp) {
      try {
        const codigoOTP = generarCodigoOTP();
        await pool.query(
          'INSERT INTO verificacion_2pasos (codigo_usuario, codigo_otp) VALUES ($1, $2)',
          [usuario.id_usuario, codigoOTP]
        );

        await sendOTPEmail(usuario.email, codigoOTP);

        return res.json({
          success: true,
          requiresOTP: true,
          message: 'Código OTP enviado al correo',
          usuario_codigo: usuario.id_usuario
        });
      } catch (otpError) {
        console.error('Error enviando OTP:', otpError);
        return res.status(500).json({
          success: false,
          message: 'Error enviando código de verificación'
        });
      }
    }

    // Si se proporciona código OTP, validarlo
    const otpResult = await pool.query(
      `	   SELECT * FROM verificacion_2pasos
       WHERE codigo_usuario = $1 AND codigo_otp = $2 AND expirado = false
       ORDER BY creado_en DESC LIMIT 1`,
      [usuario.id_usuario, codigo_otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Código OTP incorrecto o expirado'
      });
    }

    // Marcar OTP como usado
    await pool.query(
      `UPDATE verificacion_2pasos SET expirado = true WHERE id = $1`,
      [otpResult.rows[0].id]
    );

    // Generar ID único para el token (JWT ID)
    const tokenJti = crypto.randomUUID();

    // Crear el JWT incluyendo el código del médico y jti
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        nombreUsuario: usuario.nombre_usuario,
        rol: usuario.rol,
        codigoMedico: usuario.codigo_medico,
        nombresMedico: usuario.nombre_medico ? 'Dr.' + usuario.nombre_medico + ' ' + usuario.apellido_medico : null,
        jti: tokenJti, // JWT ID único para esta sesión
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Obtener información del dispositivo para fingerprinting
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const deviceFingerprint = SessionManager.generateDeviceFingerprint(userAgent, ipAddress);

    console.log('Fingerprint generado:', deviceFingerprint);
    // Crear sesión activa
    const sessionResult = await SessionManager.createSession(usuario.id_usuario, tokenJti, {
      userAgent,
      ipAddress,
      fingerprint: deviceFingerprint
    });

    if (!sessionResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error creando sesión de usuario'
      });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id_usuario,
        nombreUsuario: usuario.nombre_usuario,
        rol: usuario.rol,
        codigoMedico: usuario.codigo_medico,
        nombresMedico: usuario.nombre_medico ? 'Dr.' + usuario.nombre_medico + ' ' + usuario.apellido_medico : null
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Nuevo método para logout
exports.logout = async (req, res) => {
  try {
    // Obtener token del header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        // Decodificar token para obtener el jti
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.jti) {
          // Invalidar la sesión específica
          await SessionManager.invalidateSession(decoded.jti);
        }
      } catch (jwtError) {
        // Si el token ya expiró o es inválido, aún respondemos exitosamente
        console.log('Token ya inválido en logout:', jwtError.message);
      }
    }

    res.json({
      success: true,
      message: 'Logout exitoso'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error durante el logout'
    });
  }
};

// Método para obtener sesiones activas del usuario
exports.getSesionesActivas = async (req, res) => {
  try {
    const userId = req.user.id; // Del middleware de autenticación
    const sesiones = await SessionManager.getUserActiveSessions(userId);

    res.json({
      success: true,
      sesiones
    });

  } catch (error) {
    console.error('Error obteniendo sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo sesiones activas'
    });
  }
};

// Método para invalidar todas las otras sesiones
exports.invalidarOtrasSesiones = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentTokenJti = req.user.jti;

    const invalidatedCount = await SessionManager.invalidateAllUserSessions(userId, currentTokenJti);

    res.json({
      success: true,
      message: `${invalidatedCount} sesiones invalidadas`,
      invalidatedCount
    });

  } catch (error) {
    console.error('Error invalidando sesiones:', error);
    res.status(500).json({
      success: false,
      message: 'Error invalidando otras sesiones'
    });
  }



};



exports.obtenerCorreo = async (req, res) => {
  const { nombreUsuario } = req.body;
  console.log(nombreUsuario);
  const query = `
    SELECT u.email
    FROM usuario u
    WHERE u.nombre_usuario = $1
      AND u.estado = true;
  `;
  const values = [nombreUsuario];

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const correo = result.rows[0].email;
    const oculto = correo.replace(/(.{4}).+(@.+)/, '$1********$2');

    res.json({ correoOculto: oculto });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

const codigos = new Map();



const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'clinicacomunitariautm@gmail.com',
    pass: 'tvaxrtljvgympqpj'
  },

  tls: {
    rejectUnauthorized: false
  }
});

const enviarCorreo = async (para, asunto, mensaje) => {
  const opciones = {
    from: 'clinicacomunitariautm@gmail.com',
    to: para,
    subject: asunto,
    text: mensaje
  };

  await transporter.sendMail(opciones);
};



exports.enviarCodigo = async (req, res) => {
  const { nombreUsuario } = req.body;

  const query = `
    SELECT u.email
    FROM usuario u
    WHERE u.nombre_usuario = $1
      AND u.estado = true;
  `;
  const values = [nombreUsuario];

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const correo = result.rows[0].email;
    const codigo = Math.floor(1000 + Math.random() * 9000).toString();

    codigos.set(nombreUsuario, codigo);

    await enviarCorreo(correo, 'Código de recuperación', `Tu código es: ${codigo}`);

    res.json({ mensaje: 'Código enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};


exports.cambiarContrasenia = async (req, res) => {
  const { nombreUsuario, nuevoPassword, codigoIngresado } = req.body;

  const codigoGuardado = codigos.get(nombreUsuario);

  if (!codigoGuardado) {
    return res.status(400).json({ mensaje: 'No se ha enviado un código para este usuario' });
  }

  if (codigoIngresado !== codigoGuardado) {
    return res.status(401).json({ mensaje: 'Código incorrecto' });
  }

  try {

    const query = `
     select cambiar_contrasenia_usuario($1, $2);
    `;
    const values = [nombreUsuario, nuevoPassword];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }
    codigos.delete(nombreUsuario);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};




/////////////////////
exports.validacionProvUsers = async (req, res) => {
  const { nombre_usuario, contrasenia, token2fa } = req.body;
  const userAgenty = req.headers['user-agent'] || 'Desconocido';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!nombre_usuario || !contrasenia) {
    return res.status(400).json({
      success: false,
      message: 'Nombre de usuario y contraseña son requeridos'
    });
  }

  let connection;
  try {
    connection = await getConnection();

    const query = `
    SELECT 
          u.user_id          AS id_usuario,
          u.user_username    AS nombre_usuario,
          u.user_contrasenia AS contrasenia,
          r.rol_nombre       AS rol
        FROM USUARIO u
        JOIN USUARIO_ROL ur ON u.user_id = ur.user_id
        JOIN ROL r ON ur.rol_id = r.rol_id
        WHERE u.user_username = :username
          AND u.user_estado = 1
    `;

    const result = await connection.execute(
      query,
      { username: nombre_usuario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuario = result.rows[0];

    const contraseñaValida = await bcrypt.compare(contrasenia, usuario.CONTRASENIA);
    if (!contraseñaValida) {

      await registrarFallo(ip, usuario, userAgenty, 'Credenciales inválidas');
      return res.status(401).json({
        success: false,
        message: 'Contraseña Incorrecta'
      });
    }

    // Verificar 2FA
    const verificacion2FA = await verificar2FAUsuario(connection, usuario.ID_USUARIO, token2fa);

    if (verificacion2FA.required && !verificacion2FA.valid) {
      await registrarFallo(ip, usuario, userAgenty, 'Credenciales inválidas: Código 2FA inválido');

      return res.status(401).json({
        success: false,
        requires2FA: true,
        message: token2fa ? 'Código 2FA inválido' : 'Código 2FA requerido',
        userId: usuario.ID_USUARIO
      });
    }

    const tokenJti = crypto.randomUUID();

    const token = jwt.sign(
      {
        id: usuario.ID_USUARIO,
        nombreUsuario: usuario.NOMBRE_USUARIO,
        rol: usuario.ROL,
        jti: tokenJti,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const deviceFingerprint = SessionManager.generateDeviceFingerprint(userAgent, ipAddress);

    console.log('Fingerprint generado:', deviceFingerprint);
    const sessionResult = await SessionManager.createSession(usuario.ID_USUARIO, tokenJti, {
      userAgent,
      ipAddress,
      fingerprint: deviceFingerprint
    });

    if (!sessionResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error creando sesión de usuario'
      });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.ID_USUARIO,
        nombreUsuario: usuario.NOMBRE_USUARIO,
        rol: usuario.ROL,
      }
    });

  } catch (error) {


    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { console.error('Error cerrando conexión:', e); }
    }
  }

  

};
async function registrarFallo(ip, usuario, agent, motivo) {
    let connection;

    try {
        // 1. Sanitización del Usuario: 
        // Si 'usuario' es un objeto (porque encontraste el usuario pero la pass estaba mal), extrae el nombre.
        // Si 'usuario' es un texto (porque el usuario no existe), úsalo tal cual.
        let nombreUsuarioStr = 'Desconocido';

        if (usuario && typeof usuario === 'object') {
            // Intenta sacar el nombre de las propiedades comunes
            nombreUsuarioStr = usuario.NOMBRE_USUARIO || usuario.user_nombres || JSON.stringify(usuario);
        } else if (usuario) {
            nombreUsuarioStr = String(usuario);
        }

        connection = await getConnection();

        const query = `BEGIN SP_REGISTRAR_FALLO(:1, :2, :3, :4); END;`;

        const params = [
            ip || 'IP Desconocida',
            nombreUsuarioStr,          // <--- AQUI YA VA SOLO EL TEXTO
            agent || 'Sin User-Agent',
            motivo || 'Error no especificado'
        ];

        // console.log("Guardando fallo con params:", params); // Descomenta si quieres verificar

        await connection.execute(query, params, { autoCommit: true });

    } catch (e) {
        console.error("Error crítico: No se pudo registrar log de fallo en BD", e);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error cerrando conexión de log", err);
            }
        }
    }
}