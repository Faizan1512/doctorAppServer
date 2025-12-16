// routes/patientAuth.route.js
import express from "express";
import { registerPatient,loginPatient ,getPatientById} from "../controllers/patientAuth.controller.js";
const router = express.Router();

router.post("/register", registerPatient);
router.post("/login", loginPatient);
router.get('/:id', getPatientById);


export default router;
