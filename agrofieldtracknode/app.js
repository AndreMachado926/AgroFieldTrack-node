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
      "https://ionicseawatch.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
    credentials: true, // Permite cookies e autenticação
  })
);

const AuthRoute = require("./routes/AuthRoute");
<<<<<<< Updated upstream
const VerificationRoutes= require('./routes/VerificationRoute')
=======
const listasRouter = require('./routes/ListaRoute');
const plantacoesRouter = require('./routes/platacoesRoute');
app.use('/', plantacoesRouter);
app.use('/', listasRouter);
>>>>>>> Stashed changes

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

// rota de diagnóstico rápida
app.get('/ping', (req, res) => res.status(200).send('pong'));

const PORT = process.env.PORT || 8000;

// start server immediately so /ping e rotas respondem mesmo que o Mongo esteja em falha
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});

// tenta ligar ao Mongo, mas não impede o server de arrancar
mongoose.connect(mongodb_url)
  .then(() => {
    console.log("Conexão com o MongoDB estabelecida com sucesso!");
  })
  .catch(error => {
    console.error("Erro ao conectar com MongoDB:", error);
  });