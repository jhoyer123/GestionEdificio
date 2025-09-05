import { Router } from "express";
import { createRol, getRoles} from "../controllers/rol.controller.js";

const router = Router();

router.post("/api/roles", createRol);
router.get("/api/roles", getRoles);

export default router;
