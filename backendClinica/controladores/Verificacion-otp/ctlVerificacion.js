
const pool = require('../../configuracion/db');
const { sendOTPEmail } = require('../../utils/sendEmail');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SessionManager = require('../../middleware/sessionManager');

function generarCodigoOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos
}



exports.validarOTP = async (req, res) => {
  const { codigo_usuario, codigo_otp } = req.body;

  try {
    const resultado = await pool.query(
      `SELECT * FROM verificacion_2pasos
       WHERE codigo_usuario = $1 AND codigo_otp = $2 AND expirado = false
       ORDER BY creado_en DESC LIMIT 1`,
      [codigo_usuario, codigo_otp]
    );

    const registro = resultado.rows[0];

    if (!registro) {
      return res.status(401).json({ mensaje: 'Código incorrecto o expirado' });
    }

    // Marcar OTP como usado
    await pool.query(`UPDATE verificacion_2pasos SET expirado = true WHERE id = $1`, [registro.id]);

    // Obtener datos del usuario para generar el token
    const resultUser = await pool.query(
      `SELECT 
        u.codigo AS id_usuario, 
        u.nombre_usuario,
        r.nombre AS rol,
        m.codigo AS codigo_medico,
        m.nombre as nombre_medico,
        m.apellido as apellido_medico
      FROM usuario u
      JOIN rol r ON u.codigo_rol = r.codigo
      LEFT JOIN medico m ON u.codigo = m.codigo_usuario
      WHERE u.codigo = $1`,
      [codigo_usuario]
    );

    const usuario = resultUser.rows[0];

    // 1. Generar jti único
    const tokenJti = crypto.randomUUID();

    // 2. Crear el JWT incluyendo el jti
    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        nombreUsuario: usuario.nombre_usuario,
        rol: usuario.rol,
        codigoMedico: usuario.codigo_medico,
        nombresMedico: usuario.nombre_medico ? `Dr. ${usuario.nombre_medico} ${usuario.apellido_medico}` : null,
        jti: tokenJti,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 3. Obtener info del dispositivo
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const deviceFingerprint = SessionManager.generateDeviceFingerprint(userAgent, ipAddress);

    // 4. Crear sesión activa
    const sessionResult = await SessionManager.createSession(usuario.id_usuario, tokenJti, {
      userAgent,
      ipAddress,
      fingerprint: deviceFingerprint
    });

    if (!sessionResult.success) {
      return res.status(500).json({ mensaje: 'Error creando sesión de usuario' });
    }

    return res.json({ mensaje: 'Verificación 2FA exitosa', token });

  } catch (error) {
    console.error('Error al validar OTP:', error);
    return res.status(500).json({ mensaje: 'Error del servidor' });
  }
};

// Método para reenviar OTP (útil si el usuario no recibió el código)
exports.reenviarOTP = async (req, res) => {
  const { usuario_codigo } = req.body;

  try {
    // Verificar que el usuario existe
    const resultado = await pool.query(
      'SELECT email FROM usuario WHERE codigo = $1 AND estado = true',
      [usuario_codigo]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        mensaje: 'Usuario no encontrado' 
      });
    }

    const usuario = resultado.rows[0];

    // Invalidar códigos anteriores
    await pool.query(
      'UPDATE verificacion_2pasos SET expirado = true WHERE codigo_usuario = $1',
      [usuario_codigo]
    );

    // Generar nuevo código
    const codigoOTP = generarCodigoOTP();
    await pool.query(
      'INSERT INTO verificacion_2pasos (codigo_usuario, codigo_otp) VALUES ($1, $2)',
      [usuario_codigo, codigoOTP]
    );

    await sendOTPEmail(usuario.email, codigoOTP);

    return res.json({ 
      success: true,
      mensaje: 'Nuevo código OTP enviado al correo' 
    });
  } catch (error) {
    console.error('Error en reenviarOTP:', error);
    res.status(500).json({ 
      success: false,
      mensaje: 'Error del servidor' 
    });
  }
};



