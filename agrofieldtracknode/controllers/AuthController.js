const Users = require("../models/UserModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const jwtKey = process.env.JWT_KEY || 'jkdoamnwpa';
const { sendVerificationEmail } = require("../services/emailservice");
const AuthController = {
    index: (req, res) => {
        res.render("login/index");
    },

    registerPage: (req, res) => {
        res.render("registrar/index2");
    },

    errorPage: (req, res) => {
        res.render("erros/ErrorPage");
    },

    login: async (req, res) => {
        const { username, password } = req.body;
        try {
            const user = await Users.findOne({ username });

            if (!user) return res.status(400).send("User does not exist");
            if (user.ativo === 0) return res.status(400).send("Conta não verificada.");

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).send("Wrong password");

            // 🔑 Gerar token
            const jwt = require("jsonwebtoken");
            const token = jwt.sign(
                { user_id: user._id, username: user.username },
                process.env.JWT_KEY || "secret",
                { expiresIn: "1d" }
            );

            // 🔐 Envia cookie
            res.cookie('auth', token, {
                httpOnly: false, // não httponly, para poder ler no JS
                secure: false,    // true se HTTPS
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 1 dia
            });

            // 🔑 Envia token também no body
            return res.json({
                _id: user._id,
                username: user.username,
                token // 🔹 token disponível no frontend
            });

        } catch (err) {
            return res.status(500).send(err.message || "Erro no servidor");
        }
    },


    register: async (req, res) => {
        const { username, email, password } = req.body;

        try {
            const existingUserByEmail = await Users.findOne({ email });
            if (existingUserByEmail) {
                return res.status(400).json({ message: "Já existe um usuário com esse email." });
            }

            const existingUserByUsername = await Users.findOne({ username });
            if (existingUserByUsername) {
                return res.status(400).json({ message: "Já existe um usuário com esse username." });
            }

            const encrypted_pass = await bcrypt.hash(password, 10);
            const newUser = await Users.create({
                username,
                email,
                password: encrypted_pass,
                type: "user",
                pontos: 0,
                ativo: 0,
                subtype: "Normal",
                profilePic: "https://feppv-marineer-bucket.s3.eu-central-1.amazonaws.com/aws-1746803776536-68379383.png",
            });

            // Gerar token de verificação
            const token = jwt.sign({ user_id: newUser._id }, jwtKey, { expiresIn: "1h" });

            // Enviar email de verificação
            await sendVerificationEmail(newUser, token);
            res.status(201).json({ message: "Usuário criado com sucesso. Verifique seu e-mail.", user: newUser });
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Erro ao criar o usuário", error: err });
        }
    },

    logout: async (req, res) => {
        res.clearCookie("auth");
        res.status(200).send({ message: "logout successful" })
    },

    getUserFromToken: async (req, res) => {
        const token = req.cookies.auth;
        if (!token) {
            return res.status(401).json({ authenticated: false });
        }
        try {
            const decoded = jwt.verify(token, jwtKey);
            res.json({ authenticated: true, user: decoded });
        } catch (err) {
            res.status(401).json({ authenticated: false });
        }
    },
    logout: async (req, res) => {
        res.clearCookie("auth");
        res.status(200).send({ message: "logout successful" })
    },

    getuser: async (req, res) => {
        const { userId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "User ID is required" }); // Falta de userId
        }

        try {
            const getusers = await Users.findById(userId);
            if (!getusers) {
                return res.status(401).json({ message: "User not found" }); // Nenhum usuário encontrado
            }

            // Formatar e enviar a resposta corretamente
            const userData = getusers.toObject();
            delete userData.password; // Garantir que a senha não seja enviada
            return res.json(userData); // Retornar os dados do usuário
        } catch (err) {
            return res.status(500).json({ authenticated: false, message: "Error fetching user data" });
        }
    },

    me: (req, res) => {
        try {
            const token = req.cookies?.auth
                || (req.headers.authorization?.startsWith('Bearer ')
                    ? req.headers.authorization.split(' ')[1]
                    : null);

            if (!token) return res.status(401).json({ message: 'Not authenticated' });

            const decoded = jwt.verify(token, jwtKey);

            const userId = decoded.user_id || decoded.id || decoded._id || decoded.sub;
            if (!userId) return res.status(401).json({ message: 'Invalid token payload' });

            return res.json({ user_id: userId });
        } catch (err) {
            console.error("Error in /me:", err);
            return res.status(401).json({ message: 'Invalid token' });
        }
    },

    registerAdmin: async (req, res) => {
        const { username, email, password } = req.body;

        try {
            // Verificar se já existe admin com o mesmo email
            const existingAdminByEmail = await Users.findOne({ email });
            if (existingAdminByEmail) {
                return res.status(400).json({ message: "Já existe um administrador com esse email." });
            }

            // Verificar se já existe admin com o mesmo username
            const existingAdminByUsername = await Users.findOne({ username });
            if (existingAdminByUsername) {
                return res.status(400).json({ message: "Já existe um administrador com esse username." });
            }

            // Criptografar password
            const encrypted_pass = await bcrypt.hash(password, 10);

            // Criar admin
            const newAdmin = await Users.create({
                username,
                email,
                password: encrypted_pass,
                type: "admin",
                pontos: 0,
                ativo: 1,
                subtype: "Master",
                profilePic: "https://feppv-marineer-bucket.s3.eu-central-1.amazonaws.com/aws-1746803776536-68379383.png",
            });

            res.status(201).json({
                message: "Administrador criado com sucesso.",
                admin: newAdmin
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({
                message: "Erro ao criar administrador",
                error: err
            });
        }
    },
};


module.exports = AuthController;