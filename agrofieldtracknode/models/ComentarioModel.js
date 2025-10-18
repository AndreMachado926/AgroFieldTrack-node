const mongoose = require("mongoose");
const User = require("./UserModel");
const Market = require("./MarketModel");

const ComentarioSchema = new mongoose.Schema({
  publication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comunidades',
    required: true
  },
  author: {
    id_user:{type: mongoose.Schema.Types.ObjectId,ref: "users",required: false},
    username:{type: String,required: false}
  },
  imagens: {
    type: [String],
    required: false
},
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reply' }], 
  createdAt: {
      type: Date,
      default: Date.now
  }

});

const Comentario = mongoose.model('comentarios', ComentarioSchema);
module.exports = Comentario;
