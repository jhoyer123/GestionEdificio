import { Router } from "express";
import { createFuncion, getFunciones, updateFuncion, deleteFuncion, getFuncionById} from "../controllers/funcion.controller.js";

const router = Router();

router.post("/api/funciones", createFuncion);
router.get("/api/funciones", getFunciones);
router.get("/api/funciones/:id", getFuncionById);
router.put("/api/funciones/:id", updateFuncion);
router.delete("/api/funciones/:id", deleteFuncion);

export default router;
