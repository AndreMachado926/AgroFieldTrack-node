const Users = require("../models/UserModel"); // <--- importa teu modelo User
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const jwtkey = 'jkdoamnwpa';
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user:'agrofieldtrack@gmail.com',
    pass:'cncw zdzb tmcy anij'
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 60000, // 60 segundos
  socketTimeout: 60000,     // 60 segundos
  greetingTimeout: 60000,   // Timeout do greeting
  pool: {
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 500,
    rateLimit: 14
  },
  logger: false,
  debug: false
});

// Verificar se o transporter está configurado corretamente apenas na inicialização
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro de configuração do email:", error);
  } else {
    console.log("✅ Serviço de email configurado com sucesso");
  }
});

const sendRecoveryEmail = async (toEmail) => {
  console.log("📧 [RECOVERY] Iniciando envio de email de recuperação para:", toEmail);
  
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

  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 [RECOVERY] Tentativa ${attempt}/${maxRetries}...`);
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout after 60 seconds')), 60000)
        )
      ]);
      console.log("✅ [RECOVERY] Email enviado com sucesso para:", toEmail, `na tentativa ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ [RECOVERY] Tentativa ${attempt} falhou para ${toEmail}:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError || new Error('Falha ao enviar email de recuperação');
};
const sendVerificationEmail = async (user, token) => {
  console.log("📧 [VERIFICATION] Iniciando envio de email de verificação para:", user.email);
  const verificationLink = `${process.env.BASE_URL}/verification?token=${token}`;

  const mailOptions = {
    from: '"agrofieldtrack" <agrofieldtrack@gmail.com>',
    to: user.email,
    subject: 'Verificação de E-mail',
    text: `Clique no link abaixo para verificar sua conta: ${verificationLink}`,
    html: `<p>Clique no <a href="${verificationLink}">link</a> para verificar sua conta.</p>`
  };

  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 [VERIFICATION] Tentativa ${attempt}/${maxRetries}...`);
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout after 60 seconds')), 60000)
        )
      ]);
      console.log("✅ [VERIFICATION] Email enviado com sucesso para:", user.email, `na tentativa ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ [VERIFICATION] Tentativa ${attempt} falhou para ${user.email}:`, error.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError || new Error('Falha ao enviar email de verificação');
};

const sendEmailChangeCode = async (toEmail, code) => {
  console.log("📧 [EMAIL_CHANGE] Iniciando envio de código para:", toEmail);

  const mailOptions = {
    from: '"agrofieldtrack" <agrofieldtrack@gmail.com>',
    to: toEmail,
    subject: 'Código de alteração de email',
    text: `Seu código para alterar o email é: ${code}`,
    html: `<p>Seu código para alterar o email é: <strong>${code}</strong></p>`
  };

  let lastError = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      console.log(`📧 [EMAIL_CHANGE] Tentativa ${attempt}/${maxRetries}...`);
      
      const result = await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Email timeout after 60 seconds')), 60000)
        )
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`✅ [EMAIL_CHANGE] Email enviado com sucesso para: ${toEmail} (${duration}ms) na tentativa ${attempt}`);
      return result;
    } catch (error) {
      lastError = error;
      console.error(`❌ [EMAIL_CHANGE] Tentativa ${attempt} falhou para ${toEmail}:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`⏳ [EMAIL_CHANGE] Aguardando 2 segundos antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  console.error("❌ [EMAIL_CHANGE] Todas as tentativas falharam para:", toEmail);
  throw lastError || new Error('Falha ao enviar email após múltiplas tentativas');
};

module.exports = { sendRecoveryEmail, sendVerificationEmail, sendEmailChangeCode };