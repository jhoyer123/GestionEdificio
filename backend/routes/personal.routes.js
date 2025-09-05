import { Router } from "express";
import { getAllPersonales } from "../controllers/personal.controller.js";

const router = Router();

router.get("/api/personales", getAllPersonales);

export default router;
