import { Router } from "express";
import {
  createParqueoCaja,
  editParqueoCaja,
  getAllParqueoCajas,
  deleteParqueoCaja,
} from "../controllers/parqueoCajas.controller.js";

const router = Router();

router.post("/api/cajas", createParqueoCaja);
router.put("/api/cajas/:id", editParqueoCaja);
router.get("/api/cajas", getAllParqueoCajas);
router.delete("/api/cajas/:id", deleteParqueoCaja);

export default router;
