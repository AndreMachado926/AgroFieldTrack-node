const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    profilePic: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['user', 'admin', 'veterinario'] // restrict possible types
    },
    ativo: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true
    },
    // New fields for veterinarians
    descricao: {
        type: String,
        required: function() {
            return this.type === 'veterinario';
        }
    },
    especializacao: {
        type: String,
        required: function() {
            return this.type === 'veterinario';
        }
    },
    nome_completo: {
        type: String,
        required: function() {
            return this.type === 'veterinario';
        }
    },
    telefone: {
        type: String,
        required: function() {
            return this.type === 'veterinario';
        }
    }
});

// Add validation middleware
UsersSchema.pre('save', function(next) {
    if (this.type === 'veterinario') {
        if (!this.descricao || !this.especializacao || !this.nome_completo || !this.telefone) {
            next(new Error('Veterinários precisam fornecer descrição, especialização, nome completo e telefone'));
            return;
        }
    }
    next();
});

const Users = mongoose.model("users", UsersSchema);
module.exports = Users;