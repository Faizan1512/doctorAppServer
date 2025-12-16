// controllers/slot.controller.js
import { Slot } from "../models/slots.model.js";
// Get slots by doctor ID (available/busy)
export const getSlotsByDoctor = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId) {
      return res.status(400).json({ status: 400, message: "Doctor ID is required" });
    }

    // Make sure doctorId is ObjectId
    const filter = { doctorId };
    if (date) filter.date = date;

    const slots = await Slot.find(filter); // Make sure Slot model is imported

    res.status(200).json({ status: 200, message: "Slots fetched", slots });
  } catch (error) {
    console.error("Error fetching slots:", error); // check console for exact error
    res.status(500).json({ status: 500, message: "Server error while fetching slots" });
  }
};

// Optional: Mark a slot as busy when appointment is booked
export const markSlotAsBooked = async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) return res.status(400).json({ status: 400, message: "slotId is required" });

    const slot = await Slot.findById(slotId);
    if (!slot) return res.status(404).json({ status: 404, message: "Slot not found" });

    if (slot.status === "booked") return res.status(400).json({ status: 400, message: "Slot already booked" });

    slot.status = "booked";
    await slot.save();

    res.status(200).json({ status: 200, message: "Slot marked as booked", slot });
  } catch (error) {
    console.error("Error marking slot as booked:", error);
    res.status(500).json({ status: 500, message: "Server error while marking slot as booked" });
  }
};
export const createSlotsFromRange = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, interval = 15 } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      return res.status(400).json({ status: 400, message: "Missing required fields" });
    }

    const slots = [];

    // Convert startTime and endTime to minutes
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    while (current + interval <= end) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      // Check if slot already exists
      const exists = await Slot.findOne({ doctorId, date, time: timeString });
      if (!exists) {
        const slot = await Slot.create({
          doctorId,
          date,
          time: timeString,
        });
        slots.push(slot);
      }

      current += interval; // move to next slot
    }

    res.status(201).json({
      status: 201,
      message: "Slots created successfully",
      slots,
    });
  } catch (error) {
    console.error("Error creating slots:", error);
    res.status(500).json({ status: 500, message: "Server error while creating slots" });
  }
};
