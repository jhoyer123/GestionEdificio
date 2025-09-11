import { Router } from "express";
import { getAllPersonales, updatePersonal,getPersonalById } from "../controllers/personal.controller.js";

const router = Router();

router.get("/api/personales", getAllPersonales);
router.put("/api/personales/:id", updatePersonal);
router.get("/api/personales/:id", getPersonalById);

export default router;
