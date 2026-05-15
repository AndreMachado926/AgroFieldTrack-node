const mongoose = require("mongoose");

const PromptSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  user_type: {
    type: String,
    required: true,
    enum: ["user", "admin", "veterinario"],
  },
  texto: {
    type: String,
    required: true,
  },
  imagem: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

const Prompt = mongoose.model("prompts", PromptSchema);
module.exports = Prompt;
