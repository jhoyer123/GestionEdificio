import { Router } from "express";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuario,
  cambiarContrasena,
  verifyEmail,
  resendVerifyEmail,
  resetPassword,
  sendResetPasswordEmail,
} from "../controllers/usuario.controller.js";

const router = Router();

router.get("/api/usuarios/verify-email", verifyEmail);
router.post("/api/usuarios/resend-verify-email", resendVerifyEmail);
router.post("/api/usuarios/reset-password", resetPassword);
router.post("/api/usuarios/send-reset-password-email", sendResetPasswordEmail);

router.get("/api/usuarios", getUsuarios);
router.get("/api/usuarios/:id", getUsuario);
router.post("/api/usuarios", createUsuario);
router.put("/api/usuarios/:id", updateUsuario);
router.delete("/api/usuarios/:id", deleteUsuario);
router.put("/api/usuarios/:id/cambiar-contrasena", cambiarContrasena);

export default router;
