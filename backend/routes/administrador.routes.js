import { Router } from "express";
import { getDashboardStats } from "../controllers/administrador.controller.js";

const router = Router();

// Ruta para obtener estadísticas del dashboard
router.get("/api/dashboard/stats", getDashboardStats);

export default router;
