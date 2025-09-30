import { Router } from "express";
import {
  getReservas,
  createReserva,
  updateReservaAdmin,
  deleteReserva,
  updateEstadoReserva,
  getMisReservas,
} from "../controllers/reservas.controller.js";

const router = Router();

router.get("/api/reservas", getReservas);
router.post("/api/reservas", createReserva);
router.put("/api/reservas/:idReserva", updateReservaAdmin);
router.delete("/api/reservas/:id", deleteReserva);
router.patch("/api/reservas/estado/:id", updateEstadoReserva);
router.get("/api/mis-reservas", getMisReservas);

export default router;
