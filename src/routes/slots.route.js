// routes/slot.route.js
import express from "express";
import { createSlotsFromRange, getSlotsByDoctor, markSlotAsBooked } from '../controllers/slots.controller.js'

const router = express.Router();

router.post("/range", createSlotsFromRange);

// Get slots by doctor ID
router.get("/", getSlotsByDoctor);

// Optional: Mark a slot as booked
router.patch("/book", markSlotAsBooked);

export default router;
