const Users = require("../models/UserModel"); // <--- importa teu modelo User
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jwtkey = 'jkdoamnwpa';
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'agrofieldtrack@gmail.com',
    pass: 'sfrb qyuz mrkw qmls'
  }
});

// Verificar se o transporter está configurado corretamente
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro de configuração do email:", error);
  } else {
    console.log("✅ Serviço de email configurado com sucesso");
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
    from: '"agrofieldtrack" <agrofieldtrack@gmail.com>',
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
    from: '"agrofieldtrack" <agrofieldtrack@gmail.com>',
    to: user.email,
    subject: 'Verificação de E-mail',
    text: `Clique no link abaixo para verificar sua conta: ${verificationLink}`,
    html: `<p>Clique no <a href="${verificationLink}">link</a> para verificar sua conta.</p>`
  };

  return transporter.sendMail(mailOptions);
};

const sendEmailChangeCode = async (toEmail, code) => {
  console.log("📧 Tentando enviar código de email para:", toEmail);
  
  const mailOptions = {
    from: '"agrofieldtrack" <agrofieldtrack@gmail.com>',
    to: toEmail,
    subject: 'Código de alteração de email',
    text: `Seu código para alterar o email é: ${code}`,
    html: `<p>Seu código para alterar o email é: <strong>${code}</strong></p>`
  };

  try {
    // Verificar se o transporter está pronto antes de enviar
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          reject(new Error(`Transporter verification failed: ${error.message}`));
        } else {
          resolve(success);
        }
      });
    });

    // Adicionar timeout de 10 segundos para evitar pending infinito
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout after 10 seconds')), 10000)
      )
    ]);
    
    console.log("✅ Email enviado com sucesso para:", toEmail, result.response);
    return result;
  } catch (error) {
    console.error("❌ Erro ao enviar email para:", toEmail, error.message);
    throw error;
  }
};

// Função de teste para verificar se o email está funcionando
const testEmailService = async (testEmail) => {
  try {
    console.log("🧪 Testando serviço de email...");
    await sendEmailChangeCode(testEmail, '123456');
    console.log("✅ Teste de email bem-sucedido!");
    return { success: true, message: 'Email enviado com sucesso' };
  } catch (error) {
    console.error("❌ Teste de email falhou:", error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { sendRecoveryEmail, sendVerificationEmail, sendEmailChangeCode, testEmailService };