const express = require("express");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const backoficeRoutes = require("./routes/backoficeRoute");
const Chats = require("./models/ChatsModel");
const Animal = require("./models/AnimaisModel");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8100",
      "http://localhost:8000",
      "https://agrofieldtrack-ionic-e6ru.onrender.com"
    ],
    credentials: true
  }
});

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


app.use(cors({
  origin: [
    "http://localhost:8100",
    "http://localhost:8000",
    "https://agrofieldtrack-ionic-e6ru.onrender.com"
  ],
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

app.use("/admin", backoficeRoutes);
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
const ChatsRoutes = require('./routes/ChatsRoute');


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
safeUse('ChatsRoutes', ChatsRoutes);

io.on("connection", (socket) => {
  console.log("Socket conectado:", socket.id);

  socket.on("join-chat", ({ chatId, userId }) => {
    if (!chatId) return;
    const room = `chat_${chatId}`;
    socket.join(room);
    console.log(`Usuário ${userId} entrou na sala ${room}`);
  });

  socket.on("locationUpdate", (data) => {
    if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      return;
    }
    console.log("User location:", data);
    socket.broadcast.emit("userMoved", data);
  });

  socket.on("send-message", async ({ chatId, sender_id, sender_type, text, animal_id }) => {
    if (!chatId || !sender_id || !sender_type || (!text && !animal_id)) return;

    try {
      const chat = await Chats.findById(chatId);
      if (!chat) return;

      const messageToSave = {
        sender_id,
        sender_type,
        text: text || "",
        createdAt: new Date()
      };

      if (animal_id) {
        messageToSave.animal_id = animal_id;
      }

      chat.mensagens.push(messageToSave);
      await chat.save();

      const messageToEmit = { ...messageToSave };
      if (animal_id) {
        const animal = await Animal.findById(animal_id).select("-__v");
        if (animal) {
          messageToEmit.animal_id = animal;
        }
      }

      socket.to(`chat_${chatId}`).emit("new-message", messageToEmit);
    } catch (err) {
      console.error("Erro socket send-message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket desconectado:", socket.id);
  });
});

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

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// global error handler (simple)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});


// --- Start server and connect to MongoDB ---
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});


module.exports = app;