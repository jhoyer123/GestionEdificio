import { Router } from "express";
import { getResidentes } from "../controllers/residente.controller.js";

const router = Router();

router.get("/api/residentes", getResidentes);

export default router;
