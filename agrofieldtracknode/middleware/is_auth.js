const Users = require("../models/UserModel");
const { parse } = require("cookie");
const jwt = require("jsonwebtoken");
const jwtkey = 'jkdoamnwpa';


const verifyToken = async (req, res, next) => {

}
module.exports = verifyToken;