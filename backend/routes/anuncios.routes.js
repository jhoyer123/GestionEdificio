import { Router } from "express";
import {
  createAnuncio,
  updateAnuncio,
  deleteAnuncio,
  getAnuncios,
  marcarAnuncioVisto,
} from "../controllers/anuncio.controller.js";

const router = Router();

router.post("/api/anuncios/visto", marcarAnuncioVisto);
router.post("/api/anuncios", createAnuncio);
router.put("/api/anuncios/:id", updateAnuncio);
router.delete("/api/anuncios/:id", deleteAnuncio);
router.get("/api/anuncios", getAnuncios);

export default router;
