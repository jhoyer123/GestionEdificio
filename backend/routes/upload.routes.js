import express from "express";
import upload from "../middlewares/uploads.js";

const router = express.Router();

// Subir una sola imagen
router.post("/upload", upload.single("imagen"), (req, res) => {
  res.json({
    mensaje: "Imagen subida con éxito",
    archivo: req.file,
  });
});

// Subir varias imágenes
router.post("/uploads", upload.array("imagenes", 5), (req, res) => {
  res.json({
    mensaje: "Imágenes subidas con éxito",
    archivos: req.files,
  });
});

export default router;
