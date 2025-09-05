import { Router } from "express";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario, getUsuario} from "../controllers/usuario.controller.js";

const router = Router();

router.get("/api/usuarios", getUsuarios);
router.get("/api/usuarios/:id", getUsuario);
router.post("/api/usuarios", createUsuario);
router.put("/api/usuarios/:id", updateUsuario);
router.delete("/api/usuarios/:id", deleteUsuario);

export default router;
