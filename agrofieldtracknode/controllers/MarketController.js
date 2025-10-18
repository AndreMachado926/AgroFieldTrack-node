const Market = require('../models//MarketModel');
const Comentario = require('../models/ComentarioModel');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Função para obter as publicações
const getPublications = async (req, res) => {
    try {
        const publications = await Market.find()
            .populate('author', 'username')
            .sort({ createdAt: 1 });

        const formattedPublications = publications.map(pub => {
            let image = null;
            if (pub.imagens && pub.imagens.data) {
                const base64 = pub.imagens.data.toString('base64');
                image = `data:${pub.imagens.contentType};base64,${base64}`;
            }
            return {
                ...pub.toObject(),
                imagens: image
            };
        });

        res.json(formattedPublications);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao buscar publicações' });
    }
};

const createPublication = async (req, res) => {
    try {
        let { title, message, publication_type, tags, preco } = req.body;

        let user = req.body.user;
        if (typeof user === 'string') user = JSON.parse(user);

        // Transformar tags em array
        if (tags && typeof tags === 'string') {
            tags = tags.split(',').map(tag => tag.trim());
        } else if (!Array.isArray(tags)) {
            tags = [];
        }

        // Se houver imagem, transformar em buffer
        let imagens = null;
        if (req.file) {
            imagens = {
                data: fs.readFileSync(req.file.path), // Lê o arquivo
                contentType: req.file.mimetype
            };
        }

        const newPublication = new Market({
            title,
            message,
            preco: parseFloat(preco) || 0,
            publication_type,
            tags,
            author: {
                id: new mongoose.Types.ObjectId(user._id),
                username: user.username
            },
            imagens
        });

        await newPublication.save();

        res.json({ success: true, publication: newPublication });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Erro ao salvar publicação' });
    }
};



const getPublicationDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const publication = await Market.findById(id)
            .populate('author', 'username')
            .populate({
                path: 'comentarios',
                populate: {
                    path: 'author',
                    select: 'username'
                }
            });

        if (!publication) {
            return res.status(404).json({ error: 'Publicação não encontrada' });
        }

        // Formatar a imagem se existir
        let image = null;
        if (publication.imagens && publication.imagens.data) {
            const base64 = publication.imagens.data.toString('base64');
            image = `data:${publication.imagens.contentType};base64,${base64}`;
        }

        const formattedPublication = {
            ...publication.toObject(),
            imagens: image
        };

        res.json(formattedPublication);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro no servidor' });
    }
};


// Função para deletar uma publicação
const deletePublication = async (req, res) => {
    const publicationId = req.params.id;

    if (!publicationId) {
        return res.status(400).json({ success: false, message: 'ID da publicação não fornecido.' });
    }

    try {

        const result = await Market.findByIdAndDelete(publicationId);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Publicação não encontrada.' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao excluir a publicação.' });
    }
};

// Função para editar uma publicação
const updatePublication = async (req, res) => {
    let { title, message, publication_type, participanteId, preco } = req.body;
    const publicationId = req.params.id;
    preco = parseInt(preco, 10) || 0;

    if (!mongoose.Types.ObjectId.isValid(publicationId)) {
        return res.status(400).json({ success: false, message: 'ID inválido' });
    }


    try {
        const publication = await Market.findById(publicationId);
        if (!publication) {
            return res.status(404).json({ success: false, message: 'Publicação não encontrada' });
        }

        // Adicionar participante, se necessário
        if (participanteId && !publication.participantes.includes(participanteId)) {
            publication.participantes.push(participanteId);
        }

        // Atualizar os campos de texto
        publication.title = title || publication.title;
        publication.preco = preco || publication.preco;
        publication.message = message || publication.message;
        publication.publication_type = publication_type || publication.publication_type;

        if (req.body.tags) {
            publication.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',');
        }

        if (req.file && req.file.location) {
            publication.imagens = req.file.location;
        } else
            if (req.file == undefined) {
                publication.imagens = publication.imagens;
            }

        await publication.save();

        res.json({
            success: true,
            publication,
            authorName: publication.author.username,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro ao atualizar publicação' });
    }
};

const addComentario = async (req, res) => {
    try {
        const { message, parentCommentId, user } = req.body;

        if (!user || !user._id || !user.username) {
            return res.status(400).json({ success: false, message: 'Usuário inválido.' });
        }

        const publicationId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(publicationId)) {
            return res.status(400).json({ success: false, message: 'ID da publicação inválido.' });
        }

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Mensagem do comentário é obrigatória.' });
        }

        // Criar novo comentário
        const newComment = new Comentario({
            message,
            publication: publicationId,
            author: {
                id_user: user._id,
                username: user.username,
            }
        });

        // Se houver imagens, adicionar ao comentário
        if (req.files && req.files.length > 0) {
            newComment.image = req.files.map(file => file.path);
        }

        await newComment.save();

        // Se for uma resposta a um comentário, atualizar o comentário pai
        if (parentCommentId) {
            await Comentario.findByIdAndUpdate(parentCommentId, {
                $push: { replies: newComment._id }
            });
        } else {
            // Se for um comentário direto na publicação, atualizar a publicação
            await Market.findByIdAndUpdate(publicationId, {
                $push: { comentarios: newComment._id }
            });
        }

        // Buscar os comentários atualizados
        const publication = await Market.findById(publicationId)
            .populate({
                path: 'comentarios',
                populate: { path: 'author', select: 'username' }
            });

        res.json({
            success: true,
            comment: newComment,
            comentarios: publication.comentarios,
            authorName: user.username,
            images: newComment.image || []
        });

    } catch (err) {
        res.status(500).json({ success: false, message: 'Erro ao adicionar o comentário' });
    }
};


const removerComentario = async (req, res) => {
    try {
        const comentarioId = req.params.id;

        const comentarioRemovido = await Comentario.findByIdAndDelete(comentarioId);

        if (!comentarioRemovido) {
            return res.status(404).send('Comentário não encontrado');
        }

        res.status(200).send('Comentário removido com sucesso');
    } catch (error) {
        res.status(500).send('Erro interno no servidor');
    }
};

const editarComentario = async (req, res) => {
    try {
        const comentarioId = req.params.id;
        const novosDados = req.body;
        let imagensCaminhos = [];

        // Verifica se há arquivos de imagem e armazena seus caminhos no servidor
        if (req.files && req.files.length > 0) {
            imagensCaminhos = req.files.map(file => file.path);
        }

        // Atualiza a mensagem do comentário se houver uma nova mensagem
        if (novosDados.message) {
            await Comentario.findByIdAndUpdate(
                comentarioId,
                { $set: { message: novosDados.message } },
                { new: true }
            );
        }

        // Se houver uma imagem nova, remove a antiga e adiciona a nova
        if (imagensCaminhos.length > 0) {
            const comentarioAtual = await Comentario.findById(comentarioId);

            if (comentarioAtual.images && comentarioAtual.images.length > 0) {
                comentarioAtual.images.forEach(image => {
                    const oldImagePath = path.join(__dirname, 'fotos', path.basename(image));
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath); // Remove a imagem antiga
                    }
                });
            }

            // Atualiza o array de imagens com os novos caminhos das imagens
            await Comentario.findByIdAndUpdate(
                comentarioId,
                { $set: { images: imagensCaminhos } },
                { new: true }
            );
        }

        const comentarioAtualizado = await Comentario.findById(comentarioId).populate('author', 'username');

        if (!comentarioAtualizado) {
            return res.status(404).send('Comentário não encontrado');
        }

        res.status(200).json({
            _id: comentarioAtualizado._id,
            message: comentarioAtualizado.message,
            author: comentarioAtualizado.author,
            image: comentarioAtualizado.images,
            respostas: comentarioAtualizado.respostas,
        });
    } catch (error) {
        res.status(500).send('Erro interno no servidor');
    }
};


module.exports = {
    getPublications,
    createPublication,
    getPublicationDetails,
    deletePublication,
    updatePublication,
    addComentario,
    removerComentario,
    editarComentario
};