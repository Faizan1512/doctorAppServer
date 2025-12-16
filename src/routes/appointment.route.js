// routes/appointment.route.js
import express from "express";
import {
  bookAppointment,
  getAppointments,
  approveAppointment,
  declineAppointment,
} from "../controllers/appointment.controller.js"

const router = express.Router();

// Create appointment
router.post("/bookapointment", bookAppointment);

// Get appointments (all, by doctor, by patient)
router.get("/", getAppointments);

// Approve / Decline
router.patch("/approve/:id", approveAppointment);
router.patch("/decline/:id", declineAppointment);

export default router;
