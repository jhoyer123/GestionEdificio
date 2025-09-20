import { Router } from "express";
import { getResidentes,createResidente,deleteResidente,updateResidente } from "../controllers/residente.controller.js";

const router = Router();

router.get("/api/residentes", getResidentes);
router.post("/api/residentes", createResidente);
router.delete("/api/residentes/:id", deleteResidente);
router.put("/api/residentes/:id", updateResidente);

export default router;
