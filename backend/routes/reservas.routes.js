import { Router } from "express";
import {
  getReservas,
  createReserva,
  updateReservaAdmin,
  deleteReserva,
} from "../controllers/reservas.controller.js";

const router = Router();

router.get("/api/reservas", getReservas);
router.post("/api/reservas", createReserva);
router.put("/api/reservas/:idReserva", updateReservaAdmin);
router.delete("/api/reservas/:id", deleteReserva);

export default router;
