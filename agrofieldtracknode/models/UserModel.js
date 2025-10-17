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
        required: true
    },
    ativo: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true
    },
    planos: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "planos", required: true },
        title: { type: String, require: true },
        features: { type: [String], required: true },
        icon: { type: String, required: true },
        price: { type: String, required: true },
        color: { type: String, required: true }
    }
});
const Users = mongoose.model("users", UsersSchema);
module.exports = Users;