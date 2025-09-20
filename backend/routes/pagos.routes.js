import { Router } from "express";
import { registrarPago } from "../controllers/pagos.controller.js";

const router = Router();

router.post("/api/pagos", registrarPago);

export default router;
