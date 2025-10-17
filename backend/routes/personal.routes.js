import { Router } from "express";
import {
  getAllPersonales,
  updatePersonal,
  getPersonalById,
  createPersonal,
  deletePersonal,
  uploadQRPersonal,
} from "../controllers/personal.controller.js";
import { uploadQR } from "../middlewares/uploads.js";

const router = Router();

router.post(
  "/api/personales/:id/upload-qr",
  uploadQR.single("qr"),
  uploadQRPersonal
);
router.get("/api/personales", getAllPersonales);
router.put("/api/personales/:id", updatePersonal);
router.post("/api/personales", createPersonal);
router.get("/api/personales/:id", getPersonalById);
router.delete("/api/personales/:id", deletePersonal);

export default router;
