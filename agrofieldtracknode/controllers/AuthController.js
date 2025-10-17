const Users = require("../models/UserModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const jwtkey = 'jkdoamnwpa';
const { sendVerificationEmail } = require("../services/emailService");
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
        var username = req.body.username;
        var pass = req.body.password;
        try {
            const user = await Users.findOne({ username: username });
            if (!user) {
                return res.status(400).send("User does not exist");
            }
            if (user.ativo === 0) {
                return res.status(400).send("Conta não verificada. Verifique seu e-mail.");
            }
            if (user && (await bcrypt.compare(pass, user.password))) {
                const token = jwt.sign(
                    {
                        user_id: user._id.toString(),
                        username: user.username

                    },
                    jwtkey,
                    {
                        expiresIn: "30d"
                    }
                );
                const userObj = user.toObject();
                userObj.token = token;
                res.cookie("auth", token, { httpOnly: true, secure: false, sameSite: "Lax" });
                return res.json(userObj);
            } else {
                return res.status(400).send("Wrong password");
            }
        } catch (err) {
            return res.status(400).send(err);
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
                type: "Cliente",
                pontos: 0,
                ativo: 0,
                subtype: "Normal",
                profilePic: "https://feppv-marineer-bucket.s3.eu-central-1.amazonaws.com/aws-1746803776536-68379383.png",
            });

            // Gerar token de verificação
            const token = jwt.sign({ user_id: newUser._id }, jwtkey, { expiresIn: "1h" });

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
            const decoded = jwt.verify(token, jwtkey);
            res.json({ authenticated: true, user: decoded });
        } catch (err) {
            res.status(401).json({ authenticated: false });
        }
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
};

module.exports = AuthController;