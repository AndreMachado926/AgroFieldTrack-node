const Users = require("../models/UsersModel"); // <--- importa teu modelo User
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jwtkey = 'jkdoamnwpa';
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Seawatchletsgo@gmail.com',
    pass: 'jxzs eafr vyrg yrop'
  }
});

const sendRecoveryEmail = async (toEmail) => {
  const user = await Users.findOne({ email: toEmail });

  if (!user) {
    throw new Error('Este email não está cadastrado na aplicação.');
  }

  const token = jwt.sign({ user_id: user._id }, jwtkey, { expiresIn: '1h' });

  const recoveryLink = `${process.env.BASE_URL}/change-password?token=${token}`;


  const mailOptions = {
    from: '"Seawatch" <Seawatchletsgo@gmail.com>',
    to: toEmail,
    subject: 'Recuperação de Palavra-Passe',
    text: `Clique no link abaixo para redefinir a sua palavra-passe: ${recoveryLink}`,
    html: `<p>Clique no <a href="${recoveryLink}">link</a> para redefinir sua palavra-passe.</p>`
  };

  return transporter.sendMail(mailOptions);
};
const sendVerificationEmail = async (user, token) => {
  console.log("Enviando email para verificação:", user.email);
  const verificationLink = `${process.env.BASE_URL}/verification?token=${token}`;
  console.log("Enviando verificação para:", user.email, "com link:", verificationLink);

  const mailOptions = {
    from: '"Seawatch" <Seawatchletsgo@gmail.com>',
    to: user.email,
    subject: 'Verificação de E-mail',
    text: `Clique no link abaixo para verificar sua conta: ${verificationLink}`,
    html: `<p>Clique no <a href="${verificationLink}">link</a> para verificar sua conta.</p>`
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendRecoveryEmail, sendVerificationEmail };