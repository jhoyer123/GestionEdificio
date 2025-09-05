import { Router } from "express";
import { createFuncion } from "../controllers/funcion.controller.js";

const router = Router();

router.post("/api/funciones", createFuncion);

export default router;
