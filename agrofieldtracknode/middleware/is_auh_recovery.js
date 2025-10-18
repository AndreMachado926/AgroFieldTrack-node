const Users = require("../models/UsersModel");
const { parse } = require("cookie");
const jwt = require("jsonwebtoken");
const jwtkey = 'jkdoamnwpa';


const verifyToken = async (req, res, next) => {
    try {
        let token = null;
        // Verifica primeiro se o token vem no header (Bearer Token)
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        // Caso contrário, tenta pegar do cookie
        else {
            const cookies = parse(req.headers.cookie || "");
            token = cookies.auth;
        }
        // Se não houver token, retorna erro 401
        if (!token) {
            return res.status(401).json({ message: "Não autorizado. Faça login." });
        } else {
            // Verifica o token JWT
            const decoded = jwt.verify(token, jwtkey);
            const user = await Users.findById(decoded.user_id);
            if (!user) {
                return res.status(401).json({ message: "Utilizador não encontrado ou sessão expirada." });
            } else {
                // Define o usuário nos locals da resposta
                res.locals.user = user; // Apenas o primeiro resultado
                next(); // Continua para a próxima função na rota
            }
        }
    } catch (error) {
        console.error("Erro na autenticação:", error);
        return res.status(401).json({ message: "Não autorizado ou sessão expirada." });
    }

}
module.exports = verifyToken;