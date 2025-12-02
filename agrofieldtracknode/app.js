const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

// MongoDB connection string (substitua USER e PASS pelos valores corretos)
const mongodb_url = "mongodb+srv://andre:1234@cluster0.i6xw3.mongodb.net/?appName=Cluster0";

// Configuração mongoose
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // timeout após 5 segundos
  socketTimeoutMS: 45000, // timeout socket após 45 segundos
})
.then(() => {
  console.log("Conexão com MongoDB estabelecida com sucesso!");
})
.catch(err => {
  console.error("Erro ao conectar com MongoDB:", err.message);
  process.exit(1); // encerra app se não conseguir conectar
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8100',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// fallback: aceitar pedidos com Content-Type: text/plain que contenham JSON
app.use((req, res, next) => {
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.includes('text/plain') && (!req.body || Object.keys(req.body).length === 0)) {
    let raw = '';
    req.setEncoding('utf8');
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try {
        req.body = raw ? JSON.parse(raw) : {};
      } catch (err) {
        // não quebrar: manter body vazio e seguir
        req.body = {};
      }
      next();
    });
  } else {
    next();
  }
});

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
const SettingsRoutes = require('./routes/SettingsRoute');


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
safeUse('SettingsRoutes', SettingsRoutes);

app.use(AuthRoute);
app.use(VerificationRoutes);
app.use(MarketRoutes)


app.use(AuthRoute);
app.use(VerificationRoutes);

// diagnostic routes
app.get('/ping', (req, res) => res.status(200).send('pong'));
const { me } = require('./controllers/AuthController');
const { env } = require('process');
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


module.exports = app;