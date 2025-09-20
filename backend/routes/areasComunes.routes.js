import { Router } from "express";
import {
  getAreasComunes,
  createAreaComun,
  getAreaComun,
  updateAreaComun,
  deleteAreaComun,
} from "../controllers/areaComun.controller.js";

const router = Router();

router.get("/api/areas-comunes", getAreasComunes);
router.get("/api/areas-comunes/:id", getAreaComun);
router.post("/api/areas-comunes", createAreaComun);
router.put("/api/areas-comunes/:id", updateAreaComun);
router.delete("/api/areas-comunes/:id", deleteAreaComun);

export default router;
