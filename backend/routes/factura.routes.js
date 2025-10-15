import { Router } from "express";
import {
  crearFactura,
  getFacturas,
  getFacturaById,
  getFacturasByUsuario,
  crearFacturaReserva,
} from "../controllers/factura.controller.js";

const router = Router();

router.post("/api/facturas/reserva", crearFacturaReserva);
router.post("/api/facturas", crearFactura);
router.get("/api/facturas", getFacturas);
router.get("/api/facturas/usuario/:idUsuario", getFacturasByUsuario);
router.get("/api/facturas/:id", getFacturaById);

export default router;
