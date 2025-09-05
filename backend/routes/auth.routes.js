import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js";

const router = Router();

router.post("/api/login", login);
router.post("/api/logout", logout);

export default router;
