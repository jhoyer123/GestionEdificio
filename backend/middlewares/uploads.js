import multer from "multer";
import path from "path";

// Configuración de almacenamiento para imágenes de áreas comunes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Configuración de almacenamiento para QR de personales
const storageQR = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/qr");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_qr${path.extname(file.originalname)}`);
  },
});

// Configuración de almacenamiento para comprobantes de pagos de planilla
const storageComprobantePago = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/comprobantes");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_qr${path.extname(file.originalname)}`);
  },
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
};

// Exports individuales
export const upload = multer({ storage, fileFilter });
export const uploadQR = multer({ storage: storageQR, fileFilter });
export const uploadComprobantePago = multer({
  storage: storageComprobantePago,
  fileFilter,
});
