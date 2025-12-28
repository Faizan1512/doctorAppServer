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

    // 1. Normalize the date (set to midnight)
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let current = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    const newSlotsData = [];

    while (current + interval <= end) {
      const hour = Math.floor(current / 60);
      const minute = current % 60;
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

      newSlotsData.push({
        doctorId,
        date: normalizedDate,
        time: timeString,
      });

      current += interval;
    }

    // 2. Efficiently find which slots already exist in one query
    const existingSlots = await Slot.find({
      doctorId,
      date: normalizedDate,
      time: { $in: newSlotsData.map(s => s.time) }
    });

    const existingTimes = new Set(existingSlots.map(s => s.time));

    // 3. Filter out the ones that already exist
    const slotsToCreate = newSlotsData.filter(s => !existingTimes.has(s.time));

    let createdSlots = [];
    if (slotsToCreate.length > 0) {
      createdSlots = await Slot.insertMany(slotsToCreate);
    }

    res.status(201).json({
      status: 201,
      message: slotsToCreate.length > 0 ? "Slots created" : "No new slots to create",
      slots: createdSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};