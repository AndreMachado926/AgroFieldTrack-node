const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
 
const app = express();
const mongodb_url = "mongodb+srv://Andre:123@cluster0.qgywnv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
 
// --- Middleware (configured once, antes das rotas) ---
app.use(cors({ origin: process.env.BASE_URL || 'http://localhost:8100', credentials: true }));
app.use(cookieParser());
app.use(express.json()); // parsing application/json
app.use(express.urlencoded({ extended: true })); // parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));
 
// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
// simple request logger (keeps request body after parsers above)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Origin: ${req.headers.origin || '-'} - Content-Type: ${req.headers['content-type'] || '-'}`);
  // console.log('Request Body:', req.body); // descomenta apenas para debug local
  next();
});
 
// --- Routes (require e regista depois dos parsers) ---
const plantacoesRouter = require('./routes/platacoesRoute');
const listasRouter = require('./routes/ListaRoute');
const veterinariosRouter = require('./routes/VeterinariosRoute');
const remediosRouter = require('./routes/RemediosRoute');
const AuthRoute = require("./routes/AuthRoute");
const VerificationRoutes = require('./routes/VerificationRoute');
const MarketRoutes = require('./routes/MarketRoute');
 
const safeUse = (name, r) => {
  if (!r) {
    console.warn(`[routes] "${name}" is falsy. Skipping.`);
    return;
  }
  try {
    app.use('/', r);
    console.log(`[routes] registered "${name}"`);
  } catch (err) {
    console.error(`[routes] failed registering "${name}":`, err);
  }
};
 
safeUse('remediosRouter', remediosRouter);
safeUse('plantacoesRouter', plantacoesRouter);
safeUse('listasRouter', listasRouter);
safeUse('veterinariosRouter', veterinariosRouter);
 
app.use(AuthRoute);
app.use(VerificationRoutes);
app.use(MarketRoutes)
 
// diagnostic routes
app.get('/ping', (req, res) => res.status(200).send('pong'));
const { me } = require('./controllers/AuthController');
app.get('/me', me);
 
// global error handler (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});
 
// --- Start server and connect to MongoDB ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});
 
mongoose.connect(mongodb_url)
  .then(() => {
    console.log("Conexão com o MongoDB estabelecida com sucesso!");
  })
  .catch(error => {
    console.error("Erro ao conectar com MongoDB:", error);
  });
 
module.exports = app;