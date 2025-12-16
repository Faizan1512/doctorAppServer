import express from "express";
import {
  registerDoctor,
  loginDoctor,
  getDoctorById,
  getAllDoctors,
} from "../controllers/doctor.controller.js"

const router = express.Router();

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.get("/:id", getDoctorById);
router.get("/", getAllDoctors);

export default router;
