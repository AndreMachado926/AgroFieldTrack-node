const express = require("express");
const path = require("path");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
var mongodb_url = "mongodb+srv://Andre:123@cluster0.qgywnv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// CORS e cookies (ajusta origin conforme o teu frontend)
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:8100', credentials: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Registar rotas (exemplo)
const plantacoesRouter = require('./routes/platacoesRoute');
const listasRouter = require('./routes/ListaRoute');
const veterinariosRouter = require('./routes/VeterinariosRoute');

app.use('/', plantacoesRouter);
app.use('/', listasRouter);
app.use('/', veterinariosRouter);

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


const AuthRoute = require("./routes/AuthRoute");
const VerificationRoutes= require('./routes/VerificationRoute')
app.use(AuthRoute);
app.use(VerificationRoutes);
const { me } = require('./controllers/AuthController');
app.get('/me', me);

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