const express = require("express");

const router = express.Router();
router.use(express.json());

const AuthController = require("../controllers/AuthController");

router.get("/", AuthController.index);
router.get("/register", AuthController.registerPage);
router.get("/error", AuthController.errorPage);
router.post("/register",AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/getuser",AuthController.getuser);
router.get("/auth/validate", AuthController.getUserFromToken);

module.exports = router;