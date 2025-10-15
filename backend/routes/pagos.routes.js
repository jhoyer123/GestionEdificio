import { Router } from "express";
import {
  registrarPago,
  confirmarPago,
  obtenerPagoPorId,
} from "../controllers/pagos.controller.js";

const router = Router();

router.post("/api/pagos", registrarPago);
router.put("/api/pagos/confirmar/:idPago", confirmarPago);
router.get("/api/pagos/:idPago", obtenerPagoPorId);

export default router;
