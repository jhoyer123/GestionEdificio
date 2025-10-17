import { Router } from "express";
import {
  createPlanillas,
  getPlanillas,
  getPlanillasByPersonal,
} from "../controllers/planilla.controller.js";

const router = Router();

router.post("/api/planillas", createPlanillas);
router.get("/api/planillas", getPlanillas);
router.get("/api/planillas/personal/:personalId", getPlanillasByPersonal);

export default router;
