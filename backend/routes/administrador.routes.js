import { Router } from "express";
import {
  getDashboardStats,
  executeQuery,
} from "../controllers/administrador.controller.js";

const router = Router();

// Ruta para obtener estadísticas del dashboard
router.get("/api/dashboard/stats", getDashboardStats);

// Ruta para ejecutar consultas personalizadas
router.post("/api/query", executeQuery);

export default router;
