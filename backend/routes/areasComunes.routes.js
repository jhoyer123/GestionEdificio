import { Router } from "express";
import {
  getAreasComunes,
  createAreaComun,
  getAreaComun,
  updateAreaComun,
  deleteAreaComun,
} from "../controllers/areaComun.controller.js";
import { upload } from "../middlewares/uploads.js";

const router = Router();

router.get("/api/areas-comunes", getAreasComunes);
router.get("/api/areas-comunes/:id", getAreaComun);
router.post("/api/areas-comunes", upload.single("imagen"), createAreaComun);
router.put("/api/areas-comunes/:id", upload.single("imagen"), updateAreaComun);
router.delete("/api/areas-comunes/:id", deleteAreaComun);

export default router;
