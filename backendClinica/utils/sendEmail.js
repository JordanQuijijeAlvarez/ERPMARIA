const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // o tu proveedor SMTP
  auth: {
    user: process.env.EMAIL_USER, // <- CORRECTO
    pass: process.env.EMAIL_PASS
  },
   tls: {
    rejectUnauthorized: false // << Esto desactiva la validación del certificado
  }
});

const sendOTPEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: `"Sistema de Clínica" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Código de verificación - 2FA',
    html: `<p>Tu código de verificación es: <b>${otpCode}</b>. Tiene una validez de 5 minutos.</p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTPEmail };
