//Eliminar este archivo por completo despues de las pruebas
import express from "express";
import { checkByReservaId, checkByFacturaId, getEnvInfo } from "../controllers/debug.controller.js";

const router = express.Router();

// GET /debug/reserva/:reservaId -> devuelve reserva, factura y pago relacionados (si existen)
router.get("/debug/reserva/:reservaId", checkByReservaId);
// GET /debug/factura/:facturaId -> devuelve factura y pago relacionados (si existen)
router.get("/debug/factura/:facturaId", checkByFacturaId);
router.get("/debug/env", getEnvInfo);

export default router;
