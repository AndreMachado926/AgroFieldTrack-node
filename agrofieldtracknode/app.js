const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
var mongodb_url = "mongodb+srv://Andre:123@cluster0.qgywnv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cors= require("cors")
const dotenv = require('dotenv');
dotenv.config();


const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(
  cors({
    origin: [
      "http://localhost:3000",  // React
      "http://127.0.0.1:3000",  // React (alternativo)
      "http://localhost:8100",  // Ionic
      "http://127.0.0.1:8100", // Ionic (alternativo)
      "https://ionicseawatch.onrender.com" ,
      "https://feppv-marineer-bucket.s3.eu-central-1.amazonaws.com",
      "https://ionicseawatch.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
    credentials: true, // Permite cookies e autenticação
  })
);

const AuthRoute = require("./routes/AuthRoute");
const VerificationRoutes= require('./routes/VerificationRoute')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.get("/modal", (req, res) => {
  res.render("modal");
});
app.set('views', path.join(__dirname, 'views'));
app.set('partials', path.join(__dirname, 'views', 'partials'));
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(AuthRoute);
app.use(VerificationRoutes);

mongoose.connect(mongodb_url)
    .then(result => {
        app.listen(8000, () => {
            console.log("Servidor rodando na porta 8000...");
        });
        console.log("Conexão com o MongoDB estabelecida com sucesso!");
    })
    .catch(error => {
        console.log("Erro ao conectar com MongoDB:", error);
    });