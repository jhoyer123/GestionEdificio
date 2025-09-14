import { Router } from "express";
import { getResidentes,createResidente,deleteResidente } from "../controllers/residente.controller.js";

const router = Router();

router.get("/api/residentes", getResidentes);
router.post("/api/residentes", createResidente);
router.delete("/api/residentes/:id", deleteResidente);

export default router;
