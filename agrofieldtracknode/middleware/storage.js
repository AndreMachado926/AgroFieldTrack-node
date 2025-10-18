require('dotenv').config();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Garante que a pasta uploads existe
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Filtro de tipo de ficheiro (apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Apenas arquivos PNG, JPEG e JPG são permitidos"), false);
  }
  cb(null, true);
};

// Configuração de armazenamento local
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `local-${uniqueSuffix}${ext}`);
  },
});

// Upload para publicações (qualquer imagem)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

// Upload exclusivo para peixes (apenas PNG)
const fileFilter2 = (req, file, cb) => {
  const allowedTypes = ["image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Apenas arquivos PNG são permitidos"), false);
  }
  cb(null, true);
};

const uploadPeixe = multer({
  storage: storage,
  fileFilter: fileFilter2,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

module.exports = { upload, uploadPeixe };
