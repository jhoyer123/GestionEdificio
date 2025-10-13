import { Router } from "express";
import {
  getAllConceptosMantenimiento,
  createConceptoMantenimiento,
  updateConceptoMantenimiento,
  deleteConceptoMantenimiento,
  getConceptoMantenimientoById,
} from "../controllers/cocptManten.controller.js";

const router = Router();

router.get("/api/concept-mantenimiento", getAllConceptosMantenimiento);
router.post("/api/concept-mantenimiento", createConceptoMantenimiento);
router.put("/api/concept-mantenimiento/:id", updateConceptoMantenimiento);
router.delete("/api/concept-mantenimiento/:id", deleteConceptoMantenimiento);
router.get("/api/concept-mantenimiento/:id", getConceptoMantenimientoById);

export default router;
