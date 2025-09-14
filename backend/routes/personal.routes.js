import { Router } from "express";
import {
  getAllPersonales,
  updatePersonal,
  getPersonalById,
  createPersonal,
  deletePersonal,
} from "../controllers/personal.controller.js";

const router = Router();

router.get("/api/personales", getAllPersonales);
router.put("/api/personales/:id", updatePersonal);
router.post("/api/personales", createPersonal);
router.get("/api/personales/:id", getPersonalById);
router.delete("/api/personales/:id", deletePersonal);

export default router;
