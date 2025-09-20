import { Router } from "express";
import { login, logout ,generate2FA , verify2FA} from "../controllers/auth.controller.js";

const router = Router();

router.post("/api/login", login);
router.post("/api/logout", logout);
router.post("/api/generate-2fa", generate2FA);
router.post("/api/2fa/verify", verify2FA);

export default router;
