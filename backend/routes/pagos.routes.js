import { Router } from "express";
import {
  registrarPago,
  confirmarPago,
  obtenerPagoPorId,
  registrarPagoPlanilla,
  confirmarPagoPlanilla,
} from "../controllers/pagos.controller.js";
import { uploadComprobantePago } from "../middlewares/uploads.js";

const router = Router();

router.post("/api/pagos/planilla", registrarPagoPlanilla);
router.post("/api/pagos", registrarPago);
router.put(
  "/api/pagos/confirmar/planilla/:idPago",
  uploadComprobantePago.single("comprobante"),
  confirmarPagoPlanilla
);
router.put("/api/pagos/confirmar/:idPago", confirmarPago);
router.get("/api/pagos/:idPago", obtenerPagoPorId);

export default router;
