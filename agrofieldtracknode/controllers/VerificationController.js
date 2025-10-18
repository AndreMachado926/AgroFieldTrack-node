const jwt = require('jsonwebtoken');
const Users = require('../models/UserModel');
const jwtkey = 'jkdoamnwpa'; // ou use process.env.JWT_SECRET


const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, jwtkey);
        const user = await Users.findById(decoded.user_id);

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (user.emailVerified) {
            return res.status(200).json({ message: 'Email já verificado.' });
        }

        user.emailVerified = true;
        user.ativo = 1;
        await user.save();

        res.status(200).json({ message: 'Email verificado com sucesso!' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
};

module.exports = { verifyEmail };
