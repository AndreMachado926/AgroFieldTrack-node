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
    }
});
const Users = mongoose.model("users", UsersSchema);
module.exports = Users;