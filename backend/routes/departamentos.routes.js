import { Router } from "express";
import {
  createDepartamento,
  getDepartamentos,
  getDepartamentoById,
  updateDepartamento,
  deleteDepartamento,
} from "../controllers/departamento.controller.js";
// import de funciones de negocio
import { obtenerDepartamentosConUsuarios } from "../controllers/departamento.controller.js";
const router = Router();

router.post("/api/departamentos", createDepartamento);
router.get("/api/departamentos", getDepartamentos);
router.get("/api/departamentos/:id", getDepartamentoById);
router.put("/api/departamentos/:id", updateDepartamento);
router.delete("/api/departamentos/:id", deleteDepartamento);
// Rutas de negocio
//Traer departamentons con usuaarios (si tienen)
router.get("/api/departamentos-cu", obtenerDepartamentosConUsuarios);

export default router;
