import { Router } from "express";
import {
  getReservas,
  createReserva,
  updateReserva,
  deleteReserva,
} from "../controllers/reservas.controller.js";

const router = Router();

router.get("/api/reservas", getReservas);
router.post("/api/reservas", createReserva);
router.put("/api/reservas/:id", updateReserva);
router.delete("/api/reservas/:id", deleteReserva);

export default router;
