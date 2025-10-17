import express from "express";
import {
  upload,
  uploadQR,
  uploadComprobantePago,
} from "../middlewares/uploads.js"; // <-- importa ambos

const router = express.Router();

// Subir una sola imagen (áreas comunes, etc.)
router.post("/upload", upload.single("imagen"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: "No se envió ninguna imagen" });
  }
  res.json({
    mensaje: "Imagen subida con éxito",
    archivo: req.file,
  });
});

// Subir varias imágenes (máx. 5)
router.post("/uploads", upload.array("imagenes", 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ mensaje: "No se enviaron imágenes" });
  }
  res.json({
    mensaje: "Imágenes subidas con éxito",
    archivos: req.files,
  });
});

// Subir QR de personal (usa otra carpeta)
router.post("/upload-qr", uploadQR.single("qr"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ mensaje: "No se envió ningún QR" });
  }
  res.json({
    mensaje: "QR subido con éxito",
    archivo: req.file,
  });
});

// Subir comprobante de pago de planilla
router.post(
  "/upload-comprobante",
  uploadComprobantePago.single("comprobante"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ mensaje: "No se envió ningún comprobante" });
    }
    res.json({
      mensaje: "Comprobante subido con éxito",
      archivo: req.file,
    });
  }
);

export default router;
